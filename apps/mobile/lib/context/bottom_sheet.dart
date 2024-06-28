import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/themes/colors.dart';

extension BottomSheetX on BuildContext {
  Future<T> showBottomSheet<T>({
    required WidgetBuilder builder,
    String title = '',
  }) async {
    return await showModalBottomSheet(
      context: this,
      backgroundColor: BrandColors.gray_0,
      elevation: 0,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      clipBehavior: Clip.antiAlias,
      builder: (context) {
        final child = builder(context);

        return Wrap(
          children: [
            SafeArea(
              child: Column(
                children: [
                  DecoratedBox(
                    decoration: const BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: BrandColors.gray_50,
                        ),
                      ),
                    ),
                    child: Column(
                      children: [
                        Center(
                          child: Container(
                            width: 40,
                            height: 4,
                            margin: const EdgeInsets.only(top: 4),
                            decoration: BoxDecoration(
                              color: BrandColors.gray_150,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                        const Gap(11),
                        Text(
                          title,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: BrandColors.gray_900,
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const Gap(14),
                      ],
                    ),
                  ),
                  child,
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}
