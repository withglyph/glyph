import 'package:flutter/material.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/themes/colors.dart';

enum ButtonKind {
  primary,
  secondary,
  accent,
}

Color _getButtonColor(ButtonKind theme, bool enabled) {
  if (!enabled) {
    return BrandColors.gray_150;
  }

  switch (theme) {
    case ButtonKind.primary:
      return BrandColors.gray_900;
    case ButtonKind.secondary:
      return BrandColors.gray_50;
    case ButtonKind.accent:
      return BrandColors.brand_400;
  }
}

Color _getButtonTextColor(ButtonKind theme, bool enabled) {
  if (!enabled) {
    return BrandColors.gray_400;
  }

  switch (theme) {
    case ButtonKind.primary:
      return BrandColors.gray_0;
    case ButtonKind.secondary:
      return BrandColors.gray_900;
    case ButtonKind.accent:
      return BrandColors.gray_0;
  }
}

class Button extends StatelessWidget {
  const Button(
    this.title, {
    super.key,
    this.enabled = true,
    this.kind = ButtonKind.primary,
    this.onPressed,
  });

  final String title;
  final bool enabled;
  final ButtonKind kind;
  final Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onPressed: enabled ? onPressed : null,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: _getButtonColor(kind, enabled),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Center(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: _getButtonTextColor(kind, enabled),
            ),
          ),
        ),
      ),
    );
  }
}
