import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/context/bottom_menu.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  bool _showBottomBorder = false;

  @override
  Widget build(BuildContext context) {
    return AutoTabsRouter(
      routes: const [
        FeedRecommendRoute(),
        FeedFollowingRoute(),
        FeedChallengeRoute(),
      ],
      transitionBuilder: (context, child, animation) => child,
      builder: (context, child) {
        final tabsRouter = AutoTabsRouter.of(context);
        return DefaultShell(
          appBar: Heading(
            bottomBorder: _showBottomBorder,
            leading: Pressable(
              child: Row(
                children: [
                  Text(
                    switch (tabsRouter.activeIndex) {
                      0 => '추천',
                      1 => '구독',
                      2 => '챌린지',
                      _ => throw UnimplementedError(),
                    },
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const Gap(4),
                  const Icon(TablerBold.chevron_down, size: 16),
                ],
              ),
              onPressed: () async {
                await context.showBottomSelectMenu(
                  title: '피드',
                  value: tabsRouter.activeIndex,
                  items: [
                    BottomSelectMenuItem(label: '추천', value: 0),
                    BottomSelectMenuItem(label: '구독', value: 1),
                    BottomSelectMenuItem(label: '챌린지', value: 2),
                  ],
                  onSelected: (value) {
                    tabsRouter.setActiveIndex(value);
                  },
                );
              },
            ),
            actions: [
              if (tabsRouter.activeIndex == 1) ...[
                Pressable(
                  child: const Icon(Tabler.settings),
                  onPressed: () async {
                    await context.router.push(
                      WebViewRoute(
                        title: '구독 설정',
                        path: '/me/subscribes',
                      ),
                    );
                  },
                ),
                const Gap(20),
              ],
              Pressable(
                child: const Icon(Tabler.bell),
                onPressed: () async {
                  await context.router.push(
                    const NotificationRoute(),
                  );
                },
              ),
            ],
          ),
          child: NotificationListener<ScrollUpdateNotification>(
            onNotification: (notification) {
              final showBottomBorder = notification.metrics.pixels > 0;
              if (showBottomBorder != _showBottomBorder) {
                setState(() {
                  _showBottomBorder = showBottomBorder;
                });
              }

              return false;
            },
              child: child,
            ),
        );
      },
    );
  }
}
