import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:glyph/themes/colors.dart';

class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: BoxDecoration(
        color: BrandColors.gray[900],
      ),
      child: Center(
        child: SvgPicture.asset(
          'assets/logos/compact.svg',
          height: 50,
          colorFilter: ColorFilter.mode(
            BrandColors.gray[0]!,
            BlendMode.srcIn,
          ),
        ),
      ),
    );
  }
}
