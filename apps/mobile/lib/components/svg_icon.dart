import 'package:flutter/material.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/themes/colors.dart';

class SvgIcon extends StatelessWidget {
  const SvgIcon(
    this.iconName, {
    super.key,
    this.size = 24,
    this.color = BrandColors.gray_900,
  });

  final String iconName;
  final double size;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return SvgImage(
      'icons/$iconName',
      width: size,
      height: size,
      color: color,
    );
  }
}
