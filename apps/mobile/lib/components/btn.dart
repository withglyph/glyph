import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/themes/colors.dart';

enum BtnTheme {
  primary,
  secondary,
  accent,
  secondaryOutline,
  danger,
}

enum BtnSize {
  medium,
  large,
  small,
}

Color _textColor(bool enabled, BtnTheme theme) {
  return enabled
      ? switch (theme) {
          BtnTheme.primary => BrandColors.gray_0,
          BtnTheme.secondary => BrandColors.gray_600,
          BtnTheme.accent => BrandColors.gray_0,
          BtnTheme.secondaryOutline => BrandColors.gray_600,
          BtnTheme.danger => BrandColors.red_600,
        }
      : BrandColors.gray_400;
}

class Btn extends StatelessWidget {
  const Btn(
    this.title, {
    super.key,
    this.enabled = true,
    this.theme = BtnTheme.primary,
    this.size = BtnSize.medium,
    this.iconLeft,
    this.iconRight,
    this.onPressed,
  });

  final String title;
  final bool enabled;
  final BtnTheme theme;
  final BtnSize size;
  final IconData? iconLeft;
  final IconData? iconRight;
  final Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      label: title,
      onPressed: enabled ? onPressed : null,
      child: Container(
        padding: switch (size) {
          BtnSize.large => const Pad(vertical: 15),
          BtnSize.medium => const Pad(vertical: 11),
          BtnSize.small => const Pad(vertical: 7),
        },
        decoration: BoxDecoration(
          color: enabled
              ? switch (theme) {
                  BtnTheme.primary => BrandColors.gray_900,
                  BtnTheme.secondary => BrandColors.gray_50,
                  BtnTheme.accent => BrandColors.brand_400,
                  BtnTheme.secondaryOutline => BrandColors.gray_0,
                  BtnTheme.danger => BrandColors.gray_0,
                }
              : BrandColors.gray_150,
          borderRadius: switch (size) {
            BtnSize.large => BorderRadius.circular(6),
            BtnSize.medium => BorderRadius.circular(4),
            BtnSize.small => BorderRadius.circular(2),
          },
          border: enabled
              ? switch (theme) {
                  BtnTheme.secondaryOutline || BtnTheme.danger => Border.all(color: BrandColors.gray_150),
                  _ => null,
                }
              : null,
        ),
        child: Center(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (iconLeft != null) ...[
                Icon(
                  iconLeft,
                  size: switch (size) {
                    BtnSize.large => 20,
                    BtnSize.medium => 18,
                    BtnSize.small => 14,
                  },
                  color: _textColor(enabled, theme),
                ),
                const Gap(3),
              ],
              Text(
                title,
                style: TextStyle(
                  fontSize: switch (size) {
                    BtnSize.large => 16,
                    BtnSize.medium => 14,
                    BtnSize.small => 12,
                  },
                  fontWeight: FontWeight.w700,
                  color: _textColor(enabled, theme),
                ),
              ),
              if (iconRight != null) ...[
                const Gap(3),
                Icon(
                  iconRight,
                  size: switch (size) {
                    BtnSize.large => 20,
                    BtnSize.medium => 18,
                    BtnSize.small => 14,
                  },
                  color: _textColor(enabled, theme),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
