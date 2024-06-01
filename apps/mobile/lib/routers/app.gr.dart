// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:auto_route/auto_route.dart' as _i24;
import 'package:flutter/material.dart' as _i25;
import 'package:glyph/routers/auth.dart' as _i6;
import 'package:glyph/routers/main.dart' as _i16;
import 'package:glyph/routers/root.dart' as _i21;
import 'package:glyph/screens/archive.dart' as _i5;
import 'package:glyph/screens/archive_bookmarks.dart' as _i1;
import 'package:glyph/screens/archive_comments.dart' as _i2;
import 'package:glyph/screens/archive_emojis.dart' as _i3;
import 'package:glyph/screens/archive_recents.dart' as _i4;
import 'package:glyph/screens/editor.dart' as _i7;
import 'package:glyph/screens/feed.dart' as _i8;
import 'package:glyph/screens/home.dart' as _i9;
import 'package:glyph/screens/login.dart' as _i11;
import 'package:glyph/screens/login_with_code.dart' as _i12;
import 'package:glyph/screens/login_with_email.dart' as _i14;
import 'package:glyph/screens/login_with_email_next.dart' as _i13;
import 'package:glyph/screens/login_with_token.dart' as _i15;
import 'package:glyph/screens/me.dart' as _i17;
import 'package:glyph/screens/notification.dart' as _i18;
import 'package:glyph/screens/placeholder.dart' as _i19;
import 'package:glyph/screens/post.dart' as _i20;
import 'package:glyph/screens/settings.dart' as _i22;
import 'package:glyph/screens/splash.dart' as _i23;
import 'package:glyph/shells/lobby.dart' as _i10;

abstract class $AppRouter extends _i24.RootStackRouter {
  $AppRouter({super.navigatorKey});

  @override
  final Map<String, _i24.PageFactory> pagesMap = {
    ArchiveBookmarksRoute.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i1.ArchiveBookmarksScreen(),
      );
    },
    ArchiveCommentsRoute.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i2.ArchiveCommentsScreen(),
      );
    },
    ArchiveEmojisRoute.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i3.ArchiveEmojisScreen(),
      );
    },
    ArchiveRecentsRoute.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i4.ArchiveRecentsScreen(),
      );
    },
    ArchiveRoute.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i5.ArchiveScreen(),
      );
    },
    AuthRouter.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i6.AuthRouter(),
      );
    },
    EditorRoute.name: (routeData) {
      final pathParams = routeData.inheritedPathParams;
      final args = routeData.argsAs<EditorRouteArgs>(
          orElse: () =>
              EditorRouteArgs(permalink: pathParams.getString('permalink')));
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i7.EditorScreen(
          key: args.key,
          permalink: args.permalink,
        ),
      );
    },
    FeedRoute.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i8.FeedScreen(),
      );
    },
    HomeRoute.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i9.HomeScreen(),
      );
    },
    LobbyShell.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i10.LobbyShell(),
      );
    },
    LoginRoute.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i11.LoginScreen(),
      );
    },
    LoginWithCodeRoute.name: (routeData) {
      final args = routeData.argsAs<LoginWithCodeRouteArgs>();
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i12.LoginWithCodeScreen(
          key: args.key,
          email: args.email,
        ),
      );
    },
    LoginWithEmailNextRoute.name: (routeData) {
      final args = routeData.argsAs<LoginWithEmailNextRouteArgs>();
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i13.LoginWithEmailNextScreen(
          key: args.key,
          email: args.email,
        ),
      );
    },
    LoginWithEmailRoute.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i14.LoginWithEmailScreen(),
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
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i15.LoginWithTokenScreen(
          key: args.key,
          token: args.token,
        ),
      );
    },
    MainRouter.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i16.MainRouter(),
      );
    },
    MeRoute.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i17.MeScreen(),
      );
    },
    NotificationRoute.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i18.NotificationScreen(),
      );
    },
    PlaceholderRoute.name: (routeData) {
      final args = routeData.argsAs<PlaceholderRouteArgs>();
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i19.PlaceholderScreen(
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
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i20.PostScreen(
          key: args.key,
          permalink: args.permalink,
        ),
      );
    },
    RootRouter.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i24.WrappedRoute(child: const _i21.RootRouter()),
      );
    },
    SettingsRoute.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i22.SettingsScreen(),
      );
    },
    SplashRoute.name: (routeData) {
      return _i24.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i23.SplashScreen(),
      );
    },
  };
}

