// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:auto_route/auto_route.dart' as _i18;
import 'package:flutter/material.dart' as _i19;
import 'package:glyph/routers/auth.dart' as _i2;
import 'package:glyph/routers/main.dart' as _i11;
import 'package:glyph/routers/root.dart' as _i16;
import 'package:glyph/screens/archive.dart' as _i1;
import 'package:glyph/screens/editor.dart' as _i3;
import 'package:glyph/screens/feed.dart' as _i4;
import 'package:glyph/screens/home.dart' as _i5;
import 'package:glyph/screens/login.dart' as _i7;
import 'package:glyph/screens/login_with_email.dart' as _i9;
import 'package:glyph/screens/login_with_email_next.dart' as _i8;
import 'package:glyph/screens/login_with_token.dart' as _i10;
import 'package:glyph/screens/me.dart' as _i12;
import 'package:glyph/screens/notification.dart' as _i13;
import 'package:glyph/screens/placeholder.dart' as _i14;
import 'package:glyph/screens/post.dart' as _i15;
import 'package:glyph/screens/splash.dart' as _i17;
import 'package:glyph/shells/lobby.dart' as _i6;

abstract class $AppRouter extends _i18.RootStackRouter {
  $AppRouter({super.navigatorKey});

  @override
  final Map<String, _i18.PageFactory> pagesMap = {
    ArchiveRoute.name: (routeData) {
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i1.ArchiveScreen(),
      );
    },
    AuthRouter.name: (routeData) {
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i2.AuthRouter(),
      );
    },
    EditorRoute.name: (routeData) {
      final pathParams = routeData.inheritedPathParams;
      final args = routeData.argsAs<EditorRouteArgs>(
          orElse: () =>
              EditorRouteArgs(permalink: pathParams.getString('permalink')));
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i3.EditorScreen(
          key: args.key,
          permalink: args.permalink,
        ),
      );
    },
    FeedRoute.name: (routeData) {
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i4.FeedScreen(),
      );
    },
    HomeRoute.name: (routeData) {
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i5.HomeScreen(),
      );
    },
    LobbyShell.name: (routeData) {
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i6.LobbyShell(),
      );
    },
    LoginRoute.name: (routeData) {
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i7.LoginScreen(),
      );
    },
    LoginWithEmailNextRoute.name: (routeData) {
      final args = routeData.argsAs<LoginWithEmailNextRouteArgs>();
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i8.LoginWithEmailNextScreen(
          key: args.key,
          email: args.email,
        ),
      );
    },
    LoginWithEmailRoute.name: (routeData) {
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i9.LoginWithEmailScreen(),
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
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i10.LoginWithTokenScreen(
          key: args.key,
          token: args.token,
        ),
      );
    },
    MainRouter.name: (routeData) {
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i11.MainRouter(),
      );
    },
    MeRoute.name: (routeData) {
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i12.MeScreen(),
      );
    },
    NotificationRoute.name: (routeData) {
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i13.NotificationScreen(),
      );
    },
    PlaceholderRoute.name: (routeData) {
      final args = routeData.argsAs<PlaceholderRouteArgs>();
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i14.PlaceholderScreen(
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
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i15.PostScreen(
          key: args.key,
          permalink: args.permalink,
        ),
      );
    },
    RootRouter.name: (routeData) {
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i18.WrappedRoute(child: const _i16.RootRouter()),
      );
    },
    SplashRoute.name: (routeData) {
      return _i18.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i17.SplashScreen(),
      );
    },
  };
}

/// generated route for
/// [_i1.ArchiveScreen]
class ArchiveRoute extends _i18.PageRouteInfo<void> {
  const ArchiveRoute({List<_i18.PageRouteInfo>? children})
      : super(
          ArchiveRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveRoute';

  static const _i18.PageInfo<void> page = _i18.PageInfo<void>(name);
}

/// generated route for
/// [_i2.AuthRouter]
class AuthRouter extends _i18.PageRouteInfo<void> {
  const AuthRouter({List<_i18.PageRouteInfo>? children})
      : super(
          AuthRouter.name,
          initialChildren: children,
        );

