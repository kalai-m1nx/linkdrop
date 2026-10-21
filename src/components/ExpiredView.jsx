import React from 'react';
import { Hourglass, ShieldCheck, ArrowRight, HardDriveDownload } from 'lucide-react';

export function ExpiredView({ expiresAt, isNotFound = false }) {
  const formattedDate = expiresAt
    ? new Date(expiresAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="max-w-xl mx-auto p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl text-center space-y-6">
      {/* Icon Badge */}
      <div className="w-20 h-20 rounded-3xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
        <Hourglass className="w-10 h-10 animate-pulse" />
      </div>

      {/* Message */}
      <div className="space-y-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          {isNotFound ? 'LinkDrop Not Found' : 'This LinkDrop Has Expired'}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          {isNotFound
            ? 'The link you opened does not exist or may have already been removed.'
            : `To protect privacy and minimize cloud storage, files shared through LinkDrop automatically expire and are securely deleted${
                formattedDate ? ` (expired on ${formattedDate})` : ''
              }.`}
        </p>
      </div>

      {/* Privacy note */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span>All associated files and database records are automatically purged.</span>
      </div>

      {/* Action */}
      <div className="pt-2">
        <a
          href="/"
          className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-105 active:scale-95"
        >
          <HardDriveDownload className="w-4 h-4" />
          <span>Send Your Own Files</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </a>
      </div>
    </div>
  );
}