/// generated route for
/// [_i1.ArchiveBookmarksScreen]
class ArchiveBookmarksRoute extends _i24.PageRouteInfo<void> {
  const ArchiveBookmarksRoute({List<_i24.PageRouteInfo>? children})
      : super(
          ArchiveBookmarksRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveBookmarksRoute';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i2.ArchiveCommentsScreen]
class ArchiveCommentsRoute extends _i24.PageRouteInfo<void> {
  const ArchiveCommentsRoute({List<_i24.PageRouteInfo>? children})
      : super(
          ArchiveCommentsRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveCommentsRoute';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i3.ArchiveEmojisScreen]
class ArchiveEmojisRoute extends _i24.PageRouteInfo<void> {
  const ArchiveEmojisRoute({List<_i24.PageRouteInfo>? children})
      : super(
          ArchiveEmojisRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveEmojisRoute';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i4.ArchiveRecentsScreen]
class ArchiveRecentsRoute extends _i24.PageRouteInfo<void> {
  const ArchiveRecentsRoute({List<_i24.PageRouteInfo>? children})
      : super(
          ArchiveRecentsRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveRecentsRoute';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i5.ArchiveScreen]
class ArchiveRoute extends _i24.PageRouteInfo<void> {
  const ArchiveRoute({List<_i24.PageRouteInfo>? children})
      : super(
          ArchiveRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveRoute';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i6.AuthRouter]
class AuthRouter extends _i24.PageRouteInfo<void> {
  const AuthRouter({List<_i24.PageRouteInfo>? children})
      : super(
          AuthRouter.name,
          initialChildren: children,
        );

  static const String name = 'AuthRouter';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i7.EditorScreen]
class EditorRoute extends _i24.PageRouteInfo<EditorRouteArgs> {
  EditorRoute({
    _i25.Key? key,
    required String permalink,
    List<_i24.PageRouteInfo>? children,
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

  static const _i24.PageInfo<EditorRouteArgs> page =
      _i24.PageInfo<EditorRouteArgs>(name);
}

class EditorRouteArgs {
  const EditorRouteArgs({
    this.key,
    required this.permalink,
  });

  final _i25.Key? key;

  final String permalink;

  @override
  String toString() {
    return 'EditorRouteArgs{key: $key, permalink: $permalink}';
  }
}

/// generated route for
/// [_i8.FeedScreen]
class FeedRoute extends _i24.PageRouteInfo<void> {
  const FeedRoute({List<_i24.PageRouteInfo>? children})
      : super(
          FeedRoute.name,
          initialChildren: children,
        );

  static const String name = 'FeedRoute';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i9.HomeScreen]
class HomeRoute extends _i24.PageRouteInfo<void> {
  const HomeRoute({List<_i24.PageRouteInfo>? children})
      : super(
          HomeRoute.name,
          initialChildren: children,
        );

  static const String name = 'HomeRoute';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i10.LobbyShell]
class LobbyShell extends _i24.PageRouteInfo<void> {
  const LobbyShell({List<_i24.PageRouteInfo>? children})
      : super(
          LobbyShell.name,
          initialChildren: children,
        );

  static const String name = 'LobbyShell';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i11.LoginScreen]
class LoginRoute extends _i24.PageRouteInfo<void> {
  const LoginRoute({List<_i24.PageRouteInfo>? children})
      : super(
          LoginRoute.name,
          initialChildren: children,
        );

  static const String name = 'LoginRoute';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i12.LoginWithCodeScreen]
class LoginWithCodeRoute extends _i24.PageRouteInfo<LoginWithCodeRouteArgs> {
  LoginWithCodeRoute({
    _i25.Key? key,
    required String email,
    List<_i24.PageRouteInfo>? children,
  }) : super(
          LoginWithCodeRoute.name,
          args: LoginWithCodeRouteArgs(
            key: key,
            email: email,
          ),
          initialChildren: children,
        );

  static const String name = 'LoginWithCodeRoute';

  static const _i24.PageInfo<LoginWithCodeRouteArgs> page =
      _i24.PageInfo<LoginWithCodeRouteArgs>(name);
}

class LoginWithCodeRouteArgs {
  const LoginWithCodeRouteArgs({
    this.key,
    required this.email,
  });

  final _i25.Key? key;

  final String email;

  @override
  String toString() {
    return 'LoginWithCodeRouteArgs{key: $key, email: $email}';
  }
}

/// generated route for
/// [_i13.LoginWithEmailNextScreen]
class LoginWithEmailNextRoute
    extends _i24.PageRouteInfo<LoginWithEmailNextRouteArgs> {
  LoginWithEmailNextRoute({
    _i25.Key? key,
    required String email,
    List<_i24.PageRouteInfo>? children,
  }) : super(
          LoginWithEmailNextRoute.name,
          args: LoginWithEmailNextRouteArgs(
            key: key,
            email: email,
          ),
          initialChildren: children,
        );

  static const String name = 'LoginWithEmailNextRoute';

  static const _i24.PageInfo<LoginWithEmailNextRouteArgs> page =
      _i24.PageInfo<LoginWithEmailNextRouteArgs>(name);
}

class LoginWithEmailNextRouteArgs {
  const LoginWithEmailNextRouteArgs({
    this.key,
    required this.email,
  });

  final _i25.Key? key;

  final String email;

  @override
  String toString() {
    return 'LoginWithEmailNextRouteArgs{key: $key, email: $email}';
  }
}

/// generated route for
/// [_i14.LoginWithEmailScreen]
class LoginWithEmailRoute extends _i24.PageRouteInfo<void> {
  const LoginWithEmailRoute({List<_i24.PageRouteInfo>? children})
      : super(
          LoginWithEmailRoute.name,
          initialChildren: children,
        );

  static const String name = 'LoginWithEmailRoute';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i15.LoginWithTokenScreen]
class LoginWithTokenRoute extends _i24.PageRouteInfo<LoginWithTokenRouteArgs> {
  LoginWithTokenRoute({
    _i25.Key? key,
    String token = '',
    List<_i24.PageRouteInfo>? children,
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

  static const _i24.PageInfo<LoginWithTokenRouteArgs> page =
      _i24.PageInfo<LoginWithTokenRouteArgs>(name);
}

class LoginWithTokenRouteArgs {
  const LoginWithTokenRouteArgs({
    this.key,
    this.token = '',
  });

  final _i25.Key? key;

  final String token;

  @override
  String toString() {
    return 'LoginWithTokenRouteArgs{key: $key, token: $token}';
  }
}

/// generated route for
/// [_i16.MainRouter]
class MainRouter extends _i24.PageRouteInfo<void> {
  const MainRouter({List<_i24.PageRouteInfo>? children})
      : super(
          MainRouter.name,
          initialChildren: children,
        );

  static const String name = 'MainRouter';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i17.MeScreen]
class MeRoute extends _i24.PageRouteInfo<void> {
  const MeRoute({List<_i24.PageRouteInfo>? children})
      : super(
          MeRoute.name,
          initialChildren: children,
        );

  static const String name = 'MeRoute';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i18.NotificationScreen]
class NotificationRoute extends _i24.PageRouteInfo<void> {
  const NotificationRoute({List<_i24.PageRouteInfo>? children})
      : super(
          NotificationRoute.name,
          initialChildren: children,
        );

  static const String name = 'NotificationRoute';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i19.PlaceholderScreen]
class PlaceholderRoute extends _i24.PageRouteInfo<PlaceholderRouteArgs> {
  PlaceholderRoute({
    _i25.Key? key,
    required String text,
    List<_i24.PageRouteInfo>? children,
  }) : super(
          PlaceholderRoute.name,
          args: PlaceholderRouteArgs(
            key: key,
            text: text,
          ),
          initialChildren: children,
        );

  static const String name = 'PlaceholderRoute';

  static const _i24.PageInfo<PlaceholderRouteArgs> page =
      _i24.PageInfo<PlaceholderRouteArgs>(name);
}

class PlaceholderRouteArgs {
  const PlaceholderRouteArgs({
    this.key,
    required this.text,
  });

  final _i25.Key? key;

  final String text;

  @override
  String toString() {
    return 'PlaceholderRouteArgs{key: $key, text: $text}';
  }
}

/// generated route for
/// [_i20.PostScreen]
class PostRoute extends _i24.PageRouteInfo<PostRouteArgs> {
  PostRoute({
    _i25.Key? key,
    required String permalink,
    List<_i24.PageRouteInfo>? children,
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

  static const _i24.PageInfo<PostRouteArgs> page =
      _i24.PageInfo<PostRouteArgs>(name);
}

class PostRouteArgs {
  const PostRouteArgs({
    this.key,
    required this.permalink,
  });

  final _i25.Key? key;

  final String permalink;

  @override
  String toString() {
    return 'PostRouteArgs{key: $key, permalink: $permalink}';
  }
}

/// generated route for
/// [_i21.RootRouter]
class RootRouter extends _i24.PageRouteInfo<void> {
  const RootRouter({List<_i24.PageRouteInfo>? children})
      : super(
          RootRouter.name,
          initialChildren: children,
        );

  static const String name = 'RootRouter';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i22.SettingsScreen]
class SettingsRoute extends _i24.PageRouteInfo<void> {
  const SettingsRoute({List<_i24.PageRouteInfo>? children})
      : super(
          SettingsRoute.name,
          initialChildren: children,
        );

  static const String name = 'SettingsRoute';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}

/// generated route for
/// [_i23.SplashScreen]
class SplashRoute extends _i24.PageRouteInfo<void> {
  const SplashRoute({List<_i24.PageRouteInfo>? children})
      : super(
          SplashRoute.name,
          initialChildren: children,
        );

  static const String name = 'SplashRoute';

  static const _i24.PageInfo<void> page = _i24.PageInfo<void>(name);
}
