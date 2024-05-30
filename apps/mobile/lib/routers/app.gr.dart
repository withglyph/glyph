// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:auto_route/auto_route.dart' as _i23;
import 'package:flutter/material.dart' as _i24;
import 'package:glyph/routers/auth.dart' as _i6;
import 'package:glyph/routers/main.dart' as _i15;
import 'package:glyph/routers/root.dart' as _i20;
import 'package:glyph/screens/archive.dart' as _i5;
import 'package:glyph/screens/archive_bookmarks.dart' as _i1;
import 'package:glyph/screens/archive_comments.dart' as _i2;
import 'package:glyph/screens/archive_emojis.dart' as _i3;
import 'package:glyph/screens/archive_recents.dart' as _i4;
import 'package:glyph/screens/editor.dart' as _i7;
import 'package:glyph/screens/feed.dart' as _i8;
import 'package:glyph/screens/home.dart' as _i9;
import 'package:glyph/screens/login.dart' as _i11;
import 'package:glyph/screens/login_with_email.dart' as _i13;
import 'package:glyph/screens/login_with_email_next.dart' as _i12;
import 'package:glyph/screens/login_with_token.dart' as _i14;
import 'package:glyph/screens/me.dart' as _i16;
import 'package:glyph/screens/notification.dart' as _i17;
import 'package:glyph/screens/placeholder.dart' as _i18;
import 'package:glyph/screens/post.dart' as _i19;
import 'package:glyph/screens/settings.dart' as _i21;
import 'package:glyph/screens/splash.dart' as _i22;
import 'package:glyph/shells/lobby.dart' as _i10;

abstract class $AppRouter extends _i23.RootStackRouter {
  $AppRouter({super.navigatorKey});

  @override
  final Map<String, _i23.PageFactory> pagesMap = {
    ArchiveBookmarksRoute.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i1.ArchiveBookmarksScreen(),
      );
    },
    ArchiveCommentsRoute.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i2.ArchiveCommentsScreen(),
      );
    },
    ArchiveEmojisRoute.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i3.ArchiveEmojisScreen(),
      );
    },
    ArchiveRecentsRoute.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i4.ArchiveRecentsScreen(),
      );
    },
    ArchiveRoute.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i5.ArchiveScreen(),
      );
    },
    AuthRouter.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i6.AuthRouter(),
      );
    },
    EditorRoute.name: (routeData) {
      final pathParams = routeData.inheritedPathParams;
      final args = routeData.argsAs<EditorRouteArgs>(
          orElse: () =>
              EditorRouteArgs(permalink: pathParams.getString('permalink')));
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i7.EditorScreen(
          key: args.key,
          permalink: args.permalink,
        ),
      );
    },
    FeedRoute.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i8.FeedScreen(),
      );
    },
    HomeRoute.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i9.HomeScreen(),
      );
    },
    LobbyShell.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i10.LobbyShell(),
      );
    },
    LoginRoute.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i11.LoginScreen(),
      );
    },
    LoginWithEmailNextRoute.name: (routeData) {
      final args = routeData.argsAs<LoginWithEmailNextRouteArgs>();
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i12.LoginWithEmailNextScreen(
          key: args.key,
          email: args.email,
        ),
      );
    },
    LoginWithEmailRoute.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i13.LoginWithEmailScreen(),
      );
    },
    LoginWithTokenRoute.name: (routeData) {
      final queryParams = routeData.queryParams;
      final args = routeData.argsAs<LoginWithTokenRouteArgs>(
          orElse: () => LoginWithTokenRouteArgs(
                  token: queryParams.getString(
                'token',
                '',
              )));
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i14.LoginWithTokenScreen(
          key: args.key,
          token: args.token,
        ),
      );
    },
    MainRouter.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i15.MainRouter(),
      );
    },
    MeRoute.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i16.MeScreen(),
      );
    },
    NotificationRoute.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i17.NotificationScreen(),
      );
    },
    PlaceholderRoute.name: (routeData) {
      final args = routeData.argsAs<PlaceholderRouteArgs>();
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i18.PlaceholderScreen(
          key: args.key,
          text: args.text,
        ),
      );
    },
    PostRoute.name: (routeData) {
      final pathParams = routeData.inheritedPathParams;
      final args = routeData.argsAs<PostRouteArgs>(
          orElse: () =>
              PostRouteArgs(permalink: pathParams.getString('permalink')));
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i19.PostScreen(
          key: args.key,
          permalink: args.permalink,
        ),
      );
    },
    RootRouter.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i23.WrappedRoute(child: const _i20.RootRouter()),
      );
    },
    SettingsRoute.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i21.SettingsScreen(),
      );
    },
    SplashRoute.name: (routeData) {
      return _i23.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i22.SplashScreen(),
      );
    },
  };
}

