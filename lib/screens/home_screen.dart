import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../models/drop_model.dart';
import '../models/upload_item.dart';
import '../services/supabase_service.dart';
import '../services/tus_uploader.dart';
import '../theme/app_theme.dart';
import '../widgets/dropzone_widget.dart';
import '../widgets/file_queue_view.dart';
import '../widgets/upload_progress_view.dart';
import '../widgets/share_sheet_dialog.dart';
import '../widgets/config_dialog.dart';

enum HomeStage {
  select,
  queue,
  uploading,
  completed,
}

class HomeScreen extends StatefulWidget {
  final void Function(String slug) onNavigateToDownload;
  final VoidCallback onToggleTheme;

  const HomeScreen({
    super.key,
    required this.onNavigateToDownload,
    required this.onToggleTheme,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  HomeStage _stage = HomeStage.select;
  final List<UploadItem> _items = [];
  String _expiryOption = '7d';
  final TextEditingController _titleController = TextEditingController();

  int _currentUploadIndex = 0;
  double _overallProgress = 0.0;
  bool _isPaused = false;
  String? _uploadError;

  DropModel? _createdDrop;
  TusUploader? _activeUploader;

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  void _handleFilesSelected(List<UploadItem> newItems) {
    setState(() {
      _items.addAll(newItems);
      _stage = HomeStage.queue;
    });
  }

  void _handleRemoveItem(int index) {
    setState(() {
      _items.removeAt(index);
      if (_items.isEmpty) {
        _stage = HomeStage.select;
      }
    });
  }

  void _handleClearAll() {
    setState(() {
      _items.clear();
      _stage = HomeStage.select;
    });
  }

  void _handleAddMore() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        withData: kIsWeb,
      );
      if (result != null && result.files.isNotEmpty) {
        final List<UploadItem> newItems = [];
        for (final f in result.files) {
          newItems.add(UploadItem(
            id: 'item_${DateTime.now().microsecondsSinceEpoch}_${newItems.length}',
            name: f.name,
            size: f.size,
            path: f.path,
            bytes: f.bytes,
          ));
        }
        _handleFilesSelected(newItems);
      }
    } catch (e) {
      debugPrint('Error adding more files: $e');
    }
  }

  void _startUpload() async {
    if (_items.isEmpty) return;

    setState(() {
      _stage = HomeStage.uploading;
      _currentUploadIndex = 0;
      _overallProgress = 0.0;
      _isPaused = false;
      _uploadError = null;
    });

    final slug = FormatUtils.generateSlug(8);
    final totalSize = _items.fold<int>(0, (acc, item) => acc + item.size);
    final title = _titleController.text.trim().isNotEmpty
        ? _titleController.text.trim()
        : (_items.length == 1 ? _items.first.name : '${_items.length} files');

    DateTime expiresAt = DateTime.now().add(const Duration(days: 7));
    if (_expiryOption == '1d') {
      expiresAt = DateTime.now().add(const Duration(days: 1));
    } else if (_expiryOption == '30d') {
      expiresAt = DateTime.now().add(const Duration(days: 30));
    }

    final dropId = 'drop_${DateTime.now().millisecondsSinceEpoch}';
    final List<DropFileModel> files = [];

    for (int i = 0; i < _items.length; i++) {
      final item = _items[i];
      final fileId = 'file_${DateTime.now().millisecondsSinceEpoch}_$i';
      final cleanName = item.name.replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '_');
      final storagePath = '$dropId/${fileId}_$cleanName';

      files.add(DropFileModel(
        id: fileId,
        dropId: dropId,
        fileName: item.name,
        fileSize: item.size,
        fileType: item.mimeType,
        storagePath: storagePath,
        bytes: item.bytes,
      ));
    }

    try {
      final drop = await SupabaseService.instance.createDrop(
        slug: slug,
        title: title,
        totalSize: totalSize,
        fileCount: _items.length,
        expiresAt: expiresAt,
        files: files,
      );

      _createdDrop = drop;
      _uploadFilesSequentially(files);
    } catch (e) {
      setState(() {
        _uploadError = e.toString();
      });
    }
  }

  void _uploadFilesSequentially(List<DropFileModel> dropFiles) {
    if (_currentUploadIndex >= _items.length) {
      setState(() {
        _stage = HomeStage.completed;
      });
      return;
    }

    final item = _items[_currentUploadIndex];
    final file = dropFiles[_currentUploadIndex];

    item.status = UploadStatus.uploading;

    _activeUploader = TusUploader(
      item: item,
      storagePath: file.storagePath,
      onProgress: (progress, speed, eta) {
        setState(() {
          final totalUploaded = _items.fold<double>(0.0, (acc, it) => acc + (it.progress * it.size));
          final totalBytes = _items.fold<int>(0, (acc, it) => acc + it.size);
          _overallProgress = totalBytes > 0 ? (totalUploaded / totalBytes).clamp(0.0, 1.0) : 0.0;
        });
      },
      onError: (err) {
        setState(() {
          _uploadError = err;
        });
      },
      onCompleted: () {
        setState(() {
          _currentUploadIndex++;
        });
        _uploadFilesSequentially(dropFiles);
      },
    );

    _activeUploader?.start();
  }

  void _handlePause() {
    _activeUploader?.pause();
    setState(() => _isPaused = true);
  }

  void _handleResume() {
    _activeUploader?.resume();
    setState(() {
      _isPaused = false;
      _uploadError = null;
    });
  }

  void _handleCancel() {
    _activeUploader?.cancel();
    setState(() {
      _stage = HomeStage.queue;
      _isPaused = false;
      _uploadError = null;
    });
  }

  void _handleReset() {
    setState(() {
      _items.clear();
      _titleController.clear();
      _createdDrop = null;
      _stage = HomeStage.select;
      _currentUploadIndex = 0;
      _overallProgress = 0.0;
      _isPaused = false;
      _uploadError = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isLive = SupabaseService.instance.isConfigured;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: AppTheme.brandGradient,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.cloud_sync_rounded, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 10),
            const Text(
              'LinkDrop',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20, letterSpacing: -0.5),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: AppTheme.brandPrimary.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text('1TB', style: TextStyle(color: AppTheme.brandPrimary, fontSize: 10, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
        actions: [
          // Live / Demo Pill Button
          ActionChip(
            avatar: Icon(
              isLive ? Icons.check_circle_rounded : Icons.auto_awesome_rounded,
              color: isLive ? Colors.green : Colors.amber,
              size: 16,
            ),
            label: Text(
              isLive ? 'Live Supabase' : 'Demo Mode',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: isLive ? Colors.green : Colors.amber,
              ),
            ),
            backgroundColor: (isLive ? Colors.green : Colors.amber).withOpacity(0.1),
            side: BorderSide(color: (isLive ? Colors.green : Colors.amber).withOpacity(0.3)),
            onPressed: () {
              showDialog(
                context: context,
                builder: (ctx) => ConfigDialog(
                  onConfigUpdated: () => setState(() {}),
                ),
              );
            },
          ),
          const SizedBox(width: 8),

          IconButton(
            onPressed: widget.onToggleTheme,
            icon: Icon(isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded),
            tooltip: 'Toggle Theme',
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 680),
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            child: Column(
              children: [
                // Hero Text
                const Text(
                  'Share large files & videos',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -1,
                  ),
                  textAlign: TextAlign.center,
                ),
                ShaderMask(
                  shaderCallback: (bounds) => AppTheme.brandGradient.createShader(bounds),
                  child: const Text(
                    'with a single link.',
                    style: TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -1,
                      color: Colors.white,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'No login required. Works across Android, iOS, Windows, and Web.',
                  style: TextStyle(
                    fontSize: 14,
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // Main Stage Card
                if (_stage == HomeStage.select)
                  DropzoneWidget(onFilesSelected: _handleFilesSelected),

                if (_stage == HomeStage.queue)
                  FileQueueView(
                    items: _items,
                    onRemoveItem: _handleRemoveItem,
                    onClearAll: _handleClearAll,
                    onAddMore: _handleAddMore,
                    onStartUpload: _startUpload,
                    expiryOption: _expiryOption,
                    onExpiryChanged: (opt) => setState(() => _expiryOption = opt),
                    titleController: _titleController,
                  ),

                if (_stage == HomeStage.uploading)
                  UploadProgressView(
                    items: _items,
                    currentIndex: _currentUploadIndex,
                    overallProgress: _overallProgress,
                    isPaused: _isPaused,
                    errorMessage: _uploadError,
                    onPause: _handlePause,
                    onResume: _handleResume,
                    onCancel: _handleCancel,
                    onRetry: _startUpload,
                  ),

                if (_stage == HomeStage.completed && _createdDrop != null)
                  ShareSheetDialog(
                    drop: _createdDrop!,
                    onReset: _handleReset,
                    onNavigateToDownload: widget.onNavigateToDownload,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
