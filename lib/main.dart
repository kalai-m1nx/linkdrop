import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import 'services/supabase_service.dart';
import 'theme/app_theme.dart';
import 'screens/home_screen.dart';
import 'screens/download_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Use clean path URL strategy on Web (no /#/ in URLs)
  if (kIsWeb) {
    usePathUrlStrategy();
  }

  // Initialize Supabase service (will activate Demo Mode if credentials are not configured)
  await SupabaseService.instance.init();

  runApp(const LinkDropApp());
}

class LinkDropApp extends StatefulWidget {
  const LinkDropApp({super.key});

  @override
  State<LinkDropApp> createState() => _LinkDropAppState();
}

class _LinkDropAppState extends State<LinkDropApp> {
  ThemeMode _themeMode = ThemeMode.dark;
  String? _currentDownloadSlug;

  @override
  void initState() {
    super.initState();
    _checkInitialWebRoute();
  }

  void _checkInitialWebRoute() {
    if (kIsWeb) {
      final path = Uri.base.path;
      final match = RegExp(r'^/s/([a-zA-Z0-9_-]+)').firstMatch(path);
      if (match != null) {
        _currentDownloadSlug = match.group(1);
      }
    }
  }

  void _toggleTheme() {
    setState(() {
      _themeMode = _themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    });
  }

  void _navigateToDownload(String slug) {
    setState(() {
      _currentDownloadSlug = slug;
    });
  }

  void _navigateToHome() {
    setState(() {
      _currentDownloadSlug = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LinkDrop — Large File & Video Sharing',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: _themeMode,
      home: _currentDownloadSlug != null
          ? DownloadScreen(
              slug: _currentDownloadSlug!,
              onNavigateHome: _navigateToHome,
              onToggleTheme: _toggleTheme,
            )
          : HomeScreen(
              onNavigateToDownload: _navigateToDownload,
              onToggleTheme: _toggleTheme,
            ),
      onGenerateRoute: (settings) {
        final uri = Uri.parse(settings.name ?? '/');
        if (uri.pathSegments.length >= 2 && uri.pathSegments[0] == 's') {
          final slug = uri.pathSegments[1];
          return MaterialPageRoute(
            builder: (_) => DownloadScreen(
              slug: slug,
              onNavigateHome: _navigateToHome,
              onToggleTheme: _toggleTheme,
            ),
          );
        }
        return MaterialPageRoute(
          builder: (_) => HomeScreen(
            onNavigateToDownload: _navigateToDownload,
            onToggleTheme: _toggleTheme,
          ),
        );
      },
    );
  }
}
