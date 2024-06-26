import 'package:flutter/material.dart';
import 'package:glyph/routers/app.dart';
import 'package:glyph/screens/splash.dart';
import 'package:glyph/themes/colors.dart';
import 'package:glyph/widgets/errror.dart';

class App extends StatefulWidget {
  const App({super.key});

  @override
  createState() => _AppState();
}

class _AppState extends State<App> {
  final _router = AppRouter();

  @override
  Widget build(BuildContext context) {
    const defaultTextStyle = TextStyle(
      color: BrandColors.gray_900,
      height: 1.44,
      letterSpacing: -0.04,
    );

    return MaterialApp.router(
      routerConfig: _router.config(
        placeholder: (context) => const SplashScreen(),
      ),
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'SUIT',
        scaffoldBackgroundColor: Colors.white,
        appBarTheme: const AppBarTheme(
          backgroundColor: BrandColors.gray_0,
          scrolledUnderElevation: 0,
          toolbarHeight: 54,
        ),
        dividerTheme: const DividerThemeData(
          color: BrandColors.gray_100,
          space: 0,
        ),
        iconTheme: const IconThemeData(
          color: BrandColors.gray_900,
          size: 24,
        ),
        textTheme: const TextTheme(
          bodySmall: defaultTextStyle,
          bodyMedium: defaultTextStyle,
          bodyLarge: defaultTextStyle,
          displaySmall: defaultTextStyle,
          displayMedium: defaultTextStyle,
          displayLarge: defaultTextStyle,
          headlineSmall: defaultTextStyle,
          headlineMedium: defaultTextStyle,
          headlineLarge: defaultTextStyle,
          labelSmall: defaultTextStyle,
          labelMedium: defaultTextStyle,
          labelLarge: defaultTextStyle,
          titleSmall: defaultTextStyle,
          titleMedium: defaultTextStyle,
          titleLarge: defaultTextStyle,
        ),
      ),
      builder: (context, child) {
        ErrorWidget.builder = (details) {
          return const AppErrorWidget();
        };

        return child!;
      },
    );
  }
}
