import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class WebViewScreen extends StatelessWidget {
  const WebViewScreen({
    required this.title,
    required this.path,
    super.key,
  });

  final String title;
  final String path;

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      title: title,
      child: WebView(
        path: path,
      ),
    );
  }
}
