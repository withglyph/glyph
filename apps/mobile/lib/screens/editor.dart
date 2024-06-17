import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/routers/app.gr.dart';

@RoutePage()
class EditorScreen extends ConsumerWidget {
  const EditorScreen({@PathParam() required this.permalink, super.key});

  final String permalink;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: SafeArea(
        maintainBottomViewPadding: true,
        child: WebView(
          path: '/editor/$permalink?webview=true',
          readOnly: false,
          onJsMessage: (data, reply) async {
            if (data['type'] == 'close') {
              await context.router.maybePop();
            } else if (data['type'] == 'publish') {
              await context.router.replace(
                PostRoute(permalink: data['permalink']),
              );
            }
          },
        ),
      ),
    );
  }
}
