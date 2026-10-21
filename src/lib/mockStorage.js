/**
 * Mock Storage & Database service for LinkDrop
 * Allows full local testing using IndexedDB + Blob URLs when Supabase is not yet configured.
 */

const DB_NAME = 'linkdrop_mock_db';
const DB_VERSION = 1;
const STORE_DROPS = 'drops';
const STORE_FILES = 'files';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_DROPS)) {
        const dropStore = db.createObjectStore(STORE_DROPS, { keyPath: 'slug' });
        dropStore.createIndex('id', 'id', { unique: true });
      }
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        const fileStore = db.createObjectStore(STORE_FILES, { keyPath: 'id' });
        fileStore.createIndex('drop_id', 'drop_id', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save drop and files to mock IndexedDB
 */
export async function mockSaveDrop(dropData, fileList) {
  const db = await openDB();
  const tx = db.transaction([STORE_DROPS, STORE_FILES], 'readwrite');
  const dropStore = tx.objectStore(STORE_DROPS);
  const fileStore = tx.objectStore(STORE_FILES);

  // Store drop
  dropStore.put(dropData);

  // Store files
  for (const f of fileList) {
    fileStore.put({
      id: f.id,
      drop_id: dropData.id,
      file_name: f.name,
      file_size: f.size,
      file_type: f.type,
      storage_path: f.storage_path,
      created_at: new Date().toISOString(),
      blob: f.rawFile || null, // store actual Blob for mock playback & download
    });
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(dropData);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Fetch drop and files by slug
 */
export async function mockGetDropBySlug(slug) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_DROPS, STORE_FILES], 'readonly');
    const dropStore = tx.objectStore(STORE_DROPS);
    const dropReq = dropStore.get(slug);

    dropReq.onsuccess = () => {
      const drop = dropReq.result;
      if (!drop) {
        resolve(null);
        return;
      }

      // Check expiry
      if (new Date(drop.expires_at) <= new Date()) {
        resolve({ ...drop, is_expired: true, files: [] });
        return;
      }

      // Fetch files
      const fileStore = tx.objectStore(STORE_FILES);
      const fileIndex = fileStore.index('drop_id');
      const filesReq = fileIndex.getAll(drop.id);

      filesReq.onsuccess = () => {
        const files = (filesReq.result || []).map((fileRecord) => {
          let previewUrl = null;
          let downloadUrl = null;

          if (fileRecord.blob) {
            previewUrl = URL.createObjectURL(fileRecord.blob);
            downloadUrl = previewUrl;
          }

          return {
            id: fileRecord.id,
            file_name: fileRecord.file_name,
            file_size: fileRecord.file_size,
            file_type: fileRecord.file_type,
            storage_path: fileRecord.storage_path,
            previewUrl,
            downloadUrl,
            blob: fileRecord.blob,
          };
        });

        resolve({
          ...drop,
          files,
        });
      };

      filesReq.onerror = () => reject(filesReq.error);
    };

    dropReq.onerror = () => reject(dropReq.error);
  });
}
