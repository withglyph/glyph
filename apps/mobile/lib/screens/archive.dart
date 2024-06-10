import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/heading.dart';
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
        ArchivePurchasesRoute(),
        ArchiveRecentsRoute(),
        ArchiveEmojisRoute(),
        ArchiveCommentsRoute(),
      ],
      builder: (context, child, tabController) {
        return Scaffold(
          appBar: const Heading(
            bottomBorder: false,
            title: const Text(
              '보관함',
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
            ),
          ),
          body: Column(
            children: [
              Container(
                decoration: const BoxDecoration(
                  color: BrandColors.gray_0,
                  border: Border(
                    bottom: BorderSide(color: BrandColors.gray_50),
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 7,
                  ),
                  child: Row(
                    children: [
                      _TabItem(
                        title: '북마크',
                        isActive: tabController.index == 0,
                        onTap: () => tabController.animateTo(0),
                      ),
                      const Gap(8),
                      _TabItem(
                        title: '구매',
                        isActive: tabController.index == 1,
                        onTap: () => tabController.animateTo(1),
                      ),
                      const Gap(8),
                      _TabItem(
                        title: '최근',
                        isActive: tabController.index == 2,
                        onTap: () => tabController.animateTo(2),
                      ),
                      const Gap(8),
                      _TabItem(
                        title: '이모지',
                        isActive: tabController.index == 3,
                        onTap: () => tabController.animateTo(3),
                      ),
                      const Gap(8),
                      _TabItem(
                        title: '댓글',
                        isActive: tabController.index == 4,
                        onTap: () => tabController.animateTo(4),
                      ),
                    ],
                  ),
                ),
              ),
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
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isActive ? BrandColors.gray_900 : BrandColors.gray_0,
          border: Border.all(
            color: isActive ? BrandColors.gray_900 : BrandColors.gray_150,
          ),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Text(
          title,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isActive ? BrandColors.gray_0 : BrandColors.gray_400,
          ),
        ),
      ),
    );
  }
}
