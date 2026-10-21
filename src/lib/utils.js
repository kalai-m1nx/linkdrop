/**
 * Utility functions for LinkDrop
 */

/**
 * Format bytes into human-readable string (up to TB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0 || bytes === '0' || !bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0) return '0 B';
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i] || 'TB'}`;
}

/**
 * Format seconds into a friendly duration string (for ETA)
 */
export function formatSeconds(sec) {
  if (!sec || isNaN(sec) || !isFinite(sec) || sec <= 0) return '--';
  const s = Math.round(sec);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const remS = s % 60;
  if (m < 60) return `${m}m ${remS}s`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return `${h}h ${remM}m`;
}

/**
 * Generate a clean, URL-safe random slug
 */
export function generateSlug(length = 8) {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'; // Avoid confusing chars like 0/o, 1/l
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Determine file category from MIME type or file extension
 */
export function getFileCategory(mimeType = '', fileName = '') {
  const mime = (mimeType || '').toLowerCase();
  const ext = (fileName.split('.').pop() || '').toLowerCase();

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext)) {
    return 'image';
  }
  if (mime.startsWith('video/') || ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', 'wmv'].includes(ext)) {
    return 'video';
  }
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) {
    return 'audio';
  }
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'csv'].includes(ext)) {
    return 'document';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return 'archive';
  }
  return 'file';
}

/**
 * Calculate expiry date from expiry option ('1d', '7d', '30d')
 */
export function calculateExpiry(option = '7d') {
  const now = new Date();
  if (option === '1d') {
    now.setDate(now.getDate() + 1);
  } else if (option === '30d') {
    now.setDate(now.getDate() + 30);
  } else {
    // default 7 days
    now.setDate(now.getDate() + 7);
  }
  return now.toISOString();
}

/**
 * Sanitize filename to avoid S3/Supabase storage path issues
 */
export function sanitizeFileName(name) {
  return (name || 'file')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_');
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  const successful = document.execCommand('copy');
  textArea.remove();
  return successful;
}
