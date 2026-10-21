import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:intl/intl.dart';
import '../models/drop_model.dart';
import '../services/platform_share.dart';
import '../theme/app_theme.dart';

class ShareSheetDialog extends StatefulWidget {
  final DropModel drop;
  final VoidCallback onReset;
  final void Function(String slug) onNavigateToDownload;

  const ShareSheetDialog({
    super.key,
    required this.drop,
    required this.onReset,
    required this.onNavigateToDownload,
  });

  @override
  State<ShareSheetDialog> createState() => _ShareSheetDialogState();
}

class _ShareSheetDialogState extends State<ShareSheetDialog> {
  bool _copied = false;
  bool _showQr = false;

  String get _shareUrl {
    if (kIsWeb) {
      final origin = Uri.base.origin;
      return '$origin/s/${widget.drop.slug}';
    }
    return 'https://linkdrop.app/s/${widget.drop.slug}';
  }

  void _handleCopy() async {
    await PlatformShare.copyToClipboard(_shareUrl);
    if (!mounted) return;
    setState(() => _copied = true);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Link copied to clipboard!'),
        duration: Duration(seconds: 2),
      ),
    );
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isMobile = !kIsWeb && (defaultTargetPlatform == TargetPlatform.android || defaultTargetPlatform == TargetPlatform.iOS);

    final expiryFormatted = DateFormat('MMM d, yyyy').format(widget.drop.expiresAt);

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
            color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.08),
            blurRadius: 30,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          // Success Icon
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF10B981), Color(0xFF14B8A6)],
              ),
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF10B981).withValues(alpha: 0.35),
                  blurRadius: 20,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: const Icon(
              Icons.check_rounded,
              color: Colors.white,
              size: 44,
            ),
          ),
          const SizedBox(height: 18),

          const Text(
            'Your Link is Ready!',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 6),

          Text(
            'Anyone with this link can view photos, stream videos, or download all files.',
            style: TextStyle(
              fontSize: 13,
              color: isDark ? Colors.grey[400] : Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),

          // URL Box
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkSurface : Colors.grey[100],
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isDark ? AppTheme.darkBorder : AppTheme.lightBorder,
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    _shareUrl,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: _handleCopy,
                  icon: Icon(_copied ? Icons.check_rounded : Icons.copy_rounded, size: 16),
                  label: Text(_copied ? 'Copied' : 'Copy'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _copied ? Colors.green : AppTheme.brandPrimary,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Sharing Actions (Native Share, WhatsApp, QR Code)
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => PlatformShare.openWhatsApp(_shareUrl, widget.drop.title),
                  icon: const Icon(Icons.chat_bubble_outline_rounded, color: Colors.green, size: 18),
                  label: const Text('WhatsApp', style: TextStyle(fontSize: 12)),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              if (isMobile)
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => PlatformShare.shareLink(
                      title: widget.drop.title,
                      shareUrl: _shareUrl,
                    ),
                    icon: const Icon(Icons.share_rounded, size: 18),
                    label: const Text('Share Sheet', style: TextStyle(fontSize: 12)),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              if (!isMobile)
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => setState(() => _showQr = !_showQr),
                    icon: const Icon(Icons.qr_code_rounded, size: 18),
                    label: Text(_showQr ? 'Hide QR' : 'QR Code', style: const TextStyle(fontSize: 12)),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
            ],
          ),

          // QR Code Display Card
          if (_showQr) ...[
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.08),
                    blurRadius: 15,
                  ),
                ],
              ),
              child: QrImageView(
                data: _shareUrl,
                version: QrVersions.auto,
                size: 160.0,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Scan with mobile phone to open link directly',
              style: TextStyle(fontSize: 11, color: Colors.grey),
            ),
          ],
          const SizedBox(height: 20),

          // Expiry & file count info
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkSurface : Colors.grey[50],
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.timer_outlined, size: 16, color: AppTheme.brandPrimary),
                    const SizedBox(width: 6),
                    Text(
                      'Expires on $expiryFormatted',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                Text(
                  '${widget.drop.fileCount} files • ${FormatUtils.formatBytes(widget.drop.totalSize)}',
                  style: TextStyle(fontSize: 12, color: isDark ? Colors.grey[400] : Colors.grey[600]),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Bottom Buttons (Preview & Drop More)
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => widget.onNavigateToDownload(widget.drop.slug),
                  icon: const Icon(Icons.open_in_new_rounded, size: 18),
                  label: const Text('View Download Page'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: widget.onReset,
                  icon: const Icon(Icons.add_rounded, size: 18),
                  label: const Text('Drop More Files'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
