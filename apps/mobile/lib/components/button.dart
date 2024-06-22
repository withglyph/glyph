import 'package:flutter/material.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/themes/colors.dart';

class Button extends StatelessWidget {
  const Button(
    this.title, {
    super.key,
    this.enabled = true,
    this.onPressed,
  });

  final String title;
  final bool enabled;
  final Function()? onPressed;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onPressed: enabled ? onPressed : null,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: enabled ? BrandColors.brand_400 : BrandColors.gray_150,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Center(
          child: Text(
            title,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              color: enabled ? BrandColors.gray_0 : BrandColors.gray_400,
            ),
          ),
        ),
      ),
    );
  }
}
