import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/themes/colors.dart';

extension FloatingBottomSheetX on BuildContext {
  Future<void> showFloatingBottomSheet<T>({
    required WidgetBuilder builder,
    required String title,
  }) async {
    return showModalBottomSheet(
      context: this,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withOpacity(0.2),
      elevation: 0,
      isScrollControlled: true,
      useSafeArea: true,
      shape: LinearBorder.none,
      constraints: const BoxConstraints(maxHeight: 500),
      builder: (context) {
        final child = builder(context);

        return SafeArea(
          child: Container(
            margin: const EdgeInsets.fromLTRB(10, 0, 10, 0),
            padding: const EdgeInsets.fromLTRB(24, 8, 24, 20),
            clipBehavior: Clip.antiAlias,
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
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: BrandColors.gray_150,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const Gap(24),
                Text(
                  title,
                  textAlign: TextAlign.left,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const Gap(10),
                Flexible(
                  child: child,
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
