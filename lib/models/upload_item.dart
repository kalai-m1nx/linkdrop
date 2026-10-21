import 'dart:typed_data';

enum UploadStatus {
  queued,
  uploading,
  paused,
  completed,
  error,
}

class UploadItem {
  final String id;
  final String name;
  final int size;
  final String? path;
  final Uint8List? bytes;
  final String mimeType;

  double progress;
  UploadStatus status;
  double speedBytesPerSec;
  int etaSeconds;
  String? errorMessage;

  UploadItem({
    required this.id,
    required this.name,
    required this.size,
    this.path,
    this.bytes,
    this.mimeType = 'application/octet-stream',
    this.progress = 0.0,
    this.status = UploadStatus.queued,
    this.speedBytesPerSec = 0.0,
    this.etaSeconds = 0,
    this.errorMessage,
  });

  String get category {
    final lower = name.toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.gif') || lower.endsWith('.webp')) {
      return 'image';
    }
    if (lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.endsWith('.mkv')) {
      return 'video';
    }
    if (lower.endsWith('.mp3') || lower.endsWith('.wav') || lower.endsWith('.ogg') || lower.endsWith('.m4a')) {
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
