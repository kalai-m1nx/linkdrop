import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/drop_model.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';
import '../widgets/media_preview_widget.dart';

class DownloadScreen extends StatefulWidget {
  final String slug;
  final VoidCallback onNavigateHome;
  final VoidCallback onToggleTheme;

  const DownloadScreen({
    super.key,
    required this.slug,
    required this.onNavigateHome,
    required this.onToggleTheme,
  });

  @override
  State<DownloadScreen> createState() => _DownloadScreenState();
}

class _DownloadScreenState extends State<DownloadScreen> {
  bool _loading = true;
  DropModel? _drop;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchDrop();
  }

  void _fetchDrop() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final drop = await SupabaseService.instance.getDropBySlug(widget.slug);
      setState(() {
        _drop = drop;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  void _handleDownloadAll() async {
    if (_drop == null || _drop!.files.isEmpty) return;

    for (final file in _drop!.files) {
      final url = file.downloadUrl ?? file.previewUrl;
      if (url != null && url.isNotEmpty) {
        final uri = Uri.parse(url);
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      }
    }
    SupabaseService.instance.trackDownload(_drop!.id);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          onPressed: widget.onNavigateHome,
          icon: const Icon(Icons.arrow_back_rounded),
          tooltip: 'Back to Home',
        ),
        title: const Text('LinkDrop Download', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        actions: [
          IconButton(
            onPressed: widget.onToggleTheme,
            icon: Icon(isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: _buildBody(isDark),
        ),
      ),
    );
  }

  Widget _buildBody(bool isDark) {
    if (_loading) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: AppTheme.brandPrimary),
            SizedBox(height: 16),
            Text('Locating LinkDrop files...'),
          ],
        ),
      );
    }

    if (_drop == null || _error != null) {
      return _buildNotFound(isDark);
    }

    if (_drop!.isExpired) {
      return _buildExpired(isDark);
    }

    final formattedExpiry = DateFormat('MMM d, yyyy • h:mm a').format(_drop!.expiresAt);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkCard : Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(isDark ? 0.2 : 0.04),
                  blurRadius: 15,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF10B981),
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Text(
                                'LINKDROP READY',
                                style: TextStyle(
                                  color: Color(0xFF10B981),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 10,
                                  letterSpacing: 1,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _drop!.title,
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${_drop!.fileCount} ${_drop!.fileCount == 1 ? "file" : "files"} • ${FormatUtils.formatBytes(_drop!.totalSize)}',
                            style: TextStyle(
                              fontSize: 12,
                              color: isDark ? Colors.grey[400] : Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: _handleDownloadAll,
                      icon: const Icon(Icons.download_rounded, size: 20),
                      label: Text(_drop!.fileCount > 1 ? 'Download All' : 'Download'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.brandPrimary,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // Expiry bar
                Row(
                  children: [
                    const Icon(Icons.schedule_rounded, size: 16, color: AppTheme.brandPrimary),
                    const SizedBox(width: 6),
                    Text(
                      'Expires on $formattedExpiry',
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.grey[300] : Colors.grey[700],
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // File items preview list
          MediaPreviewWidget(
            files: _drop!.files,
            onDownload: (file) => SupabaseService.instance.trackDownload(_drop!.id),
          ),
          const SizedBox(height: 32),

          // Footer link
          Center(
            child: TextButton.icon(
              onPressed: widget.onNavigateHome,
              icon: const Icon(Icons.upload_file_rounded, size: 18),
              label: const Text('Send large files yourself with LinkDrop'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExpired(bool isDark) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(32),
        margin: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.darkCard : Colors.white,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.hourglass_empty_rounded, color: Colors.amber, size: 36),
            ),
            const SizedBox(height: 20),
            const Text(
              'This LinkDrop Has Expired',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'Files shared through LinkDrop are automatically purged after expiration to protect privacy and storage.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: isDark ? Colors.grey[400] : Colors.grey[600]),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: widget.onNavigateHome,
              child: const Text('Send Your Own Files'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotFound(bool isDark) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(32),
        margin: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.darkCard : Colors.white,
          borderRadius: BorderRadius.circular(28),
          border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.search_off_rounded, color: Colors.redAccent, size: 36),
            ),
            const SizedBox(height: 20),
            const Text(
              'LinkDrop Not Found',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              'This link does not exist or may have already been removed.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: isDark ? Colors.grey[400] : Colors.grey[600]),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: widget.onNavigateHome,
              child: const Text('Create a New LinkDrop'),
            ),
          ],
        ),
      ),
    );
  }
}
