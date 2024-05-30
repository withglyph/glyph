import 'package:flutter/material.dart';
import 'package:glyph/themes/colors.dart';

class VerticalDivider extends StatelessWidget {
  const VerticalDivider({
    super.key,
    this.width = 1.0,
    this.color = BrandColors.gray_100,
  });

  final double width;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      color: color,
    );
  }
}
