import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:glyph/themes/colors.dart';

class SvgImage extends StatelessWidget {
  const SvgImage(
    this.assetName, {
    this.width,
    this.height,
    this.color,
    super.key,
  });

  final String assetName;
  final double? width;
  final double? height;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return SvgPicture.asset(
      'assets/$assetName.svg',
      width: width,
      height: height,
      colorFilter: color == null
          ? null
          : ColorFilter.mode(
              color ?? BrandColors.gray_900,
              BlendMode.srcIn,
            ),
    );
  }
}
