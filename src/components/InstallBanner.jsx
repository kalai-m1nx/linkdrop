import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, ArrowRight, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function InstallBanner({ onOpenModal }) {
  const { isInstalled, hasNativePrompt, promptInstall, isIOS, isAndroid } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // If already installed as PWA, don't show prompt
    if (isInstalled) return;

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('linkdrop_install_dismissed');
    if (isDismissed) return;

    // Smoothly reveal after 1.2s of entering web page
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('linkdrop_install_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (hasNativePrompt) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        setIsVisible(false);
      }
    } else {
      // Open detailed install guide / modal
      onOpenModal();
    }
  };

  if (!isVisible || isInstalled) return null;

  return (
    <aside
      aria-label="Install LinkDrop App"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[420px] z-50 animate-in fade-in slide-in-from-bottom-6 duration-300 pointer-events-auto"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-brand-200/60 dark:border-brand-900/60 shadow-2xl shadow-brand-950/20 p-4 sm:p-5">
        {/* Glow accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-accent-500" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Dismiss"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start space-x-3.5 pr-6">
          {/* App Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 shrink-0">
            <Smartphone className="w-6 h-6 stroke-[2.2]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Install App
              </span>
            </div>
            <h4 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              Install LinkDrop on your phone
            </h4>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Fast 1-tap sharing, background uploads, and offline link history.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setIsVisible(false);
              onOpenModal();
            }}
            className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            More Options
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-brand-500/25 flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Now</span>
              <ArrowRight className="w-3 h-3 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
