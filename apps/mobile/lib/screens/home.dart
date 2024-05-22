import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_image.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class HomeScreen extends ConsumerWidget {
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
                const SvgImage('logos/compact', height: 24),
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
                      prefixIcon: const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 12),
                        child: SvgIcon('search', color: BrandColors.gray_500),
                      ),
                      prefixIconConstraints:
                          const BoxConstraints(minHeight: 24),
                      hintText: '포스트, 태그를 검색하세요',
                      hintStyle: const TextStyle(color: BrandColors.gray_400),
                    ),
                    onSubmitted: (value) {
                      context.router.push(PlaceholderRoute(text: '검색: $value'));
                    },
                  ),
                ),
                const Gap(16),
                Pressable(
                  child: const SvgIcon('notification'),
                  onPressed: () {
                    context.router.push(const NotificationRoute());
                  },
                ),
              ],
            ),
          ),
          const Expanded(child: Center(child: Text('홈'))),
        ],
      ),
    );
  }
}
