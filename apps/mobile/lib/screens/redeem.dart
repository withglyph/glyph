import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/routers/app.gr.dart';

@RoutePage()
class RedeemScreen extends StatelessWidget {
  const RedeemScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const Heading(
        title: Text(
          '리딤코드',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: WebView(
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
