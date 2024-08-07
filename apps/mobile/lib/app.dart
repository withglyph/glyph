import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:datadog_flutter_plugin/datadog_flutter_plugin.dart';
import 'package:flutter/material.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/routers/app.dart';
import 'package:glyph/routers/observer.dart';
import 'package:glyph/screens/splash.dart';
import 'package:glyph/themes/colors.dart';
import 'package:glyph/widgets/error.dart';

class App extends StatefulWidget {
  const App({super.key});

  @override
  createState() => _AppState();
}

class _AppState extends State<App> {
  final _router = GetIt.I<AppRouter>();
  final _dd = GetIt.I<DatadogSdk>();

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
        navigatorObservers: () => [DatadogAutoRouteObserver(datadogSdk: _dd)],
      ),
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'SUIT',
        fontFamilyFallback: const ['Pretendard'],
        scaffoldBackgroundColor: Colors.white,
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

        return RumUserActionDetector(
          rum: _dd.rum,
          child: KeyboardDismiss(
            child: child!,
          ),
        );
      },
    );
  }
}
