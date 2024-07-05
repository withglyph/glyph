import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/context/loader.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class DeactivateScreen extends ConsumerWidget {
  const DeactivateScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultShell(
      title: '회원 탈퇴',
      child: WebView(
        path: '/me/settings/deactivate',
        onJsMessage: (data, reply, controller) async {
          if (data['type'] == 'deactivate:cancel') {
            await context.router.maybePop();
          } else if (data['type'] == 'deactivate:done') {
            await context.loader.run(() async {
              await ref.read(authProvider.notifier).clearAccessToken();
            });
          }
        },
      ),
    );
  }
}
