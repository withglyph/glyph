import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/lib/screen.dart';
import 'package:glyph/router.gr.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class HomeScreen extends Screen {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                SvgPicture.asset(
                  'assets/logos/compact.svg',
                  height: 24,
                  colorFilter: const ColorFilter.mode(
                      BrandColors.gray_900, BlendMode.srcIn),
                ),
                const Gap(16),
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      isDense: true,
                      filled: true,
                      fillColor: BrandColors.gray_100,
                      border: OutlineInputBorder(
                        borderSide: BorderSide.none,
                        borderRadius: BorderRadius.circular(999),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                      prefixIcon: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: SvgPicture.asset(
                          'assets/icons/search.svg',
                          height: 24,
                          colorFilter: const ColorFilter.mode(
                              BrandColors.gray_500, BlendMode.srcIn),
                        ),
                      ),
                      prefixIconConstraints:
                          const BoxConstraints(minHeight: 24),
                      hintText: '포스트, 태그를 검색하세요',
                      hintStyle: const TextStyle(color: BrandColors.gray_400),
                    ),
                    // BoxConstraints.tight(const Size.square(24))),
                  ),
                ),
                const Gap(16),
                Pressable(
                  child: SvgPicture.asset(
                    'assets/icons/notification.svg',
                    height: 24,
                    colorFilter: const ColorFilter.mode(
                        BrandColors.gray_900, BlendMode.srcIn),
                  ),
                  onPressed: () {
                    context.router.push(PlaceholderRoute(text: '알림'));
                  },
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}
