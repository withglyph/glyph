import 'package:flutter/material.dart';
import 'package:glyph/themes/colors.dart';

extension BottomSheetX on BuildContext {
  Future<T> showBottomSheet<T>({
    bool expand = false,
    required WidgetBuilder builder,
  }) async {
    return await showModalBottomSheet(
      context: this,
      backgroundColor: BrandColors.gray_0,
      elevation: 0,
      isScrollControlled: expand,
      useSafeArea: true,
      builder: (context) {
        final child = builder(context);

        return ClipRRect(
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
          ),
          child: expand
              ? Scaffold(body: SafeArea(child: child))
              : SizedBox(width: double.infinity, child: SafeArea(child: child)),
        );
      },
    );
  }
}
