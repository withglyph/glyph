import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/push_notification.dart';
import 'package:glyph/routers/app.gr.dart';

@RoutePage()
class RootRouter extends ConsumerWidget implements AutoRouteWrapper {
  const RootRouter({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pushNotificationNotifier =
        ref.watch(pushNotificationProvider.notifier);
    final isAuthenticated = ref.watch(
      authProvider
          .select((value) => value.whenData((value) => value.isAuthenticated)),
    );

    if (isAuthenticated.valueOrNull == true) {
      unawaited(pushNotificationNotifier.registerToken());
    }

    return AutoRouter.declarative(
      routes: (handler) => [
        switch (isAuthenticated) {
          AsyncData(value: true) => const MainRouter(),
          AsyncData(value: false) => const AuthRouter(),
          _ => const SplashRoute(),
        },
        // ...?handler.initialPendingRoutes,
      ],
    );
  }

  @override
  Widget wrappedRoute(BuildContext context) {
    return ToastScope(
      child: GestureDetector(
        child: this,
        onTapDown: (_) {
          FocusManager.instance.primaryFocus?.unfocus();
        },
      ),
    );
  }
}
