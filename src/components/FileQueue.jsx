import React, { useState, useEffect } from 'react';
import {
  X,
  File,
  Image as ImageIcon,
  FileVideo,
  FileArchive,
  FileText,
  Music,
  Clock,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { formatBytes, getFileCategory } from '../lib/utils';

export function FileQueue({
  files,
  onRemoveFile,
  onClearAll,
  onAddMore,
  onStartUpload,
  expiryOption,
  onChangeExpiry,
  dropTitle,
  onChangeTitle,
}) {
  const [thumbnails, setThumbnails] = useState({});

  // Generate thumbnail previews for images and videos
  useEffect(() => {
    const urls = {};
    files.forEach((file, index) => {
      const category = getFileCategory(file.type, file.name);
      if (category === 'image' || category === 'video') {
        try {
          urls[index] = URL.createObjectURL(file);
        } catch (e) {
          // ignore error for non-blob files
        }
      }
    });
    setThumbnails(urls);

    // Clean up created URLs on unmount/change
    return () => {
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-sky-500" />;
      case 'video':
        return <FileVideo className="w-5 h-5 text-rose-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-emerald-500" />;
      case 'archive':
        return <FileArchive className="w-5 h-5 text-amber-500" />;
      case 'document':
        return <FileText className="w-5 h-5 text-indigo-500" />;
      default:
        return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* File List Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">
            Selected Files ({files.length})
          </h3>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
            {formatBytes(totalSize)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onAddMore}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add more</span>
          </button>
          <button
            onClick={onClearAll}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/50 dark:border-rose-900/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Files Scrollable Container */}
      <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
        {files.map((file, idx) => {
          const category = getFileCategory(file.type, file.name);
          const thumb = thumbnails[idx];

          return (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:border-brand-300 dark:hover:border-brand-600 transition-all group"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1 mr-3">
                {/* Thumbnail or Category Icon */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0 flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 relative">
                  {category === 'image' && thumb ? (
                    <img src={thumb} alt={file.name} className="w-full h-full object-cover" />
                  ) : category === 'video' && thumb ? (
                    <video src={thumb} className="w-full h-full object-cover" muted />
                  ) : (
                    getCategoryIcon(category)
                  )}
                </div>

                {/* File Details */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatBytes(file.size)}</span>
                    <span>•</span>
                    <span className="uppercase text-[10px] tracking-wider font-semibold">
                      {file.name.split('.').pop() || 'file'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemoveFile(idx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Options & Metadata Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
        {/* Drop Title (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Share Title (Optional)
          </label>
          <input
            type="text"
            placeholder={files.length === 1 ? files[0].name : 'e.g. Vacation Photos & 4K Video'}
            value={dropTitle}
            onChange={(e) => onChangeTitle(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Expiry Selector (1 day / 7 days / 30 days) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-500" />
              <span>Link Expiration</span>
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Files auto-delete afterwards
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '1d', label: '1 Day', desc: 'Quick Share' },
              { id: '7d', label: '7 Days', desc: 'Default' },
              { id: '30d', label: '30 Days', desc: 'Extended' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeExpiry(opt.id)}
                className={`py-2 px-3 rounded-xl text-center border transition-all ${
                  expiryOption === opt.id
                    ? 'border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold">{opt.label}</div>
                <div
                  className={`text-[10px] ${
                    expiryOption === opt.id ? 'text-brand-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onStartUpload}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-500 hover:from-brand-500 hover:to-accent-600 text-white font-semibold text-base shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 group hover:scale-[1.01] active:scale-[0.99] transition-all"
      >
        <span>Upload & Generate Link</span>
        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
