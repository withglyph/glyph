// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:auto_route/auto_route.dart' as _i15;
import 'package:flutter/material.dart' as _i16;
import 'package:glyph/routers/auth.dart' as _i2;
import 'package:glyph/routers/main.dart' as _i8;
import 'package:glyph/routers/root.dart' as _i13;
import 'package:glyph/screens/archive.dart' as _i1;
import 'package:glyph/screens/editor.dart' as _i3;
import 'package:glyph/screens/feed.dart' as _i4;
import 'package:glyph/screens/home.dart' as _i5;
import 'package:glyph/screens/login.dart' as _i7;
import 'package:glyph/screens/me.dart' as _i9;
import 'package:glyph/screens/notification.dart' as _i10;
import 'package:glyph/screens/placeholder.dart' as _i11;
import 'package:glyph/screens/post.dart' as _i12;
import 'package:glyph/screens/splash.dart' as _i14;
import 'package:glyph/shells/lobby.dart' as _i6;

abstract class $AppRouter extends _i15.RootStackRouter {
  $AppRouter({super.navigatorKey});

  @override
  final Map<String, _i15.PageFactory> pagesMap = {
    ArchiveRoute.name: (routeData) {
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i1.ArchiveScreen(),
      );
    },
    AuthRouter.name: (routeData) {
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i2.AuthRouter(),
      );
    },
    EditorRoute.name: (routeData) {
      final pathParams = routeData.inheritedPathParams;
      final args = routeData.argsAs<EditorRouteArgs>(
          orElse: () =>
              EditorRouteArgs(permalink: pathParams.getString('permalink')));
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i3.EditorScreen(
          key: args.key,
          permalink: args.permalink,
        ),
      );
    },
    FeedRoute.name: (routeData) {
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i4.FeedScreen(),
      );
    },
    HomeRoute.name: (routeData) {
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i5.HomeScreen(),
      );
    },
    LobbyShell.name: (routeData) {
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i6.LobbyShell(),
      );
    },
    LoginRoute.name: (routeData) {
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i7.LoginScreen(),
      );
    },
    MainRouter.name: (routeData) {
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i8.MainRouter(),
      );
    },
    MeRoute.name: (routeData) {
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i9.MeScreen(),
      );
    },
    NotificationRoute.name: (routeData) {
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i10.NotificationScreen(),
      );
    },
    PlaceholderRoute.name: (routeData) {
      final args = routeData.argsAs<PlaceholderRouteArgs>();
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i11.PlaceholderScreen(
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
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i12.PostScreen(
          key: args.key,
          permalink: args.permalink,
        ),
      );
    },
    RootRouter.name: (routeData) {
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i15.WrappedRoute(child: const _i13.RootRouter()),
      );
    },
    SplashRoute.name: (routeData) {
      return _i15.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i14.SplashScreen(),
      );
    },
  };
}

/// generated route for
/// [_i1.ArchiveScreen]
class ArchiveRoute extends _i15.PageRouteInfo<void> {
  const ArchiveRoute({List<_i15.PageRouteInfo>? children})
      : super(
          ArchiveRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveRoute';

  static const _i15.PageInfo<void> page = _i15.PageInfo<void>(name);
}

/// generated route for
/// [_i2.AuthRouter]
class AuthRouter extends _i15.PageRouteInfo<void> {
  const AuthRouter({List<_i15.PageRouteInfo>? children})
      : super(
          AuthRouter.name,
          initialChildren: children,
        );

  static const String name = 'AuthRouter';

