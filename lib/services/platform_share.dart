import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

class PlatformShare {
  static Future<void> shareLink({
    required String title,
    required String shareUrl,
    String? subject,
  }) async {
    final text = 'Download "$title" shared via LinkDrop:\n$shareUrl';

    // On mobile (Android / iOS), open native share sheet
    if (!kIsWeb && (defaultTargetPlatform == TargetPlatform.android || defaultTargetPlatform == TargetPlatform.iOS)) {
      try {
        await Share.share(
          text,
          subject: subject ?? 'LinkDrop File Share',
        );
        return;
      } catch (e) {
        debugPrint('Native share failed, falling back to clipboard: $e');
      }
    }

    // On Windows, Desktop, or Web: Copy to clipboard
    await Clipboard.setData(ClipboardData(text: shareUrl));
  }

  static Future<bool> openWhatsApp(String shareUrl, String title) async {
    final message = Uri.encodeComponent('Download "$title" shared via LinkDrop:\n$shareUrl');
    final uri = Uri.parse('https://wa.me/?text=$message');

    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
      return true;
    }
    return false;
  }

  static Future<void> copyToClipboard(String text) async {
    await Clipboard.setData(ClipboardData(text: text));
  }
}
