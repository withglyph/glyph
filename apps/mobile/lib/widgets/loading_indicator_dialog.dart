import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/themes/colors.dart';

class LoadingIndicatorDialog {
  BuildContext? _context;

  show(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        _context = context;

        return const Center(
          child: CircularProgressIndicator(
            color: BrandColors.brand_600,
          ),
        );
      },
    );
  }

  dismiss() {
    if (_context != null) {
      _context!.router.maybePop();
      _context = null;
    }
  }

  Future<T> run<T>(BuildContext context, Future<T> Function() fn) async {
    show(context);
    final r = await fn();
    dismiss();
    return r;
  }
}