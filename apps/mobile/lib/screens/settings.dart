import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/button.dart';
import 'package:glyph/context/loader.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/push_notification.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultShell(
      title: '설정',
      child: Center(
        child: Button(
          child: const Text('로그아웃'),
          onPressed: () async {
            context.loader.run(() async {
              await ref.read(pushNotificationProvider.notifier).clearToken();
              await ref.read(authProvider.notifier).clearAccessToken();
            });
          },
        ),
      ),
    );
  }
}
