import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/material.dart' as material;
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/themes/colors.dart';

extension DialogX on BuildContext {
  Future<T?> showDialog<T>({
    required String title,
    required String content,
  }) async {
    return await material.showDialog(
      context: this,
      barrierDismissible: false,
      builder: (context) {
        return Dialog(
          backgroundColor: BrandColors.gray_0,
          elevation: 0,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(4)),
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 20,
              vertical: 16,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  title,
                  textAlign: TextAlign.left,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const Gap(8),
                Text(
                  content,
                  textAlign: TextAlign.left,
                  style: const TextStyle(
                    fontSize: 14,
                    color: BrandColors.gray_600,
                  ),
                ),
                const Gap(16),
                Align(
                  alignment: Alignment.centerRight,
                  child: Pressable(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: BrandColors.brand_400,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        '확인',
                        style: TextStyle(
                          color: BrandColors.gray_0,
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    onPressed: () {
                      context.router.maybePop();
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
