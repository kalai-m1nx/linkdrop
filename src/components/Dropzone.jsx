import React, { useState, useRef } from 'react';
import { UploadCloud, FileVideo, Image as ImageIcon, FileArchive, ShieldCheck, Zap } from 'lucide-react';

export function Dropzone({ onFilesSelected, disabled = false }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      onFilesSelected(droppedFiles);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      onFilesSelected(selectedFiles);
      // Reset input value so same files can be re-selected if removed
      e.target.value = '';
    }
  };

  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
      className={`relative group rounded-3xl cursor-pointer p-8 sm:p-12 text-center transition-all duration-300 border-2 border-dashed ${
        isDragOver
          ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 scale-[1.01] shadow-2xl shadow-brand-500/20'
          : 'border-slate-300/80 dark:border-slate-700/80 bg-white/60 dark:bg-slate-900/40 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-white/90 dark:hover:bg-slate-900/70 shadow-xl shadow-slate-200/50 dark:shadow-none'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Decorative background glow on hover */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-500/10 via-accent-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl pointer-events-none" />

      <div className="relative flex flex-col items-center justify-center space-y-4">
        {/* Animated Upload Icon */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
            isDragOver
              ? 'bg-brand-600 text-white scale-110 rotate-3 shadow-brand-500/40'
              : 'bg-gradient-to-br from-brand-500 to-indigo-600 text-white group-hover:scale-105 group-hover:shadow-brand-500/30'
          }`}
        >
          <UploadCloud className="w-10 h-10 stroke-[2.2] animate-bounce" style={{ animationDuration: '2.5s' }} />
        </div>

        {/* Text Instructions */}
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-display">
            {isDragOver ? 'Drop your files here!' : 'Drag & drop files or videos'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            or <span className="text-brand-600 dark:text-brand-400 font-semibold underline underline-offset-2">browse from your device</span>
          </p>
        </div>

        {/* Features / Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 max-w-lg">
          <span className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <FileVideo className="w-3.5 h-3.5 text-rose-500" />
            <span>4K/8K Videos</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <ImageIcon className="w-3.5 h-3.5 text-sky-500" />
            <span>Photos & RAW</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <FileArchive className="w-3.5 h-3.5 text-amber-500" />
            <span>Zip, ISO & Docs</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <Zap className="w-3.5 h-3.5 text-indigo-500" />
            <span>Resumable (Up to 1TB)</span>
          </span>
          <span className="inline-flex items-center space-x-1.5 text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Auto-Expiring</span>
          </span>
        </div>
      </div>
    </div>
  );
}
