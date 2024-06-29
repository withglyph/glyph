import 'package:flutter/material.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/themes/colors.dart';

enum ButtonKind {
  primary,
  secondary,
  accent,
}

enum ButtonSize {
  medium,
  large,
  small,
}

class Button extends StatelessWidget {
  const Button(
    this.title, {
    super.key,
    this.enabled = true,
    this.kind = ButtonKind.primary,
    this.size = ButtonSize.medium,
    this.onPressed,
  });

  final String title;
  final bool enabled;
  final ButtonKind kind;
  final ButtonSize size;
  final Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onPressed: enabled ? onPressed : null,
      child: Container(
        padding: switch (size) {
          ButtonSize.large => const EdgeInsets.symmetric(vertical: 15),
          ButtonSize.medium => const EdgeInsets.symmetric(vertical: 10),
          ButtonSize.small => const EdgeInsets.symmetric(vertical: 7),
        },
        decoration: BoxDecoration(
          color: enabled
              ? switch (kind) {
                  ButtonKind.primary => BrandColors.gray_900,
                  ButtonKind.secondary => BrandColors.gray_50,
                  ButtonKind.accent => BrandColors.brand_400,
                }
              : BrandColors.gray_150,
          borderRadius: switch (size) {
            ButtonSize.large => BorderRadius.circular(6),
            ButtonSize.medium => BorderRadius.circular(4),
            ButtonSize.small => BorderRadius.circular(2),
          },
        ),
        child: Center(
          child: Text(
            title,
            style: TextStyle(
              fontSize: switch (size) {
                ButtonSize.large => 16,
                ButtonSize.medium => 14,
                ButtonSize.small => 12,
              },
              fontWeight: FontWeight.w700,
              color: enabled
                  ? switch (kind) {
                      ButtonKind.primary => BrandColors.gray_0,
                      ButtonKind.secondary => BrandColors.gray_900,
                      ButtonKind.accent => BrandColors.gray_0,
                    }
                  : BrandColors.gray_400,
            ),
          ),
        ),
      ),
    );
  }
}
