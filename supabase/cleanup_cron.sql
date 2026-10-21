-- ==============================================================================
-- LinkDrop Auto-Cleanup Routine for Expired Files & Records
-- Run this in Supabase SQL Editor to enable automatic purging
-- ==============================================================================

-- 1. Enable pg_cron and pg_net extension (Available in Supabase Settings -> Database -> Extensions)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Stored Procedure to Delete Expired Drops and Storage Objects
CREATE OR REPLACE FUNCTION public.delete_expired_drops()
RETURNS TABLE(deleted_drops INT, deleted_files INT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    drops_count INT := 0;
    files_count INT := 0;
BEGIN
    -- 2a. Delete physical objects from storage.objects for expired drops
    WITH expired_drops_cte AS (
        SELECT id FROM public.drops WHERE expires_at <= timezone('utc'::text, now())
    ),
    expired_files_cte AS (
        SELECT storage_path FROM public.drop_files
        WHERE drop_id IN (SELECT id FROM expired_drops_cte)
    ),
    deleted_storage AS (
        DELETE FROM storage.objects
        WHERE bucket_id = 'linkdrop-files'
        AND name IN (SELECT storage_path FROM expired_files_cte)
        RETURNING id
    )
    SELECT count(*) INTO files_count FROM deleted_storage;

    -- 2b. Delete drops from the table (ON DELETE CASCADE removes drop_files)
    WITH deleted_drops_res AS (
        DELETE FROM public.drops
        WHERE expires_at <= timezone('utc'::text, now())
        RETURNING id
    )
    SELECT count(*) INTO drops_count FROM deleted_drops_res;

    RETURN QUERY SELECT drops_count, files_count;
END;
$$;

-- Grant execution to postgres and service_role
REVOKE EXECUTE ON FUNCTION public.delete_expired_drops() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_expired_drops() TO service_role, postgres;

-- 3. Schedule the Cleanup Job to Run Every Hour (at minute 0)
-- Note: '0 * * * *' runs every hour. You can adjust frequency if needed.
SELECT cron.unschedule('linkdrop-hourly-cleanup') WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'linkdrop-hourly-cleanup'
);

SELECT cron.schedule(
    'linkdrop-hourly-cleanup',
    '0 * * * *',
    'SELECT public.delete_expired_drops();'
);

-- ==============================================================================
-- Manual Test:
-- You can test this at any time by running:
-- SELECT * FROM public.delete_expired_drops();
-- ==============================================================================
