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
      path: '/',
      initial: true,
      children: [
        CustomRoute(
          page: SplashRoute.page,
          path: '_splash',
          initial: true,
          transitionsBuilder: TransitionsBuilders.fadeIn,
        ),
        CustomRoute(
          page: AuthRouter.page,
          path: '',
          transitionsBuilder: TransitionsBuilders.fadeIn,
          children: [
            AutoRoute(page: LoginRoute.page, initial: true, path: 'login'),
            AutoRoute(page: LoginWithEmailRoute.page),
            AutoRoute(page: LoginWithEmailNextRoute.page),
            AutoRoute(page: LoginWithCodeRoute.page),
            AutoRoute(page: LoginWithTokenRoute.page, path: 'api/email'),
          ],
        ),
        CustomRoute(
          page: MainRouter.page,
          path: '',
          transitionsBuilder: TransitionsBuilders.fadeIn,
          children: [
            AutoRoute(
              page: LobbyShell.page,
              initial: true,
              children: [
                AutoRoute(page: FeedRoute.page, initial: true),
                AutoRoute(page: SearchRoute.page, path: 'search'),
                AutoRoute(
                  page: ArchiveRoute.page,
                  path: 'archive',
                  children: [
                    AutoRoute(page: ArchiveBookmarksRoute.page),
                    AutoRoute(page: ArchivePurchasesRoute.page),
                    AutoRoute(page: ArchiveRecentsRoute.page),
                    AutoRoute(page: ArchiveEmojisRoute.page),
                    AutoRoute(page: ArchiveCommentsRoute.page),
                  ],
                ),
                AutoRoute(page: MeRoute.page, path: 'me'),
              ],
            ),
            AutoRoute(
              page: EditorRoute.page,
              fullscreenDialog: true,
              path: 'editor/:permalink',
              usesPathAsKey: true,
            ),
            AutoRoute(page: PlaceholderRoute.page),
            AutoRoute(page: NotificationRoute.page),
            AutoRoute(page: SettingsRoute.page),
            AutoRoute(page: ProfileRoute.page),
            AutoRoute(
              page: PointRoute.page,
              children: [
                AutoRoute(page: PointPurchaseRoute.page),
                AutoRoute(page: PointHistoryRoute.page),
              ],
            ),
            AutoRoute(page: OssLicensesRoute.page),
            AutoRoute(page: OssLicensesDetailsRoute.page),
            AutoRoute(
              page: WebViewRoute.page,
              path: 'webview/:path',
              usesPathAsKey: true,
            ),
            AutoRoute(
              page: TagRoute.page,
              path: 'tag/:tag',
              usesPathAsKey: true,
            ),
            AutoRoute(
              page: PostRoute.page,
              path: ':space/:permalink',
              usesPathAsKey: true,
            ),
          ],
        ),
      ],
    ),
  ];
}
