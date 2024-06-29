import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/lobby_shell_create_post_mutation.req.gql.dart';
import 'package:glyph/icons/glyph.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class LobbyShell extends ConsumerWidget {
  const LobbyShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authValue = ref.watch(authProvider);
    final me = switch (authValue) {
      AsyncData(value: Authenticated(:final me)) => me,
      _ => null,
    };

    return AutoTabsScaffold(
      routes: const [
        FeedRoute(),
        SearchRoute(),
        ArchiveRoute(),
        MeRoute(),
      ],
      transitionBuilder: (context, child, animation) => child,
      bottomNavigationBuilder: (context, tabsRouter) {
        return LobbyBottomNavigationBar(
          items: [
            LobbyBottomNavigationBarItem(
              icon: const Icon(TablerBold.article, color: BrandColors.gray_300),
              activeIcon: const Icon(TablerBold.article_filled),
              isActive: tabsRouter.activeIndex == 0,
              onTap: () async {
                if (tabsRouter.activeIndex == 0) {
                  final controller = PrimaryScrollController.maybeOf(context);
                  await controller?.animateTo(
                    0,
                    duration: const Duration(milliseconds: 1000),
                    curve: Curves.fastEaseInToSlowEaseOut,
                  );
                } else {
                  tabsRouter.setActiveIndex(0);
                }
              },
            ),
            LobbyBottomNavigationBarItem(
              icon: const Icon(Glyph.search, color: BrandColors.gray_300),
              activeIcon: const Icon(Glyph.search),
              isActive: tabsRouter.activeIndex == 1,
              onTap: () async {
                if (tabsRouter.activeIndex == 1) {
                  final controller = PrimaryScrollController.maybeOf(context);
                  await controller?.animateTo(
                    0,
                    duration: const Duration(milliseconds: 1000),
                    curve: Curves.fastEaseInToSlowEaseOut,
                  );
                } else {
                  tabsRouter.setActiveIndex(1);
                }
              },
            ),
            LobbyBottomNavigationBarItem(
              icon: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: BrandColors.gray_900,
                  borderRadius: BorderRadius.circular(18),
                  boxShadow: [
                    BoxShadow(
                      color: BrandColors.gray_900.withOpacity(0.2),
                      offset: const Offset(2, 3),
                      blurRadius: 20,
                    ),
                  ],
                ),
                child: const Center(
                  child: Icon(
                    TablerBold.plus,
                    size: 16,
                    color: BrandColors.gray_0,
                  ),
                ),
              ),
              onTap: () async {
                final client = ref.read(ferryProvider);
                final req = GLobbyShell_CreatePost_MutationReq();
                final resp = await client.req(req);

                if (context.mounted) {
                  await context.router.push(
                    EditorRoute(permalink: resp.createPost.permalink),
                  );
                }
              },
            ),
            LobbyBottomNavigationBarItem(
              icon: const Icon(TablerBold.archive, color: BrandColors.gray_300),
              activeIcon: const Icon(TablerBold.archive_filled),
              isActive: tabsRouter.activeIndex == 2,
              onTap: () async {
                if (tabsRouter.activeIndex == 2) {
                  final controller = PrimaryScrollController.maybeOf(context);
                  await controller?.animateTo(
                    0,
                    duration: const Duration(milliseconds: 1000),
                    curve: Curves.fastEaseInToSlowEaseOut,
                  );
                } else {
                  tabsRouter.setActiveIndex(2);
                }
              },
            ),
            LobbyBottomNavigationBarItem(
              icon: CircleAvatar(
                key: const ValueKey('inactive'),
                radius: 12,
                backgroundColor: BrandColors.gray_100,
                child: Padding(
                  padding: const EdgeInsets.all(1), // Border radius
                  child: ClipOval(
                    child: me == null ? null : Image.network(me.profile.avatar.url),
                  ),
                ),
              ),
              activeIcon: CircleAvatar(
                key: const ValueKey('active'),
                radius: 12,
                backgroundColor: BrandColors.gray_900,
                child: Padding(
                  padding: const EdgeInsets.all(1), // Border radius
                  child: ClipOval(
                    child: me == null ? null : Image.network(me.profile.avatar.url),
                  ),
                ),
              ),
              isActive: tabsRouter.activeIndex == 3,
              onTap: () async {
                if (tabsRouter.activeIndex == 3) {
                  final controller = PrimaryScrollController.maybeOf(context);
                  await controller?.animateTo(
                    0,
                    duration: const Duration(milliseconds: 1000),
                    curve: Curves.fastEaseInToSlowEaseOut,
                  );
                } else {
                  tabsRouter.setActiveIndex(3);
                }
              },
            ),
          ],
        );
      },
    );
  }
}

class LobbyBottomNavigationBar extends ConsumerWidget {
  const LobbyBottomNavigationBar({
    required this.items,
    super.key,
  });

  final List<LobbyBottomNavigationBarItem> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return SafeArea(
      child: Container(
        height: 56,
        decoration: const BoxDecoration(
          color: BrandColors.gray_0,
          border: Border(top: BorderSide(color: BrandColors.gray_100)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 460),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: items,
            ),
          ),
        ),
      ),
    );
  }
}

class LobbyBottomNavigationBarItem extends ConsumerWidget {
  const LobbyBottomNavigationBarItem({
    required this.icon,
    super.key,
    this.activeIcon,
    this.isActive,
    this.onTap,
  });

  final Widget icon;
  final Widget? activeIcon;
  final bool? isActive;
  final Function()? onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIcon = isActive == true ? activeIcon ?? icon : icon;

    return Pressable(
      onPressed: onTap,
      child: SizedBox(
        width: 60,
        child: Center(child: currentIcon),
      ),
    );
  }
}
