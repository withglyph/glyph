import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class RevenueScreen extends StatelessWidget {
  const RevenueScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      title: '수익/출금',
      useSafeArea: true,
      child: WebView(
        path: '/me/revenue',
        onJsMessage: (data, reply, controller) async {
          if (data['type'] == 'post:view') {
            await context.router.push(
              PostRoute(permalink: data['permalink']),
            );
          }
        },
      ),
    );
  }
}
