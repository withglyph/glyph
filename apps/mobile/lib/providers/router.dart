import 'package:flutter/material.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/screens/splash.dart';
import 'package:glyph/screens/home.dart';
import 'package:glyph/screens/login.dart';
import 'package:glyph/screens/webview.dart';
import 'package:go_router/go_router.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'router.g.dart';

@riverpod
GoRouter router(RouterRef ref) {
  final key = GlobalKey<NavigatorState>();
  final authenticated = ValueNotifier<AsyncValue<bool>>(const AsyncLoading());
  ref
    ..onDispose(authenticated.dispose)
    ..listen(
      authProvider
          .select((value) => value.whenData((value) => value.isAuthenticated)),
      (_, next) => authenticated.value = next,
    );

  final router = GoRouter(
    navigatorKey: key,
    refreshListenable: authenticated,
    initialLocation: '/home',
    debugLogDiagnostics: true,
    routes: [
      ShellRoute(
        routes: [
          StatefulShellRoute.indexedStack(
            pageBuilder: (context, state, navigationShell) {
              return CustomTransitionPage(
                child: Scaffold(
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
                ),
                transitionsBuilder:
                    (context, animation, secondaryAnimation, child) {
                  return FadeTransition(
                    opacity: animation,
                    child: child,
                  );
                },
              );
            },
            branches: [
              StatefulShellBranch(routes: [
                GoRoute(
                  path: '/home',
                  builder: (context, state) => HomeScreen(),
                ),
              ]),
              StatefulShellBranch(routes: [
                GoRoute(
                  path: '/webview',
                  builder: (context, state) => const WebViewScreen(),
                ),
              ]),
            ],
          ),
          GoRoute(
            path: '/login',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: LoginScreen()),
          ),
          GoRoute(
            path: '/_splash',
            pageBuilder: (context, state) =>
                const NoTransitionPage(child: SplashScreen()),
          ),
        ],
        redirect: (context, state) {
          if (authenticated.value.unwrapPrevious().hasError) {
            return '/login';
          }

          if (authenticated.value.isLoading || !authenticated.value.hasValue) {
            return '/_splash';
          }

          final auth = authenticated.value.requireValue;
          if (state.uri.path == '/_splash') {
            return auth ? '/home' : '/login';
          }

          if (state.uri.path == '/login') {
            return auth ? '/home' : null;
          }

          return auth ? null : '/_splash';
        },
        builder: (context, state, child) {
          return Material(child: child);
        },
      )
    ],
  );
  ref.onDispose(router.dispose);

  return router;
}
