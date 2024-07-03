import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:flutter/material.dart';
import 'package:glyph/themes/colors.dart';

class HorizontalDivider extends StatelessWidget {
  const HorizontalDivider({
    super.key,
    this.height = 1.0,
    this.color = BrandColors.gray_100,
  });

  final double height;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Box(
      width: double.infinity,
      height: height,
      color: color,
    );
  }
}
