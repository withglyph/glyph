import 'package:flutter/material.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/themes/colors.dart';

class SvgIcon extends StatelessWidget {
  const SvgIcon(
    this.iconName, {
    this.size,
    this.color,
    super.key,
  });

  final String iconName;
  final double? size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return SvgImage(
      'icons/$iconName',
      width: size ?? 24,
      height: size ?? 24,
      color: color ?? BrandColors.gray_900,
    );
  }
}