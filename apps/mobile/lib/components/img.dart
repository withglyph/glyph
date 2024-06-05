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
    this.borderRadius = 2,
    this.fit = BoxFit.cover,
  });

  final GImg_image? image;
  final double? width;
  final double? height;
  final double? aspectRatio;
  final double borderRadius;
  final BoxFit fit;

  @override
  Widget build(BuildContext context) {
    final width = (aspectRatio != null && this.height != null)
        ? (this.height! * aspectRatio!)
        : this.width;
    final height = (aspectRatio != null && this.width != null)
        ? (this.width! / aspectRatio!)
        : this.height;

    if (image == null) {
      return Container(
        width: width,
        height: height,
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
          image: image!.url,
          width: width,
          height: height,
          fit: fit,
          fadeInDuration: const Duration(milliseconds: 150),
        ),
      );
    }
  }
}
