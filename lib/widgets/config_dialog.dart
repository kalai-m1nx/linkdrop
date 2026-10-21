import 'package:flutter/material.dart';
import '../services/supabase_service.dart';
import '../theme/app_theme.dart';

class ConfigDialog extends StatefulWidget {
  final VoidCallback onConfigUpdated;

  const ConfigDialog({super.key, required this.onConfigUpdated});

  @override
  State<ConfigDialog> createState() => _ConfigDialogState();
}

class _ConfigDialogState extends State<ConfigDialog> {
  late TextEditingController _urlController;
  late TextEditingController _keyController;
  bool _testing = false;
  String? _testMessage;
  bool? _testSuccess;

  @override
  void initState() {
    super.initState();
    _urlController = TextEditingController(text: SupabaseService.instance.supabaseUrl ?? '');
    _keyController = TextEditingController(text: SupabaseService.instance.supabaseAnonKey ?? '');
  }

  @override
  void dispose() {
    _urlController.dispose();
    _keyController.dispose();
    super.dispose();
  }

  void _handleTest() async {
    final url = _urlController.text.trim();
    final key = _keyController.text.trim();

    if (url.isEmpty || key.isEmpty) {
      setState(() {
        _testMessage = 'Please enter both URL and Anon Key';
        _testSuccess = false;
      });
      return;
    }

    setState(() {
      _testing = true;
      _testMessage = null;
    });

    final success = await SupabaseService.instance.testConnection(url, key);

    setState(() {
      _testing = false;
      _testSuccess = success;
      _testMessage = success
          ? 'Connected to Supabase successfully!'
          : 'Could not connect. Verify URL, API key, and schema.';
    });
  }

  void _handleSave() async {
    final url = _urlController.text.trim();
    final key = _keyController.text.trim();

    await SupabaseService.instance.init(url: url, anonKey: key);
    widget.onConfigUpdated();
    if (mounted) Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Dialog(
      backgroundColor: isDark ? AppTheme.darkCard : Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.storage_rounded, color: AppTheme.brandPrimary, size: 24),
                      SizedBox(width: 8),
                      Text(
                        'Supabase Storage Setup',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.amber.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.amber.withOpacity(0.3)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline_rounded, color: Colors.amber, size: 20),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Zero-Config Demo Mode is active when credentials are empty.',
                        style: TextStyle(fontSize: 11, color: Colors.amber),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              TextField(
                controller: _urlController,
                decoration: InputDecoration(
                  labelText: 'Supabase Project URL',
                  hintText: 'https://xyz.supabase.co',
                  filled: true,
                  fillColor: isDark ? AppTheme.darkSurface : Colors.grey[100],
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
                style: const TextStyle(fontSize: 12),
              ),
              const SizedBox(height: 12),

              TextField(
                controller: _keyController,
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Supabase Anon / Public Key',
                  hintText: 'eyJhbGciOi...',
                  filled: true,
                  fillColor: isDark ? AppTheme.darkSurface : Colors.grey[100],
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                ),
                style: const TextStyle(fontSize: 12),
              ),
              const SizedBox(height: 16),

              if (_testMessage != null)
                Container(
                  padding: const EdgeInsets.all(10),
                  margin: const EdgeInsets.only(bottom: 14),
                  decoration: BoxDecoration(
                    color: (_testSuccess ?? false)
                        ? Colors.green.withOpacity(0.12)
                        : Colors.red.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        (_testSuccess ?? false) ? Icons.check_circle_rounded : Icons.error_rounded,
                        color: (_testSuccess ?? false) ? Colors.green : Colors.red,
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          _testMessage!,
                          style: TextStyle(
                            fontSize: 11,
                            color: (_testSuccess ?? false) ? Colors.green : Colors.red,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: _testing ? null : _handleTest,
                      child: _testing
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Test Connection'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _handleSave,
                      child: const Text('Save & Apply'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
