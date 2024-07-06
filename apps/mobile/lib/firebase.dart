import 'dart:async';

import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/routers/app.dart';

Future<void> initializeFirebaseMessaging() async {
  final messaging = GetIt.I<FirebaseMessaging>();
  final router = GetIt.I<AppRouter>();

  await messaging.setForegroundNotificationPresentationOptions(
    alert: true,
  );

  FirebaseMessaging.onMessageOpenedApp.listen((message) async {
    final path = message.data['path'];
    if (path != null) {
      await router.topMostRouter().navigateNamed(path);
    }
  });
}
