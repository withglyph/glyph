import 'package:flutter/material.dart';
import 'package:glyph/themes/colors.dart';

extension ModalX on BuildContext {
  Future<T> showModal<T>({
    required WidgetBuilder builder,
  }) async {
    return await showModalBottomSheet(
      context: this,
      backgroundColor: BrandColors.gray_0,
      barrierColor: Colors.black.withOpacity(0.2),
      elevation: 0,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(20),
        ),
      ),
      clipBehavior: Clip.antiAlias,
      builder: (context) {
        final child = builder(context);

        return SafeArea(
          child: child,
        );
      },
    );
  }
}
