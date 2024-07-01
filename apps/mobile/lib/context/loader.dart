import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/themes/colors.dart';

BuildContext? _loaderContext;

class LoaderController {
  LoaderController(this.context);

  final BuildContext context;

  void show() {
    unawaited(
      showDialog(
        context: context,
        barrierDismissible: false,
        barrierColor: Colors.black.withOpacity(0.45),
        builder: (context) {
          _loaderContext = context;

          return const PopScope(
            canPop: false,
            child: Center(
              child: CircularProgressIndicator(
                color: BrandColors.brand_600,
              ),
            ),
          );
        },
      ),
    );
  }

  void dismiss() {
    _loaderContext?.router.popForced();
  }

  Future<T> run<T>(Future<T> Function() fn) async {
    show();
    try {
      return await fn();
    } finally {
      dismiss();
    }
  }
}

extension LoaderX on BuildContext {
  LoaderController get loader => LoaderController(this);
}
