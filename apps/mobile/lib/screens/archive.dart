import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class ArchiveScreen extends ConsumerWidget {
  const ArchiveScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AutoTabsRouter.tabBar(
      routes: const [
        ArchiveBookmarksRoute(),
        ArchiveRecentsRoute(),
        ArchiveEmojisRoute(),
        ArchiveCommentsRoute(),
      ],
      builder: (context, child, tabController) {
        return Scaffold(
          appBar: const Heading(
            title: Text(
              '보관함',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
            ),
          ),
          body: Column(
            children: [
              const HorizontalDivider(color: BrandColors.gray_50),
              Container(
                color: BrandColors.gray_0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _TabItem(
                      title: '북마크',
                      isActive: tabController.index == 0,
                      onTap: () => tabController.animateTo(0),
                    ),
                    _TabItem(
                      title: '최근',
                      isActive: tabController.index == 1,
                      onTap: () => tabController.animateTo(1),
                    ),
                    _TabItem(
                      title: '이모지',
                      isActive: tabController.index == 2,
                      onTap: () => tabController.animateTo(2),
                    ),
                    _TabItem(
                      title: '댓글',
                      isActive: tabController.index == 3,
                      onTap: () => tabController.animateTo(3),
                    ),
                  ],
                ),
              ),
              const HorizontalDivider(color: BrandColors.gray_150),
              Expanded(child: child)
            ],
          ),
        );
      },
    );
  }
}

class _TabItem extends StatelessWidget {
  const _TabItem({
    required this.title,
    required this.isActive,
    required this.onTap,
  });

  final String title;
  final bool isActive;
  final Function() onTap;

  @override
  Widget build(BuildContext context) {
    return Pressable(
      onPressed: onTap,
      child: Container(
        width: 80,
        padding: const EdgeInsets.only(top: 12),
        child: Center(
          child: Column(
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: isActive ? BrandColors.gray_900 : BrandColors.gray_300,
                ),
              ),
              const Gap(6),
              HorizontalDivider(
                height: 2,
                color: isActive ? BrandColors.gray_900 : Colors.transparent,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
