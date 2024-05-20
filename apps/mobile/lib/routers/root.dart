import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/routers/app.gr.dart';

@RoutePage()
class RootRouter extends ConsumerWidget {
  const RootRouter({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isAuthenticated = ref.watch(authProvider
        .select((value) => value.whenData((value) => value.isAuthenticated)));

    return AutoRouter.declarative(
      routes: (_) => [
        switch (isAuthenticated) {
          AsyncData(value: true) => const MainRouter(),
          AsyncData(value: false) => const AuthRouter(),
          _ => const SplashRoute(),
        },
      ],
    );
  }
}
