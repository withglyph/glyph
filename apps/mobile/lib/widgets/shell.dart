import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/providers/push_notification.dart';
import 'package:go_router/go_router.dart';

class Shell extends ConsumerWidget {
  Shell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;
  final _messaging = GetIt.I<FirebaseMessaging>();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen(pushNotificationProvider, (_, next) async {
      await _messaging.requestPermission();
      await ref.read(pushNotificationProvider.notifier).registerToken();
    });

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: BottomNavigationBar(
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.web_asset),
            label: 'WebView',
          ),
        ],
        currentIndex: navigationShell.currentIndex,
        onTap: navigationShell.goBranch,
      ),
    );
  }
}
