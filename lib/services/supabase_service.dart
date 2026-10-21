import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/drop_model.dart';
import 'mock_storage_service.dart';

class SupabaseService {
  static final SupabaseService instance = SupabaseService._();
  SupabaseService._();

  static const String bucketName = 'linkdrop-files';

  String? _supabaseUrl;
  String? _supabaseAnonKey;
  bool _isConfigured = false;

  bool get isConfigured => _isConfigured;
  String? get supabaseUrl => _supabaseUrl;
  String? get supabaseAnonKey => _supabaseAnonKey;

  SupabaseClient? get client {
    if (!_isConfigured) return null;
    try {
      return Supabase.instance.client;
    } catch (_) {
      return null;
    }
  }

  Future<void> init({String? url, String? anonKey}) async {
    final useUrl = url ?? const String.fromEnvironment('VITE_SUPABASE_URL', defaultValue: '');
    final useKey = anonKey ?? const String.fromEnvironment('VITE_SUPABASE_ANON_KEY', defaultValue: '');

    if (useUrl.isNotEmpty && useKey.isNotEmpty && useUrl.startsWith('https://')) {
      try {
        await Supabase.initialize(
          url: useUrl,
          anonKey: useKey,
        );
        _supabaseUrl = useUrl;
        _supabaseAnonKey = useKey;
        _isConfigured = true;
      } catch (e) {
        _isConfigured = false;
      }
    } else {
      _isConfigured = false;
    }
  }

  Future<bool> testConnection(String url, String key) async {
    try {
      final testClient = SupabaseClient(url, key);
      await testClient.from('drops').select('id').limit(1);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<DropModel> createDrop({
    required String slug,
    required String title,
    required int totalSize,
    required int fileCount,
    required DateTime expiresAt,
    required List<DropFileModel> files,
  }) async {
    final dropId = 'drop_${DateTime.now().millisecondsSinceEpoch}';

    final drop = DropModel(
      id: dropId,
      slug: slug,
      title: title,
      totalSize: totalSize,
      fileCount: fileCount,
      createdAt: DateTime.now(),
      expiresAt: expiresAt,
      files: files,
    );

    if (!_isConfigured || client == null) {
      // Use in-memory mock
      MockStorageService.instance.saveDrop(drop, files);
      return drop;
    }

    // Insert to Supabase Postgres
    await client!.from('drops').insert({
      'id': dropId,
      'slug': slug,
      'title': title,
      'total_size': totalSize,
      'file_count': fileCount,
      'expires_at': expiresAt.toUtc().toIso8601String(),
    });

    final filesPayload = files.map((f) => {
      'id': f.id,
      'drop_id': dropId,
      'file_name': f.fileName,
      'file_size': f.fileSize,
      'file_type': f.fileType,
      'storage_path': f.storagePath,
    }).toList();

    await client!.from('drop_files').insert(filesPayload);

    return drop;
  }

  Future<DropModel?> getDropBySlug(String slug) async {
    if (!_isConfigured || client == null) {
      return MockStorageService.instance.getDrop(slug);
    }

    try {
      final dropRes = await client!
          .from('drops')
          .select()
          .eq('slug', slug)
          .maybeSingle();

      if (dropRes == null) return null;

      final filesRes = await client!
          .from('drop_files')
          .select()
          .eq('drop_id', dropRes['id']);

      final List<DropFileModel> files = [];

      for (final f in (filesRes as List)) {
        final storagePath = f['storage_path'] as String;
        final fileName = f['file_name'] as String;

        // Force download signed URL
        final downloadUrl = await client!.storage.from(bucketName).createSignedUrl(
          storagePath,
          3600 * 24,
          transform: null,
        );

        files.add(DropFileModel(
          id: f['id'],
          dropId: f['drop_id'],
          fileName: fileName,
          fileSize: (f['file_size'] as num).toInt(),
          fileType: f['file_type'] ?? 'application/octet-stream',
          storagePath: storagePath,
          previewUrl: downloadUrl,
          downloadUrl: downloadUrl,
        ));
      }

      return DropModel.fromJson(dropRes, files: files);
    } catch (e) {
      return MockStorageService.instance.getDrop(slug);
    }
  }

  Future<void> trackDownload(String dropId) async {
    if (!_isConfigured || client == null) {
      MockStorageService.instance.incrementDownload(dropId);
      return;
    }

    try {
      final current = await client!
          .from('drops')
          .select('download_count')
          .eq('id', dropId)
          .single();

      final count = (current['download_count'] as num?)?.toInt() ?? 0;
      await client!.from('drops').update({'download_count': count + 1}).eq('id', dropId);
    } catch (_) {}
  }
}
