import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class EditorScreen extends ConsumerWidget {
  const EditorScreen({super.key, required this.permalink});

  final String permalink;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultShell(
      title: '작성하기',
      child: SafeArea(
        child: WebView(
          path: '/editor/$permalink?webview=true',
        ),
      ),
    );
  }
}
