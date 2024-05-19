import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/router.gr.dart';

@AutoRouterConfig()
class AppRouter extends $AppRouter implements AutoRouteGuard {
  AppRouter({required this.ref}) : super();

  Ref ref;

  @override
  List<AutoRoute> get routes => [
        AutoRoute(
          page: RootShellRoute.page,
          initial: true,
          children: [
            AutoRoute(page: HomeRoute.page),
            AutoRoute(page: FeedRoute.page),
            AutoRoute(page: EditorRoute.page),
            AutoRoute(page: ArchiveRoute.page),
            AutoRoute(page: MeRoute.page),
          ],
        ),
        CustomRoute(page: LoginRoute.page),
        AutoRoute(page: PlaceholderRoute.page),
      ];

  @override
  void onNavigation(NavigationResolver resolver, StackRouter router) {
    final auth =
        ref.read(authProvider).whenData((value) => value.isAuthenticated);

    if (auth.isLoading || !auth.hasValue) {
      resolver.next();
    } else {
      if (auth.requireValue || resolver.route.name == LoginRoute.name) {
        resolver.next();
      } else {
        resolver.redirect(LoginRoute(
          onResult: (didLogin) {
            resolver.next(didLogin);
          },
        ));
      }
    }
  }
}

class AppRouterObserver extends AutoRouterObserver {
  @override
  void didPush(Route route, Route? previousRoute) {
    print('New route pushed: ${route.settings.name}');
  }

  @override
  void didPop(Route route, Route? previousRoute) {
    print('Route popped: ${route.settings.name}');
  }

  @override
  void didReplace({Route? newRoute, Route? oldRoute}) {
    print('Route replaced: ${newRoute?.settings.name}');
  }

  @override
  void didRemove(Route route, Route? previousRoute) {
    print('Route removed: ${route.settings.name}');
  }

  @override
  void didStartUserGesture(Route route, Route? previousRoute) {
    print('User started gesture: ${route.settings.name}');
  }

  @override
  void didStopUserGesture() {
    print('User stopped gesture');
  }

  @override
  void didInitTabRoute(TabPageRoute route, TabPageRoute? previousRoute) {
    print('Tab route visited: ${route.name}');
  }

  @override
  void didChangeTabRoute(TabPageRoute route, TabPageRoute previousRoute) {
    print('Tab route re-visited: ${route.name}');
  }
}
