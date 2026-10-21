import * as tus from 'tus-js-client';
import { getSupabaseCredentials, isSupabaseConfigured, BUCKET_NAME } from './supabase';

/**
 * Perform resumable chunked upload to Supabase Storage using TUS protocol.
 * Falls back to simulated chunked upload if Supabase credentials are not configured.
 *
 * @param {Object} options
 * @param {File} options.file - Raw File object
 * @param {string} options.storagePath - Path in Supabase bucket
 * @param {Function} options.onProgress - Callback ({ loaded, total, percentage, speed, eta })
 * @param {Function} options.onError - Callback (error)
 * @param {Function} options.onSuccess - Callback ()
 * @returns {Object} { pause, resume, abort }
 */
export function createResumableUpload({
  file,
  storagePath,
  onProgress = () => {},
  onError = () => {},
  onSuccess = () => {},
}) {
  const isLive = isSupabaseConfigured();

  if (!isLive) {
    // Run client-side chunked upload simulation for demo mode
    return createSimulatedChunkedUpload({
      file,
      onProgress,
      onError,
      onSuccess,
    });
  }

  const { url, key } = getSupabaseCredentials();
  const endpoint = `${url}/storage/v1/upload/resumable`;

  let lastBytes = 0;
  let lastTime = Date.now();
  let currentSpeed = 0;

  const upload = new tus.Upload(file, {
    endpoint,
    retryDelays: [0, 1000, 3000, 5000],
    headers: {
      authorization: `Bearer ${key}`,
      apikey: key,
      'x-upsert': 'true',
    },
    uploadDataDuringCreation: true,
    removeFingerprintOnSuccess: true,
    metadata: {
      bucketName: BUCKET_NAME,
      objectName: storagePath,
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
    },
    chunkSize: 6 * 1024 * 1024, // 6MB chunk size recommended for Supabase
    onError: (error) => {
      console.error('TUS upload error:', error);
      onError(error);
    },
    onProgress: (bytesUploaded, bytesTotal) => {
      const now = Date.now();
      const elapsed = (now - lastTime) / 1000;
      if (elapsed > 0.5) {
        currentSpeed = (bytesUploaded - lastBytes) / elapsed;
        lastBytes = bytesUploaded;
        lastTime = now;
      }
      const remainingBytes = bytesTotal - bytesUploaded;
      const eta = currentSpeed > 0 ? remainingBytes / currentSpeed : 0;
      const percentage = bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0;

      onProgress({
        loaded: bytesUploaded,
        total: bytesTotal,
        percentage,
        speed: currentSpeed,
        eta,
      });
    },
    onSuccess: () => {
      onProgress({
        loaded: file.size,
        total: file.size,
        percentage: 100,
        speed: 0,
        eta: 0,
      });
      onSuccess();
    },
  });

  // Start the upload
  upload.start();

  return {
    pause: () => upload.abort(),
    resume: () => upload.start(),
    abort: () => upload.abort(),
  };
}

/**
 * Simulated chunked upload for Demo mode (when Supabase is not yet configured)
 */
function createSimulatedChunkedUpload({ file, onProgress, onError, onSuccess }) {
  let isPaused = false;
  let isAborted = false;
  let uploadedBytes = 0;
  const totalBytes = file.size || 1024 * 1024; // fallback size

  // Target upload time: 1.5 to 3.5 seconds depending on file size for snappy demo feel
  const durationMs = Math.min(3500, Math.max(1200, Math.log10(totalBytes + 1) * 350));
  const intervalMs = 100;
  const stepBytes = totalBytes / (durationMs / intervalMs);

  let lastTime = Date.now();
  let timerId = null;

  function tick() {
    if (isPaused || isAborted) return;

    uploadedBytes = Math.min(totalBytes, uploadedBytes + stepBytes * (0.8 + Math.random() * 0.4));
    const now = Date.now();
    const elapsed = (now - lastTime) / 1000;
    const speed = elapsed > 0 ? (stepBytes / elapsed) * 2 : 1024 * 1024 * 5;
    lastTime = now;

    const remainingBytes = totalBytes - uploadedBytes;
    const eta = speed > 0 ? remainingBytes / speed : 0;
    const percentage = Math.min(100, Math.round((uploadedBytes / totalBytes) * 100));

    onProgress({
      loaded: Math.round(uploadedBytes),
      total: totalBytes,
      percentage,
      speed,
      eta,
    });

    if (uploadedBytes >= totalBytes) {
      clearInterval(timerId);
      onSuccess();
    }
  }

  timerId = setInterval(tick, intervalMs);

  return {
    pause: () => {
      isPaused = true;
      clearInterval(timerId);
    },
    resume: () => {
      if (isAborted) return;
      isPaused = false;
      lastTime = Date.now();
      timerId = setInterval(tick, intervalMs);
    },
    abort: () => {
      isAborted = true;
      clearInterval(timerId);
    },
  };
}
