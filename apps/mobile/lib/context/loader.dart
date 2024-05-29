import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/themes/colors.dart';

class LoaderController {
  LoaderController(this.context);

  final BuildContext context;
  BuildContext? _loaderContext;

  void show() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        _loaderContext = context;

        return const Center(
          child: CircularProgressIndicator(
            color: BrandColors.brand_600,
          ),
        );
      },
    );
  }

  void dismiss() {
    _loaderContext?.router.maybePop();
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
