import { getSupabaseClient, isSupabaseConfigured, BUCKET_NAME } from './supabase';
import { mockSaveDrop, mockGetDropBySlug } from './mockStorage';
import { generateSlug, calculateExpiry, sanitizeFileName } from './utils';

/**
 * Creates a new Drop and associated file records
 */
export async function createDrop({ files, expiryOption = '7d', title = '' }) {
  const isLive = isSupabaseConfigured();
  const slug = generateSlug(8);
  const expiresAt = calculateExpiry(expiryOption);
  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const dropId = crypto.randomUUID ? crypto.randomUUID() : `drop_${Date.now()}`;

  const preparedFiles = files.map((f, idx) => {
    const fileId = crypto.randomUUID ? crypto.randomUUID() : `f_${Date.now()}_${idx}`;
    const cleanName = sanitizeFileName(f.name);
    const storagePath = `${dropId}/${fileId}_${cleanName}`;

    return {
      id: fileId,
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
      storage_path: storagePath,
      rawFile: f,
    };
  });

  const dropRecord = {
    id: dropId,
    slug,
    title: title || (files.length === 1 ? files[0].name : `${files.length} files`),
    total_size: totalSize,
    file_count: files.length,
    download_count: 0,
    created_at: new Date().toISOString(),
    expires_at: expiresAt,
  };

  if (!isLive) {
    // Store in mock storage
    await mockSaveDrop(dropRecord, preparedFiles);
    return {
      drop: dropRecord,
      slug,
      files: preparedFiles,
      isDemo: true,
    };
  }

  // Live Supabase
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client not initialized');

  // Insert drop
  const { data: insertedDrop, error: dropError } = await client
    .from('drops')
    .insert([
      {
        id: dropId,
        slug,
        title: dropRecord.title,
        total_size: totalSize,
        file_count: files.length,
        expires_at: expiresAt,
      },
    ])
    .select()
    .single();

  if (dropError) {
    console.error('Error creating drop record:', dropError);
    throw new Error(dropError.message || 'Failed to create drop');
  }

  // Insert drop_files
  const filesPayload = preparedFiles.map((f) => ({
    id: f.id,
    drop_id: dropId,
    file_name: f.name,
    file_size: f.size,
    file_type: f.type,
    storage_path: f.storage_path,
  }));

  const { error: filesError } = await client.from('drop_files').insert(filesPayload);

  if (filesError) {
    console.error('Error creating file records:', filesError);
    throw new Error(filesError.message || 'Failed to record files');
  }

  return {
    drop: insertedDrop,
    slug,
    files: preparedFiles,
    isDemo: false,
  };
}

/**
 * Fetch a Drop by slug along with its files and signed URLs
 */
export async function getDropBySlug(slug) {
  const isLive = isSupabaseConfigured();

  if (!isLive) {
    const mockDrop = await mockGetDropBySlug(slug);
    if (!mockDrop) return { notFound: true };
    if (mockDrop.is_expired) return { isExpired: true, expires_at: mockDrop.expires_at };
    return { ...mockDrop, isDemo: true };
  }

  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase client unavailable');

  // Fetch drop
  const { data: drop, error: dropError } = await client
    .from('drops')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (dropError) {
    console.error('Error fetching drop:', dropError);
    throw new Error(dropError.message);
  }

  if (!drop) {
    return { notFound: true };
  }

  // Check expiry
  if (new Date(drop.expires_at) <= new Date()) {
    return { isExpired: true, expires_at: drop.expires_at };
  }

  // Fetch drop files
  const { data: filesData, error: filesError } = await client
    .from('drop_files')
    .select('*')
    .eq('drop_id', drop.id);

  if (filesError) {
    console.error('Error fetching files:', filesError);
    throw new Error(filesError.message);
  }

  // Generate signed URLs for each file:
  // 1) previewUrl: for inline HTML5 video streaming and photo viewing
  // 2) downloadUrl: with { download: file_name } forcing Content-Disposition: attachment
  const filesWithUrls = await Promise.all(
    (filesData || []).map(async (file) => {
      // Force download signed URL
      const { data: downloadData } = await client.storage
        .from(BUCKET_NAME)
        .createSignedUrl(file.storage_path, 3600 * 24, {
          download: file.file_name,
        });

      // Streamable / inline preview signed URL (without download attachment header)
      const { data: previewData } = await client.storage
        .from(BUCKET_NAME)
        .createSignedUrl(file.storage_path, 3600 * 24);

      return {
        ...file,
        downloadUrl: downloadData?.signedUrl || null,
        previewUrl: previewData?.signedUrl || null,
      };
    })
  );

  return {
    ...drop,
    files: filesWithUrls,
    isDemo: false,
  };
}

/**
 * Increment the download count for a drop
 */
export async function trackDownload(dropId) {
  const isLive = isSupabaseConfigured();
  if (!isLive) return;

  try {
    const client = getSupabaseClient();
    if (!client) return;

    // Use RPC if available or fetch & increment
    const { data: current } = await client
      .from('drops')
      .select('download_count')
      .eq('id', dropId)
      .single();

    if (current) {
      await client
        .from('drops')
        .update({ download_count: (current.download_count || 0) + 1 })
        .eq('id', dropId);
    }
  } catch (err) {
    console.warn('Could not increment download count:', err);
  }
}
