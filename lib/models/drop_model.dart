import 'dart:typed_data';

class DropFileModel {
  final String id;
  final String dropId;
  final String fileName;
  final int fileSize;
  final String fileType;
  final String storagePath;
  final String? previewUrl;
  final String? downloadUrl;
  final Uint8List? bytes;

  DropFileModel({
    required this.id,
    required this.dropId,
    required this.fileName,
    required this.fileSize,
    required this.fileType,
    required this.storagePath,
    this.previewUrl,
    this.downloadUrl,
    this.bytes,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'drop_id': dropId,
      'file_name': fileName,
      'file_size': fileSize,
      'file_type': fileType,
      'storage_path': storagePath,
    };
  }

  factory DropFileModel.fromJson(Map<String, dynamic> json) {
    return DropFileModel(
      id: json['id'] as String,
      dropId: json['drop_id'] as String,
      fileName: json['file_name'] as String,
      fileSize: (json['file_size'] as num).toInt(),
      fileType: (json['file_type'] as String?) ?? 'application/octet-stream',
      storagePath: json['storage_path'] as String,
      previewUrl: json['preview_url'] as String?,
      downloadUrl: json['download_url'] as String?,
    );
  }

  String get category {
    final lower = fileName.toLowerCase();
    final mime = fileType.toLowerCase();

    if (mime.startsWith('image/') ||
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.gif') ||
        lower.endsWith('.webp')) {
      return 'image';
    }
    if (mime.startsWith('video/') ||
        lower.endsWith('.mp4') ||
        lower.endsWith('.webm') ||
        lower.endsWith('.mov') ||
        lower.endsWith('.mkv')) {
      return 'video';
    }
    if (mime.startsWith('audio/') ||
        lower.endsWith('.mp3') ||
        lower.endsWith('.wav') ||
        lower.endsWith('.ogg') ||
        lower.endsWith('.m4a')) {
      return 'audio';
    }
    if (lower.endsWith('.zip') || lower.endsWith('.rar') || lower.endsWith('.7z') || lower.endsWith('.tar')) {
      return 'archive';
    }
    if (lower.endsWith('.pdf') || lower.endsWith('.doc') || lower.endsWith('.docx') || lower.endsWith('.txt')) {
      return 'document';
    }
    return 'file';
  }
}

class DropModel {
  final String id;
  final String slug;
  final String title;
  final int totalSize;
  final int fileCount;
  final int downloadCount;
  final DateTime createdAt;
  final DateTime expiresAt;
  final List<DropFileModel> files;
  final bool isExpired;

  DropModel({
    required this.id,
    required this.slug,
    required this.title,
    required this.totalSize,
    required this.fileCount,
    this.downloadCount = 0,
    required this.createdAt,
    required this.expiresAt,
    this.files = const [],
    this.isExpired = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'slug': slug,
      'title': title,
      'total_size': totalSize,
      'file_count': fileCount,
      'download_count': downloadCount,
      'created_at': createdAt.toIso8601String(),
      'expires_at': expiresAt.toIso8601String(),
    };
  }

  factory DropModel.fromJson(Map<String, dynamic> json, {List<DropFileModel>? files}) {
    final expires = DateTime.parse(json['expires_at'] as String);
    final now = DateTime.now();

    return DropModel(
      id: json['id'] as String,
      slug: json['slug'] as String,
      title: (json['title'] as String?) ?? 'Shared Files',
      totalSize: (json['total_size'] as num).toInt(),
      fileCount: (json['file_count'] as num?)?.toInt() ?? 1,
      downloadCount: (json['download_count'] as num?)?.toInt() ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      expiresAt: expires,
      files: files ?? [],
      isExpired: now.isAfter(expires),
    );
  }
}
