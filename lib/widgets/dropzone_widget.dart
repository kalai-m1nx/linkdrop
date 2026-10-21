import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:desktop_drop/desktop_drop.dart';
import 'package:file_picker/file_picker.dart';
import '../models/upload_item.dart';
import '../theme/app_theme.dart';

class DropzoneWidget extends StatefulWidget {
  final void Function(List<UploadItem> items) onFilesSelected;
  final bool disabled;

  const DropzoneWidget({
    super.key,
    required this.onFilesSelected,
    this.disabled = false,
  });

  @override
  State<DropzoneWidget> createState() => _DropzoneWidgetState();
}

class _DropzoneWidgetState extends State<DropzoneWidget> {
  bool _isDragging = false;

  Future<void> _pickFiles([FileType type = FileType.any]) async {
    if (widget.disabled) return;

    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: type,
        withData: kIsWeb, // on web, load bytes directly
      );

      if (result != null && result.files.isNotEmpty) {
        final List<UploadItem> items = [];
        for (final f in result.files) {
          items.add(UploadItem(
            id: 'item_${DateTime.now().microsecondsSinceEpoch}_${items.length}',
            name: f.name,
            size: f.size,
            path: f.path,
            bytes: f.bytes,
          ));
        }
        widget.onFilesSelected(items);
      }
    } catch (e) {
      debugPrint('Error picking files: $e');
    }
  }

  void _handleDesktopDrop(DropDoneDetails details) async {
    if (widget.disabled) return;

    final List<UploadItem> items = [];
    for (final xFile in details.files) {
      final size = await xFile.length();
      Uint8List? bytes;
      if (kIsWeb) {
        bytes = await xFile.readAsBytes();
      }
      items.add(UploadItem(
        id: 'drop_${DateTime.now().microsecondsSinceEpoch}_${items.length}',
        name: xFile.name,
        size: size,
        path: kIsWeb ? null : xFile.path,
        bytes: bytes,
      ));
    }

    if (items.isNotEmpty) {
      widget.onFilesSelected(items);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isMobile = !kIsWeb && (defaultTargetPlatform == TargetPlatform.android || defaultTargetPlatform == TargetPlatform.iOS);

    return DropTarget(
      onDragEntered: (details) => setState(() => _isDragging = true),
      onDragExited: (details) => setState(() => _isDragging = false),
      onDragDone: _handleDesktopDrop,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
        decoration: BoxDecoration(
          color: _isDragging
              ? AppTheme.brandPrimary.withOpacity(0.12)
              : (isDark ? AppTheme.darkCard.withOpacity(0.6) : Colors.white),
          borderRadius: BorderRadius.circular(28),
          border: Border.all(
            color: _isDragging
                ? AppTheme.brandPrimary
                : (isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
            width: _isDragging ? 2.5 : 1.5,
          ),
          boxShadow: [
            if (_isDragging)
              BoxShadow(
                color: AppTheme.brandPrimary.withOpacity(0.25),
                blurRadius: 30,
                spreadRadius: 2,
              )
            else
              BoxShadow(
                color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Upload Icon Container
            Container(
              width: 76,
              height: 76,
              decoration: BoxDecoration(
                gradient: AppTheme.brandGradient,
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.brandPrimary.withOpacity(0.35),
                    blurRadius: 18,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: const Icon(
                Icons.cloud_upload_rounded,
                color: Colors.white,
                size: 40,
              ),
            ),
            const SizedBox(height: 20),

            // Heading
            Text(
              _isDragging
                  ? 'Drop your files here!'
                  : (isMobile ? 'Select Files or Videos' : 'Drag & drop files or videos'),
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.5,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),

            Text(
              isMobile
                  ? 'Tap below to browse photos, 4K videos, or documents'
                  : 'or browse from your computer (Up to 1TB)',
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.grey[400] : Colors.grey[600],
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),

            // Action Buttons
            Wrap(
              spacing: 12,
              runSpacing: 10,
              alignment: WrapAlignment.center,
              children: [
                ElevatedButton.icon(
                  onPressed: () => _pickFiles(FileType.any),
                  icon: const Icon(Icons.folder_open_rounded, size: 20),
                  label: const Text('Browse Files'),
                ),
                if (isMobile)
                  OutlinedButton.icon(
                    onPressed: () => _pickFiles(FileType.media),
                    icon: const Icon(Icons.photo_library_rounded, size: 20),
                    label: const Text('Photos & Videos'),
                  ),
              ],
            ),
            const SizedBox(height: 28),

            // Format Badges
            Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: [
                _buildBadge(Icons.videocam_rounded, '4K/8K Videos', Colors.red, isDark),
                _buildBadge(Icons.image_rounded, 'Photos & RAW', Colors.blue, isDark),
                _buildBadge(Icons.archive_rounded, 'ZIP & ISO', Colors.amber, isDark),
                _buildBadge(Icons.bolt_rounded, 'Resumable 1TB', AppTheme.brandPrimary, isDark),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(IconData icon, String label, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: isDark ? Colors.grey[300] : Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }
}
