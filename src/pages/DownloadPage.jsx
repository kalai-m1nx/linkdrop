import React, { useState, useEffect } from 'react';
import {
  Download,
  Loader2,
  Clock,
  Archive,
  HardDriveDownload,
  FileCheck,
  CheckCircle2,
  Shield,
  Sparkles,
} from 'lucide-react';
import JSZip from 'jszip';
import { getDropBySlug, trackDownload } from '../lib/dropService';
import { MediaPreview } from '../components/MediaPreview';
import { ExpiredView } from '../components/ExpiredView';
import { formatBytes, formatSeconds } from '../lib/utils';

export function DownloadPage({ slug }) {
  const [loading, setLoading] = useState(true);
  const [drop, setDrop] = useState(null);
  const [error, setError] = useState(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  useEffect(() => {
    async function fetchDrop() {
      if (!slug) {
        setLoading(false);
        setError('No drop slug provided');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getDropBySlug(slug);
        setDrop(data);
      } catch (err) {
        console.error('Failed to load drop:', err);
        setError(err.message || 'Failed to load files');
      } finally {
        setLoading(false);
      }
    }

    fetchDrop();
  }, [slug]);

  // Handle single file downloaded
  const handleFileDownloaded = async (file) => {
    if (drop?.id) {
      trackDownload(drop.id);
    }
  };

  // Handle "Download All" (Bundles files using JSZip)
  const handleDownloadAll = async () => {
    if (!drop || !drop.files || drop.files.length === 0) return;

    // If only 1 file, just trigger that single download
    if (drop.files.length === 1) {
      const singleFile = drop.files[0];
      const link = document.createElement('a');
      link.href = singleFile.downloadUrl || singleFile.previewUrl;
      link.download = singleFile.file_name;
      link.click();
      handleFileDownloaded(singleFile);
      return;
    }

    // Multiple files: generate a ZIP client-side
    setIsZipping(true);
    setZipProgress(0);

    try {
      const zip = new JSZip();
      const files = drop.files;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = file.downloadUrl || file.previewUrl;

        // Fetch file blob
        const response = await fetch(url);
        const blob = await response.blob();
        zip.file(file.file_name, blob);

        setZipProgress(Math.round(((i + 1) / files.length) * 80));
      }

      // Generate the zip file
      const zipBlob = await zip.generateAsync(
        { type: 'blob' },
        (metadata) => {
          setZipProgress(80 + Math.round(metadata.percent * 0.2));
        }
      );

      // Trigger download
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${drop.title || 'LinkDrop'}_files.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      if (drop.id) {
        trackDownload(drop.id);
      }
    } catch (err) {
      console.error('Failed to bundle files into ZIP:', err);
      alert('Unable to bundle files automatically. Please download individual files below.');
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto border border-brand-200/60 dark:border-brand-800/60 animate-pulse">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-display">
          Locating LinkDrop...
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Verifying security signature and fetching file metadata
        </p>
      </div>
    );
  }

  // EXPIRED STATE
  if (drop?.isExpired) {
    return <ExpiredView expiresAt={drop.expires_at} />;
  }

  // NOT FOUND STATE
  if (drop?.notFound || error) {
    return <ExpiredView isNotFound={true} />;
  }

  const formattedExpiry = new Date(drop.expires_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const files = drop.files || [];
  const totalSize = drop.total_size || files.reduce((acc, f) => acc + (f.file_size || 0), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Drop Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center space-x-2 text-xs text-brand-600 dark:text-brand-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LinkDrop Share</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
              {drop.title || 'Shared Files'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {files.length} {files.length === 1 ? 'file' : 'files'} • {formatBytes(totalSize)}
            </p>
          </div>

          {/* Download All CTA */}
          <button
            onClick={handleDownloadAll}
            disabled={isZipping || files.length === 0}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-500 hover:from-brand-500 hover:to-accent-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isZipping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Zipping ({zipProgress}%)...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{files.length > 1 ? 'Download All (.zip)' : 'Download File'}</span>
              </>
            )}
          </button>
        </div>

        {/* Expiration & Security Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-brand-500" />
            <span>
              Expires on <strong className="text-slate-700 dark:text-slate-300">{formattedExpiry}</strong>
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400">
            <Shield className="w-3.5 h-3.5" />
            <span>Direct signed URLs (Content-Disposition: attachment)</span>
          </div>
        </div>
      </div>

      {/* Files & Media Previews */}
      <MediaPreview files={files} onFileDownloaded={handleFileDownloaded} />

      {/* Footer Info */}
      <div className="text-center pt-6 pb-12">
        <a
          href="/"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center justify-center space-x-1.5"
        >
          <HardDriveDownload className="w-3.5 h-3.5" />
          <span>Need to send large files yourself? Use LinkDrop for free</span>
        </a>
      </div>
    </div>
  );
}
