import 'package:flutter/material.dart';
import 'package:glyph/themes/colors.dart';

class Dot extends StatelessWidget {
  const Dot({
    super.key,
    this.size = 2,
    this.color = BrandColors.gray_400,
  });

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
      ),
    );
  }
}
