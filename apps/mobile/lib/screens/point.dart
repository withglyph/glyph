import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class PointScreen extends ConsumerWidget {
  const PointScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AutoTabsRouter.tabBar(
      routes: const [
        PointPurchaseRoute(),
        PointHistoryRoute(),
      ],
      builder: (context, child, tabController) {
        return DefaultShell(
          bottomBorder: false,
          title: '포인트',
          child: Column(
            children: [
              Stack(
                children: [
                  const Positioned.fill(
                    top: null,
                    child: HorizontalDivider(
                      color: BrandColors.gray_50,
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      children: [
                        _TabItem(
                          title: '충전',
                          isActive: tabController.index == 0,
                          onTap: () => tabController.animateTo(0),
                        ),
                        _TabItem(
                          title: '사용내역',
                          isActive: tabController.index == 1,
                          onTap: () => tabController.animateTo(1),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              Expanded(child: child),
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
            Container(
              padding: const EdgeInsets.only(top: 6, bottom: 8),
              child: Center(
                child: Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color:
                        isActive ? BrandColors.gray_900 : BrandColors.gray_400,
                  ),
                ),
              ),
            ),
            if (isActive)
              const Positioned.fill(
                top: null,
                child: HorizontalDivider(
                  height: 2,
                  color: BrandColors.gray_900,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
