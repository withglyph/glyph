import 'package:flutter/material.dart';
import 'package:glyph/screens/login.dart';
import 'package:glyph/signals.dart';
import 'package:go_router/go_router.dart';

import 'screens/home.dart';

class AppRouter {
  static final router = GoRouter(
    routes: [
      ShellRoute(
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => HomeScreen(),
          ),
          GoRoute(
              path: '/login',
              pageBuilder: (context, state) =>
                  NoTransitionPage(child: LoginScreen())),
        ],
        redirect: (context, state) {
          if (accessToken.value == null) {
            return '/login';
          } else {
            return null;
          }
        },
        builder: (context, state, child) {
          return Material(child: child);
        },
      )
    ],
  );
}