/// generated route for
/// [_i1.ArchiveBookmarksScreen]
class ArchiveBookmarksRoute extends _i23.PageRouteInfo<void> {
  const ArchiveBookmarksRoute({List<_i23.PageRouteInfo>? children})
      : super(
          ArchiveBookmarksRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveBookmarksRoute';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i2.ArchiveCommentsScreen]
class ArchiveCommentsRoute extends _i23.PageRouteInfo<void> {
  const ArchiveCommentsRoute({List<_i23.PageRouteInfo>? children})
      : super(
          ArchiveCommentsRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveCommentsRoute';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i3.ArchiveEmojisScreen]
class ArchiveEmojisRoute extends _i23.PageRouteInfo<void> {
  const ArchiveEmojisRoute({List<_i23.PageRouteInfo>? children})
      : super(
          ArchiveEmojisRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveEmojisRoute';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i4.ArchiveRecentsScreen]
class ArchiveRecentsRoute extends _i23.PageRouteInfo<void> {
  const ArchiveRecentsRoute({List<_i23.PageRouteInfo>? children})
      : super(
          ArchiveRecentsRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveRecentsRoute';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i5.ArchiveScreen]
class ArchiveRoute extends _i23.PageRouteInfo<void> {
  const ArchiveRoute({List<_i23.PageRouteInfo>? children})
      : super(
          ArchiveRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveRoute';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i6.AuthRouter]
class AuthRouter extends _i23.PageRouteInfo<void> {
  const AuthRouter({List<_i23.PageRouteInfo>? children})
      : super(
          AuthRouter.name,
          initialChildren: children,
        );

  static const String name = 'AuthRouter';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i7.EditorScreen]
class EditorRoute extends _i23.PageRouteInfo<EditorRouteArgs> {
  EditorRoute({
    _i24.Key? key,
    required String permalink,
    List<_i23.PageRouteInfo>? children,
  }) : super(
          EditorRoute.name,
          args: EditorRouteArgs(
            key: key,
            permalink: permalink,
          ),
          rawPathParams: {'permalink': permalink},
          initialChildren: children,
        );

  static const String name = 'EditorRoute';

  static const _i23.PageInfo<EditorRouteArgs> page =
      _i23.PageInfo<EditorRouteArgs>(name);
}

class EditorRouteArgs {
  const EditorRouteArgs({
    this.key,
    required this.permalink,
  });

  final _i24.Key? key;

  final String permalink;

  @override
  String toString() {
    return 'EditorRouteArgs{key: $key, permalink: $permalink}';
  }
}

/// generated route for
/// [_i8.FeedScreen]
class FeedRoute extends _i23.PageRouteInfo<void> {
  const FeedRoute({List<_i23.PageRouteInfo>? children})
      : super(
          FeedRoute.name,
          initialChildren: children,
        );

  static const String name = 'FeedRoute';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i9.HomeScreen]
class HomeRoute extends _i23.PageRouteInfo<void> {
  const HomeRoute({List<_i23.PageRouteInfo>? children})
      : super(
          HomeRoute.name,
          initialChildren: children,
        );

  static const String name = 'HomeRoute';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i10.LobbyShell]
class LobbyShell extends _i23.PageRouteInfo<void> {
  const LobbyShell({List<_i23.PageRouteInfo>? children})
      : super(
          LobbyShell.name,
          initialChildren: children,
        );

  static const String name = 'LobbyShell';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i11.LoginScreen]
class LoginRoute extends _i23.PageRouteInfo<void> {
  const LoginRoute({List<_i23.PageRouteInfo>? children})
      : super(
          LoginRoute.name,
          initialChildren: children,
        );

  static const String name = 'LoginRoute';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i12.LoginWithEmailNextScreen]
class LoginWithEmailNextRoute
    extends _i23.PageRouteInfo<LoginWithEmailNextRouteArgs> {
  LoginWithEmailNextRoute({
    _i24.Key? key,
    required String email,
    List<_i23.PageRouteInfo>? children,
  }) : super(
          LoginWithEmailNextRoute.name,
          args: LoginWithEmailNextRouteArgs(
            key: key,
            email: email,
          ),
          initialChildren: children,
        );

  static const String name = 'LoginWithEmailNextRoute';

  static const _i23.PageInfo<LoginWithEmailNextRouteArgs> page =
      _i23.PageInfo<LoginWithEmailNextRouteArgs>(name);
}

class LoginWithEmailNextRouteArgs {
  const LoginWithEmailNextRouteArgs({
    this.key,
    required this.email,
  });

  final _i24.Key? key;

  final String email;

  @override
  String toString() {
    return 'LoginWithEmailNextRouteArgs{key: $key, email: $email}';
  }
}

/// generated route for
/// [_i13.LoginWithEmailScreen]
class LoginWithEmailRoute extends _i23.PageRouteInfo<void> {
  const LoginWithEmailRoute({List<_i23.PageRouteInfo>? children})
      : super(
          LoginWithEmailRoute.name,
          initialChildren: children,
        );

  static const String name = 'LoginWithEmailRoute';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i14.LoginWithTokenScreen]
class LoginWithTokenRoute extends _i23.PageRouteInfo<LoginWithTokenRouteArgs> {
  LoginWithTokenRoute({
    _i24.Key? key,
    String token = '',
    List<_i23.PageRouteInfo>? children,
  }) : super(
          LoginWithTokenRoute.name,
          args: LoginWithTokenRouteArgs(
            key: key,
            token: token,
          ),
          rawQueryParams: {'token': token},
          initialChildren: children,
        );

  static const String name = 'LoginWithTokenRoute';

  static const _i23.PageInfo<LoginWithTokenRouteArgs> page =
      _i23.PageInfo<LoginWithTokenRouteArgs>(name);
}

class LoginWithTokenRouteArgs {
  const LoginWithTokenRouteArgs({
    this.key,
    this.token = '',
  });

  final _i24.Key? key;

  final String token;

  @override
  String toString() {
    return 'LoginWithTokenRouteArgs{key: $key, token: $token}';
  }
}

/// generated route for
/// [_i15.MainRouter]
class MainRouter extends _i23.PageRouteInfo<void> {
  const MainRouter({List<_i23.PageRouteInfo>? children})
      : super(
          MainRouter.name,
          initialChildren: children,
        );

  static const String name = 'MainRouter';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i16.MeScreen]
class MeRoute extends _i23.PageRouteInfo<void> {
  const MeRoute({List<_i23.PageRouteInfo>? children})
      : super(
          MeRoute.name,
          initialChildren: children,
        );

  static const String name = 'MeRoute';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i17.NotificationScreen]
class NotificationRoute extends _i23.PageRouteInfo<void> {
  const NotificationRoute({List<_i23.PageRouteInfo>? children})
      : super(
          NotificationRoute.name,
          initialChildren: children,
        );

  static const String name = 'NotificationRoute';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i18.PlaceholderScreen]
class PlaceholderRoute extends _i23.PageRouteInfo<PlaceholderRouteArgs> {
  PlaceholderRoute({
    _i24.Key? key,
    required String text,
    List<_i23.PageRouteInfo>? children,
  }) : super(
          PlaceholderRoute.name,
          args: PlaceholderRouteArgs(
            key: key,
            text: text,
          ),
          initialChildren: children,
        );

  static const String name = 'PlaceholderRoute';

  static const _i23.PageInfo<PlaceholderRouteArgs> page =
      _i23.PageInfo<PlaceholderRouteArgs>(name);
}

class PlaceholderRouteArgs {
  const PlaceholderRouteArgs({
    this.key,
    required this.text,
  });

  final _i24.Key? key;

  final String text;

  @override
  String toString() {
    return 'PlaceholderRouteArgs{key: $key, text: $text}';
  }
}

/// generated route for
/// [_i19.PostScreen]
class PostRoute extends _i23.PageRouteInfo<PostRouteArgs> {
  PostRoute({
    _i24.Key? key,
    required String permalink,
    List<_i23.PageRouteInfo>? children,
  }) : super(
          PostRoute.name,
          args: PostRouteArgs(
            key: key,
            permalink: permalink,
          ),
          rawPathParams: {'permalink': permalink},
          initialChildren: children,
        );

  static const String name = 'PostRoute';

  static const _i23.PageInfo<PostRouteArgs> page =
      _i23.PageInfo<PostRouteArgs>(name);
}

class PostRouteArgs {
  const PostRouteArgs({
    this.key,
    required this.permalink,
  });

  final _i24.Key? key;

  final String permalink;

  @override
  String toString() {
    return 'PostRouteArgs{key: $key, permalink: $permalink}';
  }
}

/// generated route for
/// [_i20.RootRouter]
class RootRouter extends _i23.PageRouteInfo<void> {
  const RootRouter({List<_i23.PageRouteInfo>? children})
      : super(
          RootRouter.name,
          initialChildren: children,
        );

  static const String name = 'RootRouter';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i21.SettingsScreen]
class SettingsRoute extends _i23.PageRouteInfo<void> {
  const SettingsRoute({List<_i23.PageRouteInfo>? children})
      : super(
          SettingsRoute.name,
          initialChildren: children,
        );

  static const String name = 'SettingsRoute';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}

/// generated route for
/// [_i22.SplashScreen]
class SplashRoute extends _i23.PageRouteInfo<void> {
  const SplashRoute({List<_i23.PageRouteInfo>? children})
      : super(
          SplashRoute.name,
          initialChildren: children,
        );

  static const String name = 'SplashRoute';

  static const _i23.PageInfo<void> page = _i23.PageInfo<void>(name);
}
