import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/themes/colors.dart';

class LoaderController {
  const LoaderController(this.context);

  final BuildContext context;

  void show() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return const Center(
          child: CircularProgressIndicator(
            color: BrandColors.brand_600,
          ),
        );
      },
    );
  }

  void dismiss() {
    context.router.maybePop();
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
