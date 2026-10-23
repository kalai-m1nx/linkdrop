import React, { useState } from 'react';
import { X, Smartphone, Download, Share2, PlusSquare, Monitor, CheckCircle2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function InstallModal({ isOpen, onClose }) {
  const { hasNativePrompt, promptInstall, isIOS, isAndroid, isInstalled } = usePWAInstall();
  const [activeTab, setActiveTab] = useState('pwa'); // 'pwa' | 'apk' | 'qr'
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://linkdrop-amber.vercel.app';

  const handlePwaInstall = async () => {
    if (hasNativePrompt) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
            title="Close"
            aria-label="Close install dialog"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 id="install-modal-title" className="text-xl font-bold font-display tracking-tight">
                Install LinkDrop
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                Fast, private sharing right from your device
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mt-5">
            <button
              onClick={() => setActiveTab('pwa')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'pwa'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Instant App (PWA)
            </button>
            <button
              onClick={() => setActiveTab('apk')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'apk'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Android APK
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'qr'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              Scan Phone QR
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {installSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">LinkDrop Installed!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You can now open LinkDrop anytime directly from your home screen or app launcher.
              </p>
            </div>
          ) : activeTab === 'pwa' ? (
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900">
                <div className="p-2 rounded-xl bg-brand-600 text-white shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-900 dark:text-brand-300">
                    Works on Android, iOS, Windows & Mac
                  </h4>
                  <p className="text-[11px] text-brand-800 dark:text-brand-400 mt-0.5">
                    No App Store or Play Store needed. Installs instantly without taking up storage.
                  </p>
                </div>
              </div>

              {hasNativePrompt ? (
                <button
                  onClick={handlePwaInstall}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>Install LinkDrop Now</span>
                </button>
              ) : isIOS ? (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-white">
                    How to install on iPhone / iPad:
                  </h5>
                  <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-300 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </span>
                    <span>Tap the Safari <strong>Share</strong> button <Share2 className="w-3.5 h-3.5 inline mx-1" /> at the bottom.</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-300 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </span>
                    <span>Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline mx-1" />.</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-slate-600 dark:text-slate-300">
                    <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-300 flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </span>
                    <span>Tap <strong>Add</strong> in the top right corner. Done!</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h5 className="text-xs font-semibold text-slate-900 dark:text-white">
                    Install in your Browser:
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    In Chrome or Edge, click the <strong>Install</strong> icon <Download className="w-3.5 h-3.5 inline mx-1 text-brand-500" /> on the right side of the address bar.
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    On Android Chrome: Tap the <strong>three dots menu (⋮)</strong> and tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </p>
                </div>
              )}
            </div>
          ) : activeTab === 'apk' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    LinkDrop Android Package
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Native Flutter APK with system file picker and native share sheet
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                      v1.0.0 Release
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-medium">
                      Direct Install
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400">
                  <Smartphone className="w-6 h-6" />
                </div>
              </div>

              <a
                href="/linkdrop.apk"
                download="LinkDrop.apk"
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download Android APK</span>
              </a>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                When prompted on Android, allow <em>"Install unknown apps"</em> for your browser to complete installation.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-2 space-y-3">
              <div className="p-3 rounded-2xl bg-white shadow-md border border-slate-200">
                <QRCodeSVG
                  value={currentUrl}
                  size={160}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Scan with your phone's camera
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs">
                Opens LinkDrop on your phone browser where you can tap <strong>Install</strong> to add it to your home screen immediately!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
