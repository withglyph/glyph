import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/material.dart' as material;
import 'package:gap/gap.dart';
import 'package:glyph/components/btn.dart';
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
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  title,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 19,
                    fontWeight: FontWeight.w700,
                    color: BrandColors.gray_900,
                  ),
                ),
                if (content != null) ...[
                  const Gap(3),
                  Flexible(
                    child: Text(
                      content,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 14,
                        color: BrandColors.gray_500,
                      ),
                    ),
                  ),
                ],
                const Gap(28),
                Btn(
                  '닫기',
                  theme: BtnTheme.secondary,
                  onPressed: () {
                    context.router.maybePop();
                    onConfirmed?.call();
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
