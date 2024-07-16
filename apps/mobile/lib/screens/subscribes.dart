import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class SubscribesScreen extends ConsumerWidget {
  const SubscribesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultShell(
      title: '구독 관리',
      useSafeArea: true,
      child: WebView(
        path: '/me/subscribes',
        onJsMessage: (data, reply, controller) async {
          if (data['type'] == 'space:view') {
            await context.router.push(
              SpaceRoute(slug: data['slug']),
            );
          } else if (data['type'] == 'tag:view') {
            await context.router.push(
              TagRoute(name: data['name']),
            );
          }
        },
      ),
    );
  }
}
