// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:auto_route/auto_route.dart' as _i13;
import 'package:flutter/material.dart' as _i14;
import 'package:glyph/routers/auth.dart' as _i2;
import 'package:glyph/routers/main.dart' as _i7;
import 'package:glyph/routers/root.dart' as _i10;
import 'package:glyph/screens/archive.dart' as _i1;
import 'package:glyph/screens/editor.dart' as _i3;
import 'package:glyph/screens/feed.dart' as _i4;
import 'package:glyph/screens/home.dart' as _i5;
import 'package:glyph/screens/login.dart' as _i6;
import 'package:glyph/screens/me.dart' as _i8;
import 'package:glyph/screens/placeholder.dart' as _i9;
import 'package:glyph/screens/splash.dart' as _i12;
import 'package:glyph/shells/root.dart' as _i11;

abstract class $AppRouter extends _i13.RootStackRouter {
  $AppRouter({super.navigatorKey});

  @override
  final Map<String, _i13.PageFactory> pagesMap = {
    ArchiveRoute.name: (routeData) {
      return _i13.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i1.ArchiveScreen(),
      );
    },
    AuthRouter.name: (routeData) {
      return _i13.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i2.AuthRouter(),
      );
    },
    EditorRoute.name: (routeData) {
      return _i13.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i3.EditorScreen(),
      );
    },
    FeedRoute.name: (routeData) {
      return _i13.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i4.FeedScreen(),
      );
    },
    HomeRoute.name: (routeData) {
      return _i13.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i5.HomeScreen(),
      );
    },
    LoginRoute.name: (routeData) {
      return _i13.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i6.LoginScreen(),
      );
    },
    MainRouter.name: (routeData) {
      return _i13.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i7.MainRouter(),
      );
    },
    MeRoute.name: (routeData) {
      final args =
          routeData.argsAs<MeRouteArgs>(orElse: () => const MeRouteArgs());
      return _i13.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i8.MeScreen(key: args.key),
      );
    },
    PlaceholderRoute.name: (routeData) {
      final args = routeData.argsAs<PlaceholderRouteArgs>();
      return _i13.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i9.PlaceholderScreen(
          key: args.key,
          text: args.text,
        ),
      );
    },
    RootRouter.name: (routeData) {
      return _i13.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i10.RootRouter(),
      );
    },
    RootShellRoute.name: (routeData) {
      return _i13.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i11.RootShellScreen(),
      );
    },
    SplashRoute.name: (routeData) {
      return _i13.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i12.SplashScreen(),
      );
    },
  };
}

/// generated route for
/// [_i1.ArchiveScreen]
class ArchiveRoute extends _i13.PageRouteInfo<void> {
  const ArchiveRoute({List<_i13.PageRouteInfo>? children})
      : super(
          ArchiveRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveRoute';

  static const _i13.PageInfo<void> page = _i13.PageInfo<void>(name);
}

/// generated route for
/// [_i2.AuthRouter]
class AuthRouter extends _i13.PageRouteInfo<void> {
  const AuthRouter({List<_i13.PageRouteInfo>? children})
      : super(
          AuthRouter.name,
          initialChildren: children,
        );

  static const String name = 'AuthRouter';

  static const _i13.PageInfo<void> page = _i13.PageInfo<void>(name);
}

/// generated route for
/// [_i3.EditorScreen]
class EditorRoute extends _i13.PageRouteInfo<void> {
  const EditorRoute({List<_i13.PageRouteInfo>? children})
      : super(
          EditorRoute.name,
          initialChildren: children,
        );

  static const String name = 'EditorRoute';

  static const _i13.PageInfo<void> page = _i13.PageInfo<void>(name);
}

/// generated route for
/// [_i4.FeedScreen]
class FeedRoute extends _i13.PageRouteInfo<void> {
  const FeedRoute({List<_i13.PageRouteInfo>? children})
      : super(
          FeedRoute.name,
          initialChildren: children,
        );

  static const String name = 'FeedRoute';

