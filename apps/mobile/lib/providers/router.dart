import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'router.g.dart';

@riverpod
RouterConfig<Object> router(RouterRef ref) {
  final router = AppRouter(ref: ref);
  final authNotifier = ValueNotifier<AsyncValue<bool>>(const AsyncLoading());

  ref
    ..onDispose(authNotifier.dispose)
    ..onDispose(router.dispose)
    ..listen(
      authProvider
          .select((value) => value.whenData((value) => value.isAuthenticated)),
      (_, next) => authNotifier.value = next,
    );

  return router.config(
    reevaluateListenable: authNotifier,
    navigatorObservers: () => [AutoRouteObserver(), AppRouterObserver()],
  );
}
