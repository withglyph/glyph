import 'dart:math';

import 'package:flutter/material.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/graphql/fragments/__generated__/img_image.data.gql.dart';
import 'package:glyph/themes/colors.dart';
import 'package:transparent_image/transparent_image.dart';

class Img extends StatelessWidget {
  const Img(
    this.image, {
    super.key,
    this.width,
    this.height,
    this.aspectRatio,
    this.quality = 75,
    this.borderRadius = 2,
    this.fit = BoxFit.cover,
  });

  final GImg_image? image;
  final double? width;
  final double? height;
  final double? aspectRatio;
  final double? quality;
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
          borderRadius: BorderRadius.circular(borderRadius),
          color: BrandColors.gray_50,
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
      return ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: FadeInImage.memoryNetwork(
          placeholder: kTransparentImage,
          image: '${image!.url}?s=$effectiveSize&q=$quality',
          width: effectiveWidth,
          height: effectiveHeight,
          fit: fit,
          fadeInDuration: const Duration(milliseconds: 150),
        ),
      );
    }
  }
}