  static const String name = 'AuthRouter';

  static const _i18.PageInfo<void> page = _i18.PageInfo<void>(name);
}

/// generated route for
/// [_i3.EditorScreen]
class EditorRoute extends _i18.PageRouteInfo<EditorRouteArgs> {
  EditorRoute({
    _i19.Key? key,
    required String permalink,
    List<_i18.PageRouteInfo>? children,
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

  static const _i18.PageInfo<EditorRouteArgs> page =
      _i18.PageInfo<EditorRouteArgs>(name);
}

class EditorRouteArgs {
  const EditorRouteArgs({
    this.key,
    required this.permalink,
  });

  final _i19.Key? key;

  final String permalink;

  @override
  String toString() {
    return 'EditorRouteArgs{key: $key, permalink: $permalink}';
  }
}

/// generated route for
/// [_i4.FeedScreen]
class FeedRoute extends _i18.PageRouteInfo<void> {
  const FeedRoute({List<_i18.PageRouteInfo>? children})
      : super(
          FeedRoute.name,
          initialChildren: children,
        );

  static const String name = 'FeedRoute';

  static const _i18.PageInfo<void> page = _i18.PageInfo<void>(name);
}

/// generated route for
/// [_i5.HomeScreen]
class HomeRoute extends _i18.PageRouteInfo<void> {
  const HomeRoute({List<_i18.PageRouteInfo>? children})
      : super(
          HomeRoute.name,
          initialChildren: children,
        );

  static const String name = 'HomeRoute';

  static const _i18.PageInfo<void> page = _i18.PageInfo<void>(name);
}

/// generated route for
/// [_i6.LobbyShell]
class LobbyShell extends _i18.PageRouteInfo<void> {
  const LobbyShell({List<_i18.PageRouteInfo>? children})
      : super(
          LobbyShell.name,
          initialChildren: children,
        );

  static const String name = 'LobbyShell';

  static const _i18.PageInfo<void> page = _i18.PageInfo<void>(name);
}

/// generated route for
/// [_i7.LoginScreen]
class LoginRoute extends _i18.PageRouteInfo<void> {
  const LoginRoute({List<_i18.PageRouteInfo>? children})
      : super(
          LoginRoute.name,
          initialChildren: children,
        );

  static const String name = 'LoginRoute';

  static const _i18.PageInfo<void> page = _i18.PageInfo<void>(name);
}

/// generated route for
/// [_i8.LoginWithEmailNextScreen]
class LoginWithEmailNextRoute
    extends _i18.PageRouteInfo<LoginWithEmailNextRouteArgs> {
  LoginWithEmailNextRoute({
    _i19.Key? key,
    required String email,
    List<_i18.PageRouteInfo>? children,
  }) : super(
          LoginWithEmailNextRoute.name,
          args: LoginWithEmailNextRouteArgs(
            key: key,
            email: email,
          ),
          initialChildren: children,
        );

  static const String name = 'LoginWithEmailNextRoute';

  static const _i18.PageInfo<LoginWithEmailNextRouteArgs> page =
      _i18.PageInfo<LoginWithEmailNextRouteArgs>(name);
}

class LoginWithEmailNextRouteArgs {
  const LoginWithEmailNextRouteArgs({
    this.key,
    required this.email,
  });

  final _i19.Key? key;

  final String email;

  @override
  String toString() {
    return 'LoginWithEmailNextRouteArgs{key: $key, email: $email}';
  }
}

/// generated route for
/// [_i9.LoginWithEmailScreen]
class LoginWithEmailRoute extends _i18.PageRouteInfo<void> {
  const LoginWithEmailRoute({List<_i18.PageRouteInfo>? children})
      : super(
          LoginWithEmailRoute.name,
          initialChildren: children,
        );

  static const String name = 'LoginWithEmailRoute';

  static const _i18.PageInfo<void> page = _i18.PageInfo<void>(name);
}

/// generated route for
/// [_i10.LoginWithTokenScreen]
class LoginWithTokenRoute extends _i18.PageRouteInfo<LoginWithTokenRouteArgs> {
  LoginWithTokenRoute({
    _i19.Key? key,
    String token = '',
    List<_i18.PageRouteInfo>? children,
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

  static const _i18.PageInfo<LoginWithTokenRouteArgs> page =
      _i18.PageInfo<LoginWithTokenRouteArgs>(name);
}

class LoginWithTokenRouteArgs {
  const LoginWithTokenRouteArgs({
    this.key,
    this.token = '',
  });

  final _i19.Key? key;

  final String token;

  @override
  String toString() {
    return 'LoginWithTokenRouteArgs{key: $key, token: $token}';
  }
}

/// generated route for
/// [_i11.MainRouter]
class MainRouter extends _i18.PageRouteInfo<void> {
  const MainRouter({List<_i18.PageRouteInfo>? children})
      : super(
          MainRouter.name,
          initialChildren: children,
        );

  static const String name = 'MainRouter';

  static const _i18.PageInfo<void> page = _i18.PageInfo<void>(name);
}

/// generated route for
/// [_i12.MeScreen]
class MeRoute extends _i18.PageRouteInfo<void> {
  const MeRoute({List<_i18.PageRouteInfo>? children})
      : super(
          MeRoute.name,
          initialChildren: children,
        );

  static const String name = 'MeRoute';

  static const _i18.PageInfo<void> page = _i18.PageInfo<void>(name);
}

/// generated route for
/// [_i13.NotificationScreen]
class NotificationRoute extends _i18.PageRouteInfo<void> {
  const NotificationRoute({List<_i18.PageRouteInfo>? children})
      : super(
          NotificationRoute.name,
          initialChildren: children,
        );

  static const String name = 'NotificationRoute';

  static const _i18.PageInfo<void> page = _i18.PageInfo<void>(name);
}

/// generated route for
/// [_i14.PlaceholderScreen]
class PlaceholderRoute extends _i18.PageRouteInfo<PlaceholderRouteArgs> {
  PlaceholderRoute({
    _i19.Key? key,
    required String text,
    List<_i18.PageRouteInfo>? children,
  }) : super(
          PlaceholderRoute.name,
          args: PlaceholderRouteArgs(
            key: key,
            text: text,
          ),
          initialChildren: children,
        );

  static const String name = 'PlaceholderRoute';

  static const _i18.PageInfo<PlaceholderRouteArgs> page =
      _i18.PageInfo<PlaceholderRouteArgs>(name);
}

class PlaceholderRouteArgs {
  const PlaceholderRouteArgs({
    this.key,
    required this.text,
  });

  final _i19.Key? key;

  final String text;

  @override
  String toString() {
    return 'PlaceholderRouteArgs{key: $key, text: $text}';
  }
}

/// generated route for
/// [_i15.PostScreen]
class PostRoute extends _i18.PageRouteInfo<PostRouteArgs> {
  PostRoute({
    _i19.Key? key,
    required String permalink,
    List<_i18.PageRouteInfo>? children,
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

  static const _i18.PageInfo<PostRouteArgs> page =
      _i18.PageInfo<PostRouteArgs>(name);
}

class PostRouteArgs {
  const PostRouteArgs({
    this.key,
    required this.permalink,
  });

  final _i19.Key? key;

  final String permalink;

  @override
  String toString() {
    return 'PostRouteArgs{key: $key, permalink: $permalink}';
  }
}

/// generated route for
/// [_i16.RootRouter]
class RootRouter extends _i18.PageRouteInfo<void> {
  const RootRouter({List<_i18.PageRouteInfo>? children})
      : super(
          RootRouter.name,
          initialChildren: children,
        );

  static const String name = 'RootRouter';

  static const _i18.PageInfo<void> page = _i18.PageInfo<void>(name);
}

/// generated route for
/// [_i17.SplashScreen]
class SplashRoute extends _i18.PageRouteInfo<void> {
  const SplashRoute({List<_i18.PageRouteInfo>? children})
      : super(
          SplashRoute.name,
          initialChildren: children,
        );

  static const String name = 'SplashRoute';

  static const _i18.PageInfo<void> page = _i18.PageInfo<void>(name);
}