  static const _i13.PageInfo<void> page = _i13.PageInfo<void>(name);
}

/// generated route for
/// [_i5.HomeScreen]
class HomeRoute extends _i13.PageRouteInfo<void> {
  const HomeRoute({List<_i13.PageRouteInfo>? children})
      : super(
          HomeRoute.name,
          initialChildren: children,
        );

  static const String name = 'HomeRoute';

  static const _i13.PageInfo<void> page = _i13.PageInfo<void>(name);
}

/// generated route for
/// [_i6.LoginScreen]
class LoginRoute extends _i13.PageRouteInfo<void> {
  const LoginRoute({List<_i13.PageRouteInfo>? children})
      : super(
          LoginRoute.name,
          initialChildren: children,
        );

  static const String name = 'LoginRoute';

  static const _i13.PageInfo<void> page = _i13.PageInfo<void>(name);
}

/// generated route for
/// [_i7.MainRouter]
class MainRouter extends _i13.PageRouteInfo<void> {
  const MainRouter({List<_i13.PageRouteInfo>? children})
      : super(
          MainRouter.name,
          initialChildren: children,
        );

  static const String name = 'MainRouter';

  static const _i13.PageInfo<void> page = _i13.PageInfo<void>(name);
}

/// generated route for
/// [_i8.MeScreen]
class MeRoute extends _i13.PageRouteInfo<MeRouteArgs> {
  MeRoute({
    _i14.Key? key,
    List<_i13.PageRouteInfo>? children,
  }) : super(
          MeRoute.name,
          args: MeRouteArgs(key: key),
          initialChildren: children,
        );

  static const String name = 'MeRoute';

  static const _i13.PageInfo<MeRouteArgs> page =
      _i13.PageInfo<MeRouteArgs>(name);
}

class MeRouteArgs {
  const MeRouteArgs({this.key});

  final _i14.Key? key;

  @override
  String toString() {
    return 'MeRouteArgs{key: $key}';
  }
}

/// generated route for
/// [_i9.PlaceholderScreen]
class PlaceholderRoute extends _i13.PageRouteInfo<PlaceholderRouteArgs> {
  PlaceholderRoute({
    _i14.Key? key,
    required String text,
    List<_i13.PageRouteInfo>? children,
  }) : super(
          PlaceholderRoute.name,
          args: PlaceholderRouteArgs(
            key: key,
            text: text,
          ),
          initialChildren: children,
        );

  static const String name = 'PlaceholderRoute';

  static const _i13.PageInfo<PlaceholderRouteArgs> page =
      _i13.PageInfo<PlaceholderRouteArgs>(name);
}

class PlaceholderRouteArgs {
  const PlaceholderRouteArgs({
    this.key,
    required this.text,
  });

  final _i14.Key? key;

  final String text;

  @override
  String toString() {
    return 'PlaceholderRouteArgs{key: $key, text: $text}';
  }
}

/// generated route for
/// [_i10.RootRouter]
class RootRouter extends _i13.PageRouteInfo<void> {
  const RootRouter({List<_i13.PageRouteInfo>? children})
      : super(
          RootRouter.name,
          initialChildren: children,
        );

  static const String name = 'RootRouter';

  static const _i13.PageInfo<void> page = _i13.PageInfo<void>(name);
}

/// generated route for
/// [_i11.RootShellScreen]
class RootShellRoute extends _i13.PageRouteInfo<void> {
  const RootShellRoute({List<_i13.PageRouteInfo>? children})
      : super(
          RootShellRoute.name,
          initialChildren: children,
        );

  static const String name = 'RootShellRoute';

  static const _i13.PageInfo<void> page = _i13.PageInfo<void>(name);
}

/// generated route for
/// [_i12.SplashScreen]
class SplashRoute extends _i13.PageRouteInfo<void> {
  const SplashRoute({List<_i13.PageRouteInfo>? children})
      : super(
          SplashRoute.name,
          initialChildren: children,
        );

  static const String name = 'SplashRoute';

  static const _i13.PageInfo<void> page = _i13.PageInfo<void>(name);
}
