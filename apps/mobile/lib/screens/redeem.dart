import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class RedeemScreen extends StatelessWidget {
  const RedeemScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      title: '리딤코드',
      useSafeArea: true,
      child: WebView(
        path: '/me/redeem',
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
