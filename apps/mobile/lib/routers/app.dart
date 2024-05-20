import 'package:auto_route/auto_route.dart';
import 'package:glyph/routers/app.gr.dart';

@AutoRouterConfig()
class AppRouter extends $AppRouter {
  @override
  RouteType get defaultRouteType => const RouteType.cupertino();

  @override
  final List<AutoRoute> routes = [
    AutoRoute(
      page: RootRouter.page,
      initial: true,
      children: [
        CustomRoute(
          page: SplashRoute.page,
          initial: true,
          transitionsBuilder: TransitionsBuilders.fadeIn,
        ),
        CustomRoute(
          page: MainRouter.page,
          transitionsBuilder: TransitionsBuilders.fadeIn,
          children: [
            AutoRoute(
              page: RootShellRoute.page,
              initial: true,
              children: [
                AutoRoute(page: HomeRoute.page, initial: true),
                AutoRoute(page: FeedRoute.page),
                AutoRoute(page: EditorRoute.page),
                AutoRoute(page: ArchiveRoute.page),
                AutoRoute(page: MeRoute.page),
              ],
            ),
            AutoRoute(page: PlaceholderRoute.page),
          ],
        ),
        CustomRoute(
          page: AuthRouter.page,
          transitionsBuilder: TransitionsBuilders.fadeIn,
          children: [
            AutoRoute(page: LoginRoute.page, initial: true),
          ],
        ),
      ],
    ),
  ];
}
