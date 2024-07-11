import 'package:flutter/material.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/themes/colors.dart';

extension BottomSheetX on BuildContext {
  Future<T> showDraggableScrollableSheet<T>({
    required Widget Function(BuildContext, ScrollController, double paddingTop) builder,
    String? title,
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
        return SafeArea(
          child: DraggableScrollableSheet(
            expand: false,
            minChildSize: 0.43,
            initialChildSize: 0.43,
            snap: true,
            snapAnimationDuration: const Duration(milliseconds: 100),
            snapSizes: const [0.43, 1],
            builder: (context, controller) {
              final titleHeight = title == null ? 20.0 : 56.0;
              final child = builder(context, controller, titleHeight);

              return Stack(
                children: [
                  Expanded(
                    child: child,
                  ),
                  IgnorePointer(
                    child: Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      child: Container(
                        height: titleHeight,
                        decoration: const BoxDecoration(
                          color: Colors.white,
                        ),
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
                    ),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }
}
