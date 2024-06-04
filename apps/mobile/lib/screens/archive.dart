import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
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
          appBar: Heading(
            title: Text(
              '보관함',
              style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
            ),
            actions: [
              Pressable(
                child: SvgIcon('settings'),
                onPressed: () {},
              ),
            ],
          ),
          body: Column(
            children: [
              Container(
                height: 40,
                decoration: BoxDecoration(
                  color: BrandColors.gray_0,
                  border: Border(
                    bottom: BorderSide(color: BrandColors.gray_100),
                  ),
                ),
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _TabItem(
                        title: '북마크',
                        isActive: tabController.index == 0,
                        onTap: () => tabController.animateTo(0),
                      ),
                      _TabItem(
                        title: '구매',
                        isActive: tabController.index == 1,
                        onTap: () => tabController.animateTo(1),
                      ),
                      _TabItem(
                        title: '최근',
                        isActive: tabController.index == 2,
                        onTap: () => tabController.animateTo(2),
                      ),
                      _TabItem(
                        title: '이모지',
                        isActive: tabController.index == 3,
                        onTap: () => tabController.animateTo(3),
                      ),
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
    return Expanded(
      child: Pressable(
        onPressed: onTap,
        child: Stack(
          children: [
            Center(
              child: Text(
                title,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: isActive ? BrandColors.gray_900 : BrandColors.gray_400,
                ),
              ),
            ),
            Container(
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: BrandColors.gray_900,
                    width: 2,
                    style: isActive ? BorderStyle.solid : BorderStyle.none,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
