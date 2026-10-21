-- ==============================================================================
-- LinkDrop Database & Storage Schema
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create 'drops' Table
CREATE TABLE IF NOT EXISTS public.drops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT,
    total_size BIGINT NOT NULL DEFAULT 0,
    file_count INT NOT NULL DEFAULT 1,
    download_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index for high-speed slug lookup and expiry checking
CREATE INDEX IF NOT EXISTS idx_drops_slug ON public.drops(slug);
CREATE INDEX IF NOT EXISTS idx_drops_expires_at ON public.drops(expires_at);

-- 3. Create 'drop_files' Table
CREATE TABLE IF NOT EXISTS public.drop_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drop_id UUID NOT NULL REFERENCES public.drops(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'application/octet-stream',
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_drop_files_drop_id ON public.drop_files(drop_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drop_files ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for 'drops'
-- Allow anyone (public/anon) to create a drop
CREATE POLICY "Public can create drops"
    ON public.drops
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow anyone to read drops ONLY IF NOT EXPIRED
CREATE POLICY "Public can view active drops"
    ON public.drops
    FOR SELECT
    TO anon, authenticated
    USING (expires_at > timezone('utc'::text, now()));

-- Allow incrementing download count
CREATE POLICY "Public can update download count"
    ON public.drops
    FOR UPDATE
    TO anon, authenticated
    USING (expires_at > timezone('utc'::text, now()))
    WITH CHECK (true);

-- 6. RLS Policies for 'drop_files'
-- Allow anyone to insert file records for their drop
CREATE POLICY "Public can add files to drops"
    ON public.drop_files
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow reading files only for active drops
CREATE POLICY "Public can view files of active drops"
    ON public.drop_files
    FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.drops
            WHERE drops.id = drop_files.drop_id
            AND drops.expires_at > timezone('utc'::text, now())
        )
    );

-- 7. Supabase Storage Bucket Setup
-- Create private bucket 'linkdrop-files' (if not already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'linkdrop-files',
    'linkdrop-files',
    false, -- Private bucket: access through signed URLs
    NULL,  -- No arbitrary limit (supports large files up to project tier limit)
    NULL   -- Any file type accepted
)
ON CONFLICT (id) DO UPDATE
SET public = false;

-- 8. Storage RLS Policies (storage.objects)
-- Allow public/anon uploads to the linkdrop-files bucket
CREATE POLICY "Allow public uploads to linkdrop-files"
    ON storage.objects
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (bucket_id = 'linkdrop-files');

-- Allow public signed URL creation / select for linkdrop-files
CREATE POLICY "Allow reading objects in linkdrop-files"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'linkdrop-files');
