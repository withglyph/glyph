import 'package:flutter/material.dart';
import 'package:glyph/router.dart';

import 'themes/colors.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: AppRouter.router,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: BrandColors.gray,
        fontFamily: 'SUIT',
      ),
    );
  }
}
