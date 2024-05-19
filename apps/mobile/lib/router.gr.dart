// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

// ignore_for_file: no_leading_underscores_for_library_prefixes
import 'package:auto_route/auto_route.dart' as _i9;
import 'package:flutter/material.dart' as _i10;
import 'package:glyph/screens/archive.dart' as _i1;
import 'package:glyph/screens/editor.dart' as _i2;
import 'package:glyph/screens/feed.dart' as _i3;
import 'package:glyph/screens/home.dart' as _i4;
import 'package:glyph/screens/login.dart' as _i5;
import 'package:glyph/screens/me.dart' as _i6;
import 'package:glyph/screens/placeholder.dart' as _i7;
import 'package:glyph/shells/root.dart' as _i8;

abstract class $AppRouter extends _i9.RootStackRouter {
  $AppRouter({super.navigatorKey});

  @override
  final Map<String, _i9.PageFactory> pagesMap = {
    ArchiveRoute.name: (routeData) {
      return _i9.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i1.ArchiveScreen(),
      );
    },
    EditorRoute.name: (routeData) {
      return _i9.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i2.EditorScreen(),
      );
    },
    FeedRoute.name: (routeData) {
      return _i9.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i3.FeedScreen(),
      );
    },
    HomeRoute.name: (routeData) {
      return _i9.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i4.HomeScreen(),
      );
    },
    LoginRoute.name: (routeData) {
      final args = routeData.argsAs<LoginRouteArgs>();
      return _i9.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i5.LoginScreen(
          key: args.key,
          onResult: args.onResult,
        ),
      );
    },
    MeRoute.name: (routeData) {
      final args =
          routeData.argsAs<MeRouteArgs>(orElse: () => const MeRouteArgs());
      return _i9.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i6.MeScreen(key: args.key),
      );
    },
    PlaceholderRoute.name: (routeData) {
      final args = routeData.argsAs<PlaceholderRouteArgs>();
      return _i9.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: _i7.PlaceholderScreen(
          key: args.key,
          text: args.text,
        ),
      );
    },
    RootShellRoute.name: (routeData) {
      return _i9.AutoRoutePage<dynamic>(
        routeData: routeData,
        child: const _i8.RootShellScreen(),
      );
    },
  };
}

/// generated route for
/// [_i1.ArchiveScreen]
class ArchiveRoute extends _i9.PageRouteInfo<void> {
  const ArchiveRoute({List<_i9.PageRouteInfo>? children})
      : super(
          ArchiveRoute.name,
          initialChildren: children,
        );

  static const String name = 'ArchiveRoute';

  static const _i9.PageInfo<void> page = _i9.PageInfo<void>(name);
}

/// generated route for
/// [_i2.EditorScreen]
class EditorRoute extends _i9.PageRouteInfo<void> {
  const EditorRoute({List<_i9.PageRouteInfo>? children})
      : super(
          EditorRoute.name,
          initialChildren: children,
        );

  static const String name = 'EditorRoute';

  static const _i9.PageInfo<void> page = _i9.PageInfo<void>(name);
}

/// generated route for
/// [_i3.FeedScreen]
class FeedRoute extends _i9.PageRouteInfo<void> {
  const FeedRoute({List<_i9.PageRouteInfo>? children})
      : super(
          FeedRoute.name,
          initialChildren: children,
        );

  static const String name = 'FeedRoute';

  static const _i9.PageInfo<void> page = _i9.PageInfo<void>(name);
}

/// generated route for
/// [_i4.HomeScreen]
class HomeRoute extends _i9.PageRouteInfo<void> {
  const HomeRoute({List<_i9.PageRouteInfo>? children})
      : super(
          HomeRoute.name,
          initialChildren: children,
        );

  static const String name = 'HomeRoute';

  static const _i9.PageInfo<void> page = _i9.PageInfo<void>(name);
}

/// generated route for
/// [_i5.LoginScreen]
class LoginRoute extends _i9.PageRouteInfo<LoginRouteArgs> {
  LoginRoute({
    _i10.Key? key,
    required dynamic Function(bool) onResult,
    List<_i9.PageRouteInfo>? children,
  }) : super(
          LoginRoute.name,
          args: LoginRouteArgs(
            key: key,
            onResult: onResult,
          ),
          initialChildren: children,
        );

  static const String name = 'LoginRoute';

  static const _i9.PageInfo<LoginRouteArgs> page =
      _i9.PageInfo<LoginRouteArgs>(name);
}

class LoginRouteArgs {
  const LoginRouteArgs({
    this.key,
    required this.onResult,
  });

  final _i10.Key? key;

  final dynamic Function(bool) onResult;

  @override
  String toString() {
    return 'LoginRouteArgs{key: $key, onResult: $onResult}';
  }
}

/// generated route for
/// [_i6.MeScreen]
class MeRoute extends _i9.PageRouteInfo<MeRouteArgs> {
  MeRoute({
    _i10.Key? key,
    List<_i9.PageRouteInfo>? children,
  }) : super(
          MeRoute.name,
          args: MeRouteArgs(key: key),
          initialChildren: children,
        );

  static const String name = 'MeRoute';

  static const _i9.PageInfo<MeRouteArgs> page = _i9.PageInfo<MeRouteArgs>(name);
}

class MeRouteArgs {
  const MeRouteArgs({this.key});

  final _i10.Key? key;

  @override
  String toString() {
    return 'MeRouteArgs{key: $key}';
  }
}

/// generated route for
/// [_i7.PlaceholderScreen]
class PlaceholderRoute extends _i9.PageRouteInfo<PlaceholderRouteArgs> {
  PlaceholderRoute({
    _i10.Key? key,
    required String text,
    List<_i9.PageRouteInfo>? children,
  }) : super(
          PlaceholderRoute.name,
          args: PlaceholderRouteArgs(
            key: key,
            text: text,
          ),
          initialChildren: children,
        );

  static const String name = 'PlaceholderRoute';

  static const _i9.PageInfo<PlaceholderRouteArgs> page =
      _i9.PageInfo<PlaceholderRouteArgs>(name);
}

class PlaceholderRouteArgs {
  const PlaceholderRouteArgs({
    this.key,
    required this.text,
  });

  final _i10.Key? key;

  final String text;

  @override
  String toString() {
    return 'PlaceholderRouteArgs{key: $key, text: $text}';
  }
}

/// generated route for
/// [_i8.RootShellScreen]
class RootShellRoute extends _i9.PageRouteInfo<void> {
  const RootShellRoute({List<_i9.PageRouteInfo>? children})
      : super(
          RootShellRoute.name,
          initialChildren: children,
        );

  static const String name = 'RootShellRoute';

  static const _i9.PageInfo<void> page = _i9.PageInfo<void>(name);
}