  static const _i15.PageInfo<void> page = _i15.PageInfo<void>(name);
}

/// generated route for
/// [_i3.EditorScreen]
class EditorRoute extends _i15.PageRouteInfo<EditorRouteArgs> {
  EditorRoute({
    _i16.Key? key,
    required String permalink,
    List<_i15.PageRouteInfo>? children,
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

  static const _i15.PageInfo<EditorRouteArgs> page =
      _i15.PageInfo<EditorRouteArgs>(name);
}

class EditorRouteArgs {
  const EditorRouteArgs({
    this.key,
    required this.permalink,
  });

  final _i16.Key? key;

  final String permalink;

  @override
  String toString() {
    return 'EditorRouteArgs{key: $key, permalink: $permalink}';
  }
}

/// generated route for
/// [_i4.FeedScreen]
class FeedRoute extends _i15.PageRouteInfo<void> {
  const FeedRoute({List<_i15.PageRouteInfo>? children})
      : super(
          FeedRoute.name,
          initialChildren: children,
        );

  static const String name = 'FeedRoute';

  static const _i15.PageInfo<void> page = _i15.PageInfo<void>(name);
}

/// generated route for
/// [_i5.HomeScreen]
class HomeRoute extends _i15.PageRouteInfo<void> {
  const HomeRoute({List<_i15.PageRouteInfo>? children})
      : super(
          HomeRoute.name,
          initialChildren: children,
        );

  static const String name = 'HomeRoute';

  static const _i15.PageInfo<void> page = _i15.PageInfo<void>(name);
}

/// generated route for
/// [_i6.LobbyShell]
class LobbyShell extends _i15.PageRouteInfo<void> {
  const LobbyShell({List<_i15.PageRouteInfo>? children})
      : super(
          LobbyShell.name,
          initialChildren: children,
        );

  static const String name = 'LobbyShell';

  static const _i15.PageInfo<void> page = _i15.PageInfo<void>(name);
}

/// generated route for
/// [_i7.LoginScreen]
class LoginRoute extends _i15.PageRouteInfo<void> {
  const LoginRoute({List<_i15.PageRouteInfo>? children})
      : super(
          LoginRoute.name,
          initialChildren: children,
        );

  static const String name = 'LoginRoute';

  static const _i15.PageInfo<void> page = _i15.PageInfo<void>(name);
}

/// generated route for
/// [_i8.MainRouter]
class MainRouter extends _i15.PageRouteInfo<void> {
  const MainRouter({List<_i15.PageRouteInfo>? children})
      : super(
          MainRouter.name,
          initialChildren: children,
        );

  static const String name = 'MainRouter';

  static const _i15.PageInfo<void> page = _i15.PageInfo<void>(name);
}

/// generated route for
/// [_i9.MeScreen]
class MeRoute extends _i15.PageRouteInfo<void> {
  const MeRoute({List<_i15.PageRouteInfo>? children})
      : super(
          MeRoute.name,
          initialChildren: children,
        );

  static const String name = 'MeRoute';

  static const _i15.PageInfo<void> page = _i15.PageInfo<void>(name);
}

/// generated route for
/// [_i10.NotificationScreen]
class NotificationRoute extends _i15.PageRouteInfo<void> {
  const NotificationRoute({List<_i15.PageRouteInfo>? children})
      : super(
          NotificationRoute.name,
          initialChildren: children,
        );

  static const String name = 'NotificationRoute';

  static const _i15.PageInfo<void> page = _i15.PageInfo<void>(name);
}

/// generated route for
/// [_i11.PlaceholderScreen]
class PlaceholderRoute extends _i15.PageRouteInfo<PlaceholderRouteArgs> {
  PlaceholderRoute({
    _i16.Key? key,
    required String text,
    List<_i15.PageRouteInfo>? children,
  }) : super(
          PlaceholderRoute.name,
          args: PlaceholderRouteArgs(
            key: key,
            text: text,
          ),
          initialChildren: children,
        );

  static const String name = 'PlaceholderRoute';

  static const _i15.PageInfo<PlaceholderRouteArgs> page =
      _i15.PageInfo<PlaceholderRouteArgs>(name);
}

class PlaceholderRouteArgs {
  const PlaceholderRouteArgs({
    this.key,
    required this.text,
  });

  final _i16.Key? key;

  final String text;

  @override
  String toString() {
    return 'PlaceholderRouteArgs{key: $key, text: $text}';
  }
}

/// generated route for
/// [_i12.PostScreen]
class PostRoute extends _i15.PageRouteInfo<PostRouteArgs> {
  PostRoute({
    _i16.Key? key,
    required String permalink,
    List<_i15.PageRouteInfo>? children,
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

  static const _i15.PageInfo<PostRouteArgs> page =
      _i15.PageInfo<PostRouteArgs>(name);
}

class PostRouteArgs {
  const PostRouteArgs({
    this.key,
    required this.permalink,
  });

  final _i16.Key? key;

  final String permalink;

  @override
  String toString() {
    return 'PostRouteArgs{key: $key, permalink: $permalink}';
  }
}

/// generated route for
/// [_i13.RootRouter]
class RootRouter extends _i15.PageRouteInfo<void> {
  const RootRouter({List<_i15.PageRouteInfo>? children})
      : super(
          RootRouter.name,
          initialChildren: children,
        );

  static const String name = 'RootRouter';

  static const _i15.PageInfo<void> page = _i15.PageInfo<void>(name);
}

/// generated route for
/// [_i14.SplashScreen]
class SplashRoute extends _i15.PageRouteInfo<void> {
  const SplashRoute({List<_i15.PageRouteInfo>? children})
      : super(
          SplashRoute.name,
          initialChildren: children,
        );

  static const String name = 'SplashRoute';

  static const _i15.PageInfo<void> page = _i15.PageInfo<void>(name);
}
