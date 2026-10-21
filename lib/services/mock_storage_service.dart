import '../models/drop_model.dart';

class MockStorageService {
  static final MockStorageService instance = MockStorageService._();
  MockStorageService._();

  final Map<String, DropModel> _drops = {};
  final Map<String, List<DropFileModel>> _files = {};

  void saveDrop(DropModel drop, List<DropFileModel> files) {
    _drops[drop.slug] = drop;
    _files[drop.id] = files;
  }

  DropModel? getDrop(String slug) {
    final drop = _drops[slug];
    if (drop == null) return null;

    final files = _files[drop.id] ?? [];
    return DropModel(
      id: drop.id,
      slug: drop.slug,
      title: drop.title,
      totalSize: drop.totalSize,
      fileCount: drop.fileCount,
      downloadCount: drop.downloadCount,
      createdAt: drop.createdAt,
      expiresAt: drop.expiresAt,
      files: files,
      isExpired: DateTime.now().isAfter(drop.expiresAt),
    );
  }

  void incrementDownload(String dropId) {
    for (final entry in _drops.entries) {
      if (entry.value.id == dropId) {
        final old = entry.value;
        _drops[entry.key] = DropModel(
          id: old.id,
          slug: old.slug,
          title: old.title,
          totalSize: old.totalSize,
          fileCount: old.fileCount,
          downloadCount: old.downloadCount + 1,
          createdAt: old.createdAt,
          expiresAt: old.expiresAt,
          files: old.files,
          isExpired: old.isExpired,
        );
        break;
      }
    }
  }
}
