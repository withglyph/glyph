import 'package:flutter/material.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/themes/colors.dart';

extension BottomSheetX on BuildContext {
  Future<T> showBottomSheet<T>({
    required WidgetBuilder builder,
    String? title,
  }) async {
    return await showModalBottomSheet(
      context: this,
      backgroundColor: BrandColors.gray_0,
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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: double.infinity,
                height: title == null ? 20 : 56,
                child: Stack(
                  children: [
                    if (title != null) ...[
                      Center(
                        child: Text(
                          title,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const Positioned(
                        left: 0,
                        right: 0,
                        bottom: 0,
                        child: HorizontalDivider(color: BrandColors.gray_50),
                      ),
                    ],
                    Positioned(
                      left: 0,
                      right: 0,
                      top: 4,
                      child: Center(
                        child: Container(
                          width: 40,
                          height: 4,
                          decoration: BoxDecoration(
                            color: BrandColors.gray_150,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              child,
            ],
          ),
        );
      },
    );
  }
}
