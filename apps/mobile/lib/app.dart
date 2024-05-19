import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/providers/router.dart';
import 'package:glyph/themes/colors.dart';

class App extends ConsumerWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      routerConfig: router,
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
