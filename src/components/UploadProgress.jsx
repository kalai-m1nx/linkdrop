import React from 'react';
import {
  Loader2,
  Pause,
  Play,
  XCircle,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  Activity,
  HardDrive,
  FileCheck,
} from 'lucide-react';
import { formatBytes, formatSeconds } from '../lib/utils';

export function UploadProgress({
  files,
  fileProgresses, // { [fileIndex]: { loaded, total, percentage, speed, eta, status, error } }
  overallPercentage,
  currentFileIndex,
  isPaused,
  onPause,
  onResume,
  onCancel,
  onRetry,
  error,
}) {
  const currentFile = files[currentFileIndex] || files[0];
  const currentProgress = fileProgresses[currentFileIndex] || {
    percentage: 0,
    speed: 0,
    eta: 0,
    loaded: 0,
    total: currentFile?.size || 0,
  };

  const totalUploadedBytes = Object.values(fileProgresses).reduce(
    (acc, p) => acc + (p?.loaded || 0),
    0
  );
  const totalAllBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
      {/* Upload Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800/60">
            {isPaused ? (
              <Pause className="w-6 h-6" />
            ) : error ? (
              <AlertCircle className="w-6 h-6 text-rose-500" />
            ) : (
              <Loader2 className="w-6 h-6 animate-spin" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">
              {isPaused
                ? 'Upload Paused'
                : error
                ? 'Upload Interrupted'
                : 'Uploading to Cloud Storage...'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              File {Math.min(currentFileIndex + 1, files.length)} of {files.length} • Resumable chunked transfer
            </p>
          </div>
        </div>

        {/* Action Buttons: Pause/Resume/Cancel */}
        <div className="flex items-center space-x-2">
          {error ? (
            <button
              onClick={onRetry}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          ) : (
            <button
              onClick={isPaused ? onResume : onPause}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title={isPaused ? 'Resume Upload' : 'Pause Upload'}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-500" /> : <Pause className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Cancel Upload"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-700 dark:text-slate-300">Overall Progress</span>
          <span className="text-brand-600 dark:text-brand-400 text-sm font-bold">
            {overallPercentage}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isPaused
                ? 'bg-amber-500'
                : error
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-brand-600 via-indigo-500 to-accent-500'
            }`}
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
          <span>{formatBytes(totalUploadedBytes)} / {formatBytes(totalAllBytes)}</span>
          <span>{files.length} {files.length === 1 ? 'file' : 'files'}</span>
        </div>
      </div>

      {/* Current File Uploading Card */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
            {currentFile?.name}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {currentProgress.percentage}%
          </span>
        </div>

        {/* File Specific Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-200"
            style={{ width: `${currentProgress.percentage}%` }}
          />
        </div>

        {/* Live Upload Metrics (Speed & ETA) */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Speed</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              {currentProgress.speed > 0 ? `${formatBytes(currentProgress.speed)}/s` : '--'}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Remaining ETA</div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              {formatSeconds(currentProgress.eta)}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Protocol</div>
            <div className="text-xs font-bold text-brand-600 dark:text-brand-400 mt-0.5">
              TUS Chunked
            </div>
          </div>
        </div>
      </div>

      {/* Per-file Progress List (for multi-file drops) */}
      {files.length > 1 && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {files.map((file, idx) => {
            const p = fileProgresses[idx] || { percentage: 0 };
            const isDone = p.percentage >= 100;
            const isCurrent = idx === currentFileIndex;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                  isCurrent
                    ? 'bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-800/60'
                    : 'bg-white dark:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center space-x-2 truncate mr-2">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  ) : isCurrent ? (
                    <Activity className="w-3.5 h-3.5 text-brand-500 animate-pulse flex-shrink-0" />
                  ) : (
                    <FileCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  )}
                  <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-[11px] text-slate-400">{formatBytes(file.size)}</span>
                  <span
                    className={`font-semibold ${
                      isDone
                        ? 'text-emerald-500'
                        : isCurrent
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {p.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Upload paused due to network error: {error}. Click Retry to continue.</span>
        </div>
      )}
    </div>
  );
}
