import 'package:flutter/material.dart';
import 'package:glyph/themes/colors.dart';

extension BottomSheetX on BuildContext {
  Future<T> showBottomSheet<T>({
    required WidgetBuilder builder,
  }) async {
    return await showModalBottomSheet(
      context: this,
      backgroundColor: BrandColors.gray_0,
      elevation: 0,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(8),
          topRight: Radius.circular(8),
        ),
      ),
      clipBehavior: Clip.antiAlias,
      builder: (context) {
        final child = builder(context);

        // return child: child);
        return SafeArea(
          maintainBottomViewPadding: true,
          child: child,
        );
      },
    );
  }
}
