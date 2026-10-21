import 'dart:async';
import 'dart:math';
import '../models/upload_item.dart';
import 'supabase_service.dart';

class TusUploader {
  final UploadItem item;
  final String storagePath;
  final void Function(double progress, double speed, int eta) onProgress;
  final void Function() onCompleted;
  final void Function(String error) onError;

  bool _isPaused = false;
  bool _isCancelled = false;
  Timer? _simTimer;

  TusUploader({
    required this.item,
    required this.storagePath,
    required this.onProgress,
    required this.onCompleted,
    required this.onError,
  });

  void start() {
    _isPaused = false;
    _isCancelled = false;

    if (SupabaseService.instance.isConfigured && SupabaseService.instance.client != null) {
      _startLiveUpload();
    } else {
      _startSimulatedChunkedUpload();
    }
  }

  void pause() {
    _isPaused = true;
    _simTimer?.cancel();
    item.status = UploadStatus.paused;
  }

  void resume() {
    if (_isCancelled) return;
    _isPaused = false;
    item.status = UploadStatus.uploading;
    if (SupabaseService.instance.isConfigured) {
      _startLiveUpload();
    } else {
      _startSimulatedChunkedUpload();
    }
  }

  void cancel() {
    _isCancelled = true;
    _simTimer?.cancel();
    item.status = UploadStatus.queued;
  }

  void _startLiveUpload() async {
    try {
      final client = SupabaseService.instance.client!;
      // If bytes are present (Web or memory)
      if (item.bytes != null) {
        await client.storage.from(SupabaseService.bucketName).uploadBinary(
          storagePath,
          item.bytes!,
        );
      }
      onProgress(1.0, 0, 0);
      onCompleted();
    } catch (e) {
      onError(e.toString());
    }
  }

  void _startSimulatedChunkedUpload() {
    final totalBytes = max(item.size, 1024 * 1024);
    double uploadedBytes = item.progress * totalBytes;

    const tickIntervalMs = 80;
    final stepBytes = (5 * 1024 * 1024) * (tickIntervalMs / 1000.0);

    DateTime lastTime = DateTime.now();

    _simTimer?.cancel();
    _simTimer = Timer.periodic(const Duration(milliseconds: tickIntervalMs), (timer) {
      if (_isPaused || _isCancelled) {
        timer.cancel();
        return;
      }

      uploadedBytes = min(totalBytes.toDouble(), uploadedBytes + stepBytes * (0.8 + Random().nextDouble() * 0.4));
      final now = DateTime.now();
      final elapsed = now.difference(lastTime).inMilliseconds / 1000.0;
      final speed = elapsed > 0 ? (stepBytes / elapsed) : (1024 * 1024 * 4.0);
      lastTime = now;

      final remainingBytes = totalBytes - uploadedBytes;
      final eta = speed > 0 ? (remainingBytes / speed).round() : 0;
      final progress = (uploadedBytes / totalBytes).clamp(0.0, 1.0);

      item.progress = progress;
      item.speedBytesPerSec = speed;
      item.etaSeconds = eta;

      onProgress(progress, speed, eta);

      if (uploadedBytes >= totalBytes) {
        timer.cancel();
        item.status = UploadStatus.completed;
        onCompleted();
      }
    });
  }
}
