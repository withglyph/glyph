import 'package:flutter/material.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/themes/colors.dart';

enum ButtonTheme {
  Primary,
  Secondary,
  Accent,
}

Color _getButtonColor(ButtonTheme theme, bool enabled) {
  if (!enabled) {
    return BrandColors.gray_150;
  }

  switch (theme) {
    case ButtonTheme.Primary:
      return BrandColors.gray_900;
    case ButtonTheme.Secondary:
      return BrandColors.gray_50;
    case ButtonTheme.Accent:
      return BrandColors.brand_400;
  }
}

Color _getButtonTextColor(ButtonTheme theme, bool enabled) {
  if (!enabled) {
    return BrandColors.gray_400;
  }

  switch (theme) {
    case ButtonTheme.Primary:
      return BrandColors.gray_0;
    case ButtonTheme.Secondary:
      return BrandColors.gray_900;
    case ButtonTheme.Accent:
      return BrandColors.gray_0;
  }
}

class Button extends StatelessWidget {
  const Button(
    this.title, {
    super.key,
    this.enabled = true,
    this.theme = ButtonTheme.Primary,
    this.onPressed,
  });

  final String title;
  final bool enabled;
  final ButtonTheme theme;
  final Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onPressed: enabled ? onPressed : null,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: _getButtonColor(theme, enabled),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Center(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: _getButtonTextColor(theme, enabled),
            ),
          ),
        ),
      ),
    );
  }
}
