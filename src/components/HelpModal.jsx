import React from 'react';
import { X, Zap, Shield, Eye, Clock, HardDrive, CheckCircle2 } from 'lucide-react';

export function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
            How LinkDrop Works
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-slate-800 dark:text-slate-100 text-sm mb-0.5">
                Resumable 1TB Uploads
              </strong>
              Uses the open TUS protocol to slice large videos and files into chunks. If your Wi-Fi or mobile network drops, uploads automatically resume where they left off.
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-slate-800 dark:text-slate-100 text-sm mb-0.5">
                Instant In-Browser Streaming
              </strong>
              Recipients can stream 4K/1080p videos directly in Chrome without downloading gigabytes of data first. Photos display in full-resolution lightboxes.
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-slate-800 dark:text-slate-100 text-sm mb-0.5">
                Self-Destructing Links
              </strong>
              Choose 1, 7, or 30 days. When the countdown completes, automated database schedules erase both records and physical storage objects.
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <strong className="block text-slate-800 dark:text-slate-100 text-sm mb-0.5">
                Secure Signed URLs
              </strong>
              Files are stored in private buckets. Access is granted only via time-limited signed URLs that enforce direct attachments on download.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}
