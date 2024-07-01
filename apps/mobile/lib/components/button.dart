import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/themes/colors.dart';

enum ButtonKind {
  primary,
  secondary,
  accent,
  secondaryOutline,
  danger,
}

enum ButtonSize {
  medium,
  large,
  small,
}

Color _textColor(bool enabled, ButtonKind kind) {
  return enabled
      ? switch (kind) {
          ButtonKind.primary => BrandColors.gray_0,
          ButtonKind.secondary => BrandColors.gray_600,
          ButtonKind.accent => BrandColors.gray_0,
          ButtonKind.secondaryOutline => BrandColors.gray_600,
          ButtonKind.danger => BrandColors.red_600,
        }
      : BrandColors.gray_400;
}

class Button extends StatelessWidget {
  const Button(
    this.title, {
    super.key,
    this.enabled = true,
    this.kind = ButtonKind.primary,
    this.size = ButtonSize.medium,
    this.iconLeft,
    this.iconRight,
    this.onPressed,
  });

  final String title;
  final bool enabled;
  final ButtonKind kind;
  final ButtonSize size;
  final IconData? iconLeft;
  final IconData? iconRight;
  final Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onPressed: enabled ? onPressed : null,
      child: Container(
        padding: switch (size) {
          ButtonSize.large => const EdgeInsets.symmetric(vertical: 15),
          ButtonSize.medium => const EdgeInsets.symmetric(vertical: 11),
          ButtonSize.small => const EdgeInsets.symmetric(vertical: 7),
        },
        decoration: BoxDecoration(
          color: enabled
              ? switch (kind) {
                  ButtonKind.primary => BrandColors.gray_900,
                  ButtonKind.secondary => BrandColors.gray_50,
                  ButtonKind.accent => BrandColors.brand_400,
                  ButtonKind.secondaryOutline => BrandColors.gray_0,
                  ButtonKind.danger => BrandColors.gray_0,
                }
              : BrandColors.gray_150,
          borderRadius: switch (size) {
            ButtonSize.large => BorderRadius.circular(6),
            ButtonSize.medium => BorderRadius.circular(4),
            ButtonSize.small => BorderRadius.circular(2),
          },
          border: enabled
              ? switch (kind) {
                  ButtonKind.secondaryOutline || ButtonKind.danger => Border.all(color: BrandColors.gray_150),
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
                    ButtonSize.large => 20,
                    ButtonSize.medium => 18,
                    ButtonSize.small => 14,
                  },
                  color: _textColor(enabled, kind),
                ),
                const Gap(3),
              ],
              Text(
                title,
                style: TextStyle(
                  fontSize: switch (size) {
                    ButtonSize.large => 16,
                    ButtonSize.medium => 14,
                    ButtonSize.small => 12,
                  },
                  fontWeight: FontWeight.w700,
                  color: _textColor(enabled, kind),
                ),
              ),
              if (iconRight != null) ...[
                const Gap(3),
                Icon(
                  iconRight,
                  size: switch (size) {
                    ButtonSize.large => 20,
                    ButtonSize.medium => 18,
                    ButtonSize.small => 14,
                  },
                  color: _textColor(enabled, kind),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
