import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
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

        return SafeArea(
          child: child,
        );
      },
    );
  }

  Future<T> showFloatingBottomSheet<T>({
    required WidgetBuilder builder,
  }) async {
    return await showModalBottomSheet(
      context: this,
      backgroundColor: Colors.transparent,
      elevation: 0,
      isScrollControlled: true,
      useSafeArea: true,
      shape: LinearBorder.none,
      builder: (context) {
        final child = builder(context);

        return SafeArea(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 10),
            padding: const EdgeInsets.fromLTRB(24, 8, 24, 20),
            decoration: BoxDecoration(
              color: BrandColors.gray_0,
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: BrandColors.gray_900.withOpacity(0.2),
                  offset: const Offset(2, 3),
                  blurRadius: 20,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: BrandColors.gray_150,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const Gap(16),
                child,
              ],
            ),
          ),
        );
      },
    );
  }
}
