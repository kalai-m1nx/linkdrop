import React, { useState } from 'react';
import {
  Download,
  Eye,
  File,
  FileArchive,
  FileText,
  FileVideo,
  Image as ImageIcon,
  Music,
  Maximize2,
  X,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { formatBytes, getFileCategory } from '../lib/utils';

export function MediaPreview({ files, onFileDownloaded }) {
  const [activeLightboxImage, setActiveLightboxImage] = useState(null);

  const handleDownloadClick = (file) => {
    if (onFileDownloaded) {
      onFileDownloaded(file);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-6 h-6 text-sky-500" />;
      case 'video':
        return <FileVideo className="w-6 h-6 text-rose-500" />;
      case 'audio':
        return <Music className="w-6 h-6 text-emerald-500" />;
      case 'archive':
        return <FileArchive className="w-6 h-6 text-amber-500" />;
      case 'document':
        return <FileText className="w-6 h-6 text-indigo-500" />;
      default:
        return <File className="w-6 h-6 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Media Grid */}
      <div className="grid grid-cols-1 gap-6">
        {files.map((file, idx) => {
          const category = getFileCategory(file.file_type, file.file_name);
          const previewSrc = file.previewUrl || file.downloadUrl;

          return (
            <div
              key={file.id || idx}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
            >
              {/* VIDEO PLAYER PREVIEW */}
              {category === 'video' && (
                <div className="bg-black/95 relative group">
                  <video
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full max-h-[500px] object-contain mx-auto aspect-video"
                    src={previewSrc}
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/60 text-white backdrop-blur-md border border-white/20 flex items-center space-x-1">
                      <Play className="w-3 h-3 text-rose-400 fill-rose-400" />
                      <span>Streaming Video</span>
                    </span>
                  </div>
                </div>
              )}

              {/* PHOTO PREVIEW */}
              {category === 'image' && (
                <div className="relative group bg-slate-950/5 dark:bg-slate-950/40 overflow-hidden flex items-center justify-center max-h-[460px]">
                  <img
                    src={previewSrc}
                    alt={file.file_name}
                    className="w-full h-auto max-h-[460px] object-contain cursor-zoom-in group-hover:scale-[1.01] transition-transform duration-300"
                    onClick={() => setActiveLightboxImage(previewSrc)}
                  />
                  {/* Lightbox trigger overlay */}
                  <button
                    onClick={() => setActiveLightboxImage(previewSrc)}
                    className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1.5 text-xs font-medium"
                    title="View Full Resolution"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand</span>
                  </button>
                </div>
              )}

              {/* AUDIO PLAYER PREVIEW */}
              {category === 'audio' && (
                <div className="p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-950/30 dark:to-indigo-950/30 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                      <Music className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {file.file_name}
                      </p>
                      <p className="text-xs text-slate-500">Audio Stream</p>
                    </div>
                  </div>
                  <audio controls className="w-full" src={previewSrc}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              {/* FILE METADATA & FORCED DOWNLOAD BAR */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900">
                <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                    {getCategoryIcon(category)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 truncate" title={file.file_name}>
                      {file.file_name}
                    </h4>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {formatBytes(file.file_size)}
                      </span>
                      <span>•</span>
                      <span className="uppercase text-[10px] tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {file.file_name.split('.').pop() || 'file'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Forced Download CTA */}
                <a
                  href={file.downloadUrl || previewSrc}
                  download={file.file_name}
                  onClick={() => handleDownloadClick(file)}
                  className="px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95 group flex-shrink-0"
                >
                  <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal for Photos */}
      {activeLightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveLightboxImage(null)}
        >
          <button
            onClick={() => setActiveLightboxImage(null)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
            title="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activeLightboxImage}
            alt="Full Preview"
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
