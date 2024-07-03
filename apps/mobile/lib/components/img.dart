import 'dart:math';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/graphql/fragments/__generated__/img_image.data.gql.dart';
import 'package:glyph/themes/colors.dart';

class Img extends StatelessWidget {
  const Img(
    this.image, {
    super.key,
    this.width,
    this.height,
    this.aspectRatio,
    this.quality = 75,
    this.borderWidth = 0.0,
    this.borderColor = BrandColors.gray_50,
    this.borderRadius = 2,
    this.fit = BoxFit.cover,
  });

  final GImg_image? image;
  final double? width;
  final double? height;
  final double? aspectRatio;
  final double? quality;
  final Color borderColor;
  final double borderWidth;
  final double borderRadius;
  final BoxFit fit;

  @override
  Widget build(BuildContext context) {
    assert(
      width != null || height != null,
      'You must provide either a width or a height',
    );

    assert(
      (width != null && height != null) || aspectRatio != null,
      'You must provide either a width and a height or an aspect ratio',
    );

    final effectiveWidth = width ?? (height! * aspectRatio!);
    final effectiveHeight = height ?? (width! / aspectRatio!);

    final dpi = MediaQuery.of(context).devicePixelRatio;
    final size = max(effectiveWidth, effectiveHeight) * dpi;
    final effectiveSize = pow(2, (log(size) / log(2)).ceil()).toInt();

    if (image == null) {
      return Container(
        width: effectiveWidth,
        height: effectiveHeight,
        decoration: BoxDecoration(
          color: BrandColors.gray_50,
          border: borderWidth > 0 ? Border.all(color: borderColor, width: borderWidth) : null,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        child: const Center(
          child: FractionallySizedBox(
            widthFactor: 1 / 4,
            child: SvgImage(
              'logos/compact',
              color: BrandColors.gray_400,
            ),
          ),
        ),
      );
    } else {
      return Container(
        width: effectiveWidth,
        height: effectiveHeight,
        padding: Pad(all: borderWidth),
        decoration: BoxDecoration(
          color: borderColor,
          borderRadius: BorderRadius.circular(borderRadius),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(borderRadius),
          child: CachedNetworkImage(
            imageUrl: '${image!.url}?s=$effectiveSize&q=$quality',
            width: effectiveWidth,
            height: effectiveHeight,
            fit: fit,
            fadeInDuration: const Duration(milliseconds: 150),
          ),
        ),
      );
    }
  }
}
