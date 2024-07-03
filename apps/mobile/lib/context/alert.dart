import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/material.dart' as material;
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/themes/colors.dart';

extension AlertX on BuildContext {
  Future<T?> showAlert<T>({
    required String title,
    String? content,
    String confirmText = '확인',
    Function()? onConfirmed,
  }) {
    return material.showDialog(
      context: this,
      barrierDismissible: false,
      builder: (context) {
        return Dialog(
          backgroundColor: BrandColors.gray_0,
          elevation: 0,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(8)),
          ),
          child: Padding(
            padding: const Pad(all: 22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  title,
                  textAlign: TextAlign.left,
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w700,
                    color: BrandColors.gray_900,
                  ),
                ),
                const Gap(8),
                if (content != null)
                Flexible(
                  child: Text(
                    content,
                    textAlign: TextAlign.left,
                    style: const TextStyle(
                      fontSize: 14,
                      color: BrandColors.gray_600,
                    ),
                  ),
                ),
                const Gap(24),
                Align(
                  alignment: Alignment.centerRight,
                  child: Pressable(
                    child: Container(
                      padding: const Pad(horizontal: 16, vertical: 8),
                      child: const Text(
                        '확인',
                        style: TextStyle(
                          color: BrandColors.brand_400,
                          fontSize: 18,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    onPressed: () {
                      context.router.maybePop();
                      onConfirmed?.call();
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
