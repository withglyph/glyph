import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class WebViewScreen extends StatelessWidget {
  const WebViewScreen({
    super.key,
    required this.title,
    required this.path,
  });

  final String title;
  final String path;

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      title: this.title,
      child: WebView(
        path: this.path,
      ),
    );
  }
}
