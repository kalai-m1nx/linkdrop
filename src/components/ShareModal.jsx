import React, { useState, useEffect } from 'react';
import {
  Check,
  Copy,
  Share2,
  ExternalLink,
  QrCode,
  Clock,
  Sparkles,
  Send,
  PlusCircle,
  FileCheck,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { copyToClipboard, formatBytes } from '../lib/utils';

export function ShareModal({ drop, slug, onReset }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/s/${slug}`
    : `/s/${slug}`;

  // Fire celebratory confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#3b82f6', '#10b981'],
      });
    } catch (e) {
      // ignore
    }
  }, []);

  const handleCopy = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: drop.title || 'LinkDrop File Share',
          text: `Download files (${formatBytes(drop.total_size)}) shared via LinkDrop:`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Download ${drop.title || 'files'} (${formatBytes(drop.total_size)}) shared via LinkDrop:\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const formattedExpiry = new Date(drop.expires_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl space-y-7 animate-in fade-in zoom-in-95 duration-300">
      {/* Success Badge */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 scale-100 animate-pulse-subtle">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Your Link is Ready!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Anyone with this link can view photos, stream videos, or download all files. No login needed.
        </p>
      </div>

      {/* Share Link Box */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Shareable URL</span>
          <span className="text-brand-600 dark:text-brand-400 font-bold">/s/{slug}</span>
        </label>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            onClick={(e) => e.target.select()}
            className="flex-1 px-3.5 py-2.5 text-sm font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none select-all"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center space-x-1.5 transition-all shadow-sm ${
              copied
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20 active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {/* WhatsApp Button */}
        <button
          onClick={handleWhatsAppShare}
          className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 flex items-center justify-center space-x-2 text-xs font-semibold transition-all group"
        >
          <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>WhatsApp</span>
        </button>

        {/* Web Share API */}
        <button
          onClick={handleNativeShare}
          className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100/80 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/70 text-indigo-800 dark:text-indigo-300 flex items-center justify-center space-x-2 text-xs font-semibold transition-all group"
        >
          <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>Share Sheet</span>
        </button>

        {/* QR Code Toggle */}
        <button
          onClick={() => setShowQr(!showQr)}
          className={`p-3 rounded-2xl col-span-2 sm:col-span-1 border flex items-center justify-center space-x-2 text-xs font-semibold transition-all ${
            showQr
              ? 'bg-brand-500 text-white border-brand-500'
              : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>{showQr ? 'Hide QR' : 'Show QR'}</span>
        </button>
      </div>

      {/* QR Code Display Card */}
      {showQr && (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center space-y-3 animate-in fade-in duration-200">
          <div className="p-3 bg-white rounded-xl shadow-md">
            <QRCodeSVG value={shareUrl} size={160} level="M" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Scan with phone camera to open LinkDrop directly
          </p>
        </div>
      )}

      {/* Expiry & Meta summary */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
          <Clock className="w-4 h-4 text-brand-500" />
          <span>Expires on <strong className="text-slate-800 dark:text-slate-200">{formattedExpiry}</strong></span>
        </div>
        <div className="flex items-center space-x-1.5 text-slate-500">
          <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{drop.file_count || 1} files ({formatBytes(drop.total_size)})</span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-colors"
        >
          <span>Preview Download Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <button
          onClick={onReset}
          className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Drop More Files</span>
        </button>
      </div>
    </div>
  );
}
