import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ConfigModal } from './components/ConfigModal';
import { HelpModal } from './components/HelpModal';
import { HomePage } from './pages/HomePage';
import { DownloadPage } from './pages/DownloadPage';
import { useTheme } from './hooks/useTheme';

export function App() {
  const { isDark, toggleTheme } = useTheme();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Simple, robust client-side URL routing
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Determine if this is a share URL: /s/:slug
  const shareMatch = currentPath.match(/^\/s\/([a-zA-Z0-9_-]+)/);
  const dropSlug = shareMatch ? shareMatch[1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-brand-500/15 via-accent-500/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-brand-500/5 blur-3xl pointer-events-none -z-10" />

      {/* Navigation */}
      <Navbar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {dropSlug ? (
          <DownloadPage slug={dropSlug} />
        ) : (
          <HomePage />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>LinkDrop — Fast, private large file & video sharing.</p>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              How it works
            </button>
            <span>•</span>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              Supabase Storage
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigSaved={() => {
          // Trigger re-render to update connection badges
          window.dispatchEvent(new Event('storage'));
        }}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}

export default App;
