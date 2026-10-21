import 'package:flutter/material.dart';
import '../models/upload_item.dart';
import '../theme/app_theme.dart';

class UploadProgressView extends StatelessWidget {
  final List<UploadItem> items;
  final int currentIndex;
  final double overallProgress;
  final bool isPaused;
  final String? errorMessage;
  final VoidCallback onPause;
  final VoidCallback onResume;
  final VoidCallback onCancel;
  final VoidCallback onRetry;

  const UploadProgressView({
    super.key,
    required this.items,
    required this.currentIndex,
    required this.overallProgress,
    required this.isPaused,
    this.errorMessage,
    required this.onPause,
    required this.onResume,
    required this.onCancel,
    required this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final currentItem = items.isNotEmpty && currentIndex < items.length ? items[currentIndex] : null;

    final totalUploaded = items.fold<double>(0.0, (acc, item) => acc + (item.progress * item.size));
    final totalBytes = items.fold<int>(0, (acc, item) => acc + item.size);

    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.05),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with Pause / Resume / Cancel controls
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: isPaused
                          ? Colors.amber.withOpacity(0.15)
                          : (errorMessage != null
                              ? Colors.red.withOpacity(0.15)
                              : AppTheme.brandPrimary.withOpacity(0.15)),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(
                      isPaused
                          ? Icons.pause_rounded
                          : (errorMessage != null
                              ? Icons.error_outline_rounded
                              : Icons.cloud_upload_rounded),
                      color: isPaused
                          ? Colors.amber
                          : (errorMessage != null ? Colors.red : AppTheme.brandPrimary),
                      size: 26,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isPaused
                            ? 'Upload Paused'
                            : (errorMessage != null
                                ? 'Upload Interrupted'
                                : 'Uploading to Cloud...'),
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'File ${currentIndex + 1} of ${items.length} • TUS Chunked',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDark ? Colors.grey[400] : Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Row(
                children: [
                  if (errorMessage != null)
                    ElevatedButton.icon(
                      onPressed: onRetry,
                      icon: const Icon(Icons.refresh_rounded, size: 16),
                      label: const Text('Retry'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      ),
                    )
                  else
                    IconButton(
                      onPressed: isPaused ? onResume : onPause,
                      icon: Icon(
                        isPaused ? Icons.play_arrow_rounded : Icons.pause_rounded,
                        color: isPaused ? Colors.green : Colors.grey[400],
                      ),
                      tooltip: isPaused ? 'Resume' : 'Pause',
                    ),
                  IconButton(
                    onPressed: onCancel,
                    icon: const Icon(Icons.close_rounded, color: Colors.grey),
                    tooltip: 'Cancel',
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Overall Progress bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Overall Progress', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              Text(
                '${(overallProgress * 100).toInt()}%',
                style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.brandPrimary, fontSize: 15),
              ),
            ],
          ),
          const SizedBox(height: 8),

          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: overallProgress,
              minHeight: 10,
              backgroundColor: isDark ? AppTheme.darkSurface : Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(
                isPaused
                    ? Colors.amber
                    : (errorMessage != null ? Colors.red : AppTheme.brandPrimary),
              ),
            ),
          ),
          const SizedBox(height: 8),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${FormatUtils.formatBytes(totalUploaded.toInt())} / ${FormatUtils.formatBytes(totalBytes)}',
                style: TextStyle(fontSize: 11, color: isDark ? Colors.grey[400] : Colors.grey[600]),
              ),
              Text(
                '${items.length} files',
                style: TextStyle(fontSize: 11, color: isDark ? Colors.grey[400] : Colors.grey[600]),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Current file card with Speed and ETA
          if (currentItem != null)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.darkSurface : Colors.grey[50],
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          currentItem.name,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Text(
                        '${(currentItem.progress * 100).toInt()}%',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: isDark ? Colors.grey[300] : Colors.grey[700],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: currentItem.progress,
                      minHeight: 6,
                      backgroundColor: isDark ? AppTheme.darkCard : Colors.grey[200],
                      valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.brandAccent),
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Metrics: Speed, Remaining, Protocol
                  Row(
                    children: [
                      _buildMetric(
                        'Speed',
                        currentItem.speedBytesPerSec > 0
                            ? '${FormatUtils.formatBytes(currentItem.speedBytesPerSec.toInt())}/s'
                            : '--',
                        isDark,
                      ),
                      const SizedBox(width: 8),
                      _buildMetric(
                        'Remaining',
                        FormatUtils.formatSeconds(currentItem.etaSeconds),
                        isDark,
                      ),
                      const SizedBox(width: 8),
                      _buildMetric(
                        'Protocol',
                        'TUS Chunked',
                        isDark,
                        color: AppTheme.brandPrimary,
                      ),
                    ],
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildMetric(String label, String value, bool isDark, {Color? color}) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.darkCard : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
          ),
        ),
        child: Column(
          children: [
            Text(
              label.toUpperCase(),
              style: TextStyle(
                fontSize: 9,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.grey[400] : Colors.grey[500],
              ),
            ),
            const SizedBox(height: 2),
            Text(
              value,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: color ?? (isDark ? Colors.white : Colors.black87),
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
