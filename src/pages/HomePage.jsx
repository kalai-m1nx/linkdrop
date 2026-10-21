import React, { useState, useRef } from 'react';
import { Dropzone } from '../components/Dropzone';
import { FileQueue } from '../components/FileQueue';
import { UploadProgress } from '../components/UploadProgress';
import { ShareModal } from '../components/ShareModal';
import { createDrop } from '../lib/dropService';
import { createResumableUpload } from '../lib/tusUpload';
import { Zap, ShieldCheck, Film, HardDrive } from 'lucide-react';

const STAGES = {
  SELECT: 'SELECT',
  QUEUE: 'QUEUE',
  UPLOADING: 'UPLOADING',
  COMPLETED: 'COMPLETED',
};

export function HomePage() {
  const [stage, setStage] = useState(STAGES.SELECT);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [expiryOption, setExpiryOption] = useState('7d');
  const [dropTitle, setDropTitle] = useState('');

  // Upload progress tracking
  const [fileProgresses, setFileProgresses] = useState({});
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Result state
  const [createdDrop, setCreatedDrop] = useState(null);
  const [createdSlug, setCreatedSlug] = useState('');

  // Active uploader controller ref
  const activeUploaderRef = useRef(null);

  // Handle new files from Dropzone
  const handleFilesSelected = (newFiles) => {
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setStage(STAGES.QUEUE);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) {
        setStage(STAGES.SELECT);
      }
      return updated;
    });
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setStage(STAGES.SELECT);
  };

  // Start upload execution
  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;

    setStage(STAGES.UPLOADING);
    setUploadError(null);
    setCurrentFileIndex(0);
    setIsPaused(false);

    try {
      // 1. Create Drop & File records in Database/Storage
      const { drop, slug, files } = await createDrop({
        files: selectedFiles,
        expiryOption,
        title: dropTitle,
      });

      setCreatedDrop(drop);
      setCreatedSlug(slug);

      // 2. Upload each file using Resumable Chunked Upload
      await uploadFilesSequence(files);

      // 3. Complete!
      setStage(STAGES.COMPLETED);
    } catch (err) {
      console.error('Upload initiation error:', err);
      setUploadError(err.message || 'Failed to start upload');
    }
  };

  // Sequential chunked upload loop
  const uploadFilesSequence = async (preparedFiles) => {
    for (let i = 0; i < preparedFiles.length; i++) {
      setCurrentFileIndex(i);
      const fileItem = preparedFiles[i];

      await new Promise((resolve, reject) => {
        activeUploaderRef.current = createResumableUpload({
          file: fileItem.rawFile,
          storagePath: fileItem.storage_path,
          onProgress: (progress) => {
            setFileProgresses((prev) => ({
              ...prev,
              [i]: { ...progress, status: 'uploading' },
            }));
          },
          onError: (err) => {
            setUploadError(err.message || 'Network error during upload');
            reject(err);
          },
          onSuccess: () => {
            setFileProgresses((prev) => ({
              ...prev,
              [i]: {
                percentage: 100,
                loaded: fileItem.size,
                total: fileItem.size,
                speed: 0,
                eta: 0,
                status: 'complete',
              },
            }));
            resolve();
          },
        });
      });
    }
  };

  const handlePause = () => {
    if (activeUploaderRef.current) {
      activeUploaderRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (activeUploaderRef.current) {
      activeUploaderRef.current.resume();
      setIsPaused(false);
      setUploadError(null);
    }
  };

  const handleCancel = () => {
    if (activeUploaderRef.current) {
      activeUploaderRef.current.abort();
    }
    setStage(STAGES.QUEUE);
    setIsPaused(false);
    setUploadError(null);
  };

  const handleRetry = () => {
    setUploadError(null);
    handleStartUpload();
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setFileProgresses({});
    setCurrentFileIndex(0);
    setCreatedDrop(null);
    setCreatedSlug('');
    setUploadError(null);
    setDropTitle('');
    setStage(STAGES.SELECT);
  };

  // Calculate overall percentage
  const totalFiles = selectedFiles.length || 1;
  const overallPercentage = Math.round(
    Object.values(fileProgresses).reduce((acc, p) => acc + (p?.percentage || 0), 0) / totalFiles
  );

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Hero Header */}
      <section className="text-center space-y-4 max-w-2xl mx-auto pt-4 sm:pt-8">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
          <span>Resumable Chunked Transfer • Up to 1TB</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display leading-[1.15]">
          Share large files & videos <br className="hidden sm:inline" />
          <span className="text-gradient">with a simple link.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto font-normal">
          No account needed for you or your recipient. In-browser 4K video streaming, full photo previews, and auto-destructing links.
        </p>
      </section>

      {/* Main Flow Card */}
      <section className="max-w-2xl mx-auto">
        {stage === STAGES.SELECT && (
          <Dropzone onFilesSelected={handleFilesSelected} />
        )}

        {stage === STAGES.QUEUE && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl">
            <FileQueue
              files={selectedFiles}
              onRemoveFile={handleRemoveFile}
              onClearAll={handleClearAll}
              onAddMore={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.onchange = (e) => {
                  if (e.target.files) {
                    handleFilesSelected(Array.from(e.target.files));
                  }
                };
                input.click();
              }}
              onStartUpload={handleStartUpload}
              expiryOption={expiryOption}
              onChangeExpiry={setExpiryOption}
              dropTitle={dropTitle}
              onChangeTitle={setDropTitle}
            />
          </div>
        )}

        {stage === STAGES.UPLOADING && (
          <UploadProgress
            files={selectedFiles}
            fileProgresses={fileProgresses}
            overallPercentage={overallPercentage}
            currentFileIndex={currentFileIndex}
            isPaused={isPaused}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
            onRetry={handleRetry}
            error={uploadError}
          />
        )}

        {stage === STAGES.COMPLETED && createdDrop && (
          <ShareModal
            drop={createdDrop}
            slug={createdSlug}
            onReset={handleReset}
          />
        )}
      </section>

      {/* Value Proposition Grid */}
      <section className="max-w-4xl mx-auto pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 shadow-sm space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Film className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
            In-Page Video Player
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Recipients stream 4K or 1080p video immediately with native seekable HTML5 controls without having to wait for downloads.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 shadow-sm space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
            Resumable Chunking
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Large uploads (up to 1TB) are split into resilient chunks. If your connection drops, it picks right back up where it stopped.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 shadow-sm space-y-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
            Auto-Purge Expiration
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            1, 7, or 30 days retention. Expired links show friendly explanations, and files are permanently purged automatically.
          </p>
        </div>
      </section>
    </div>
  );
}
