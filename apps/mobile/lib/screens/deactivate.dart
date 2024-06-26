import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/webview.dart';

@RoutePage()
class DeactivateScreen extends StatelessWidget {
  const DeactivateScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const Heading(
        title: Text(
          '회원 탈퇴',
          style: TextStyle(
            fontSize: 17,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
      body: WebView(
        path: '/me/settings/deactivate',
        onJsMessage: (data, reply) async {
          if (data['type'] == 'deactivate:cancel') {
            await context.router.maybePop();
          }
        },
      ),
    );
  }
}
