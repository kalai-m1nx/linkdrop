import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  ExternalLink,
  Sparkles,
  Save,
  Trash2,
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
} from '../lib/supabase';
import { copyToClipboard } from '../lib/utils';

export function ConfigModal({ isOpen, onClose, onConfigSaved }) {
  const current = getSupabaseCredentials();
  const [url, setUrl] = useState(current.url || '');
  const [key, setKey] = useState(current.key || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url, key);
      setTestResult(res);
    } catch (err) {
      setTestResult({ ok: false, error: err.message || 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    saveSupabaseConfig(url, key);
    if (onConfigSaved) onConfigSaved();
    onClose();
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl('');
    setKey('');
    setTestResult(null);
    if (onConfigSaved) onConfigSaved();
  };

  const copySqlNotice = async () => {
    const notice = `-- Run the SQL located in supabase/schema.sql in your Supabase SQL editor:
-- 1. Go to https://supabase.com/dashboard/project/_/sql
-- 2. Paste and run supabase/schema.sql
-- 3. Run supabase/cleanup_cron.sql for auto-cleanup`;
    await copyToClipboard(notice);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200/60 dark:border-brand-800/60">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Supabase Storage Setup
              </h3>
              <p className="text-xs text-slate-500">Live storage & Postgres backend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Notice */}
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Zero-Config Demo Mode Available:</strong> If credentials are blank, LinkDrop automatically uses local IndexedDB storage, simulated chunked upload, and video streaming for immediate testing!
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Anon / Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Test Result Indicator */}
        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
              testResult.ok
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {testResult.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            )}
            <span>{testResult.message || testResult.error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={handleTest}
            disabled={testing || !url || !key}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
            <span>Test Connection</span>
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Use</span>
          </button>

          {(url || key) && (
            <button
              onClick={handleClear}
              className="py-2.5 px-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
              title="Reset to Demo Mode"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Database Schema Guide */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Schema SQL Setup</span>
            <button
              onClick={copySqlNotice}
              className="text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedSql ? 'Copied instructions!' : 'Copy instructions'}</span>
            </button>
          </div>
          <p className="text-[11px] leading-relaxed">
            The SQL migration files are located at <code className="text-brand-600 dark:text-brand-400">supabase/schema.sql</code> and <code className="text-brand-600 dark:text-brand-400">supabase/cleanup_cron.sql</code>. Execute them in your Supabase SQL editor to create the tables, RLS policies, storage bucket, and auto-cleanup cron job.
          </p>
        </div>
      </div>
    </div>
  );
}
