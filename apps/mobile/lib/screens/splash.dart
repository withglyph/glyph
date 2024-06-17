import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultShell(
      appBar: Heading.empty(backgroundColor: BrandColors.gray_900),
      child: const DecoratedBox(
        decoration: BoxDecoration(
          color: BrandColors.gray_900,
        ),
        child: Center(
          child: SvgImage(
            'logos/compact',
            height: 50,
            color: BrandColors.gray_0,
          ),
        ),
      ),
    );
  }
}
