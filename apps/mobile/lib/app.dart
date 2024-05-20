import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/routers/app.dart';
import 'package:glyph/routers/observer.dart';
import 'package:glyph/themes/colors.dart';

class App extends ConsumerWidget {
  App({super.key});

  final _router = AppRouter();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return MaterialApp.router(
      routerConfig: _router.config(
        navigatorObservers: () => [AppRouterObserver()],
      ),
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'SUIT',
        scaffoldBackgroundColor: Colors.white,
        textTheme: const TextTheme(
          bodySmall: TextStyle(color: BrandColors.gray_900),
          bodyMedium: TextStyle(color: BrandColors.gray_900),
          bodyLarge: TextStyle(color: BrandColors.gray_900),
          displaySmall: TextStyle(color: BrandColors.gray_900),
          displayMedium: TextStyle(color: BrandColors.gray_900),
          displayLarge: TextStyle(color: BrandColors.gray_900),
          headlineSmall: TextStyle(color: BrandColors.gray_900),
          headlineMedium: TextStyle(color: BrandColors.gray_900),
          headlineLarge: TextStyle(color: BrandColors.gray_900),
          labelSmall: TextStyle(color: BrandColors.gray_900),
          labelMedium: TextStyle(color: BrandColors.gray_900),
          labelLarge: TextStyle(color: BrandColors.gray_900),
          titleSmall: TextStyle(color: BrandColors.gray_900),
          titleMedium: TextStyle(color: BrandColors.gray_900),
          titleLarge: TextStyle(color: BrandColors.gray_900),
        ),
      ),
    );
  }
}
