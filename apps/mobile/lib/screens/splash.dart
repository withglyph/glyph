import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class SplashScreen extends ConsumerWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: const BoxDecoration(
        color: BrandColors.gray_900,
      ),
      child: Center(
        child: SvgPicture.asset(
          'assets/logos/compact.svg',
          height: 50,
          colorFilter: const ColorFilter.mode(
            BrandColors.gray_0,
            BlendMode.srcIn,
          ),
        ),
      ),
    );
  }
}
