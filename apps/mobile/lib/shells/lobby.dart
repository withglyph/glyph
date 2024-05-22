import 'package:auto_route/auto_route.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/graphql/__generated__/lobby_shell_create_post_mutation.req.gql.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class LobbyShell extends ConsumerWidget {
  const LobbyShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ferry = ref.watch(ferryProvider);
    final authValue = ref.watch(authProvider);
    final me = switch (authValue) {
      AsyncData(value: Authenticated(:final me)) => me,
      _ => null,
    };

    return AutoTabsScaffold(
      routes: const [
        HomeRoute(),
        FeedRoute(),
        ArchiveRoute(),
        MeRoute(),
      ],
      resizeToAvoidBottomInset: false,
      transitionBuilder: (context, child, animation) => child,
      bottomNavigationBuilder: (context, tabsRouter) {
        return LobbyBottomNavigationBar(
          items: [
            LobbyBottomNavigationBarItem(
              icon: const SvgIcon('home', color: BrandColors.gray_600),
              activeIcon: const SvgIcon('home-filled'),
              isActive: tabsRouter.activeIndex == 0,
              onTap: () => tabsRouter.setActiveIndex(0),
            ),
            LobbyBottomNavigationBarItem(
              icon: const SvgIcon('newspaper', color: BrandColors.gray_600),
              activeIcon: const SvgIcon('newspaper-filled'),
              isActive: tabsRouter.activeIndex == 1,
              onTap: () => tabsRouter.setActiveIndex(1),
            ),
            LobbyBottomNavigationBarItem(
              icon: const SvgIcon('create', color: BrandColors.gray_600),
              activeIcon: const SvgIcon('create-filled'),
              onTap: () async {
                final req = GLobbyShell_CreatePost_MutationReq();
                final resp = await ferry.request(req).first;

                final data = resp.data?.createPost;
                if (data == null) {
                  return;
                }

                if (context.mounted) {
                  context.router.push(EditorRoute(permalink: data.permalink));
                }
              },
            ),
            LobbyBottomNavigationBarItem(
              icon: const SvgIcon('albums', color: BrandColors.gray_600),
              activeIcon: const SvgIcon('albums-filled'),
              isActive: tabsRouter.activeIndex == 2,
              onTap: () => tabsRouter.setActiveIndex(2),
            ),
            LobbyBottomNavigationBarItem(
              icon: CircleAvatar(
                radius: 12,
                backgroundColor: BrandColors.gray_200,
                child: Padding(
                  padding: const EdgeInsets.all(1), // Border radius
                  child: ClipOval(
                      child: me == null
                          ? null
                          : Image.network(me.profile.avatar.url)),
                ),
              ),
              activeIcon: CircleAvatar(
                key: const ValueKey('active'),
                radius: 15,
                backgroundColor: BrandColors.gray_900,
                child: Padding(
                  padding: const EdgeInsets.all(2), // Border radius
                  child: CircleAvatar(
                    backgroundColor: BrandColors.gray_0,
                    child: Padding(
                      padding: const EdgeInsets.all(1),
                      child: ClipOval(
                          child: me == null
                              ? null
                              : Image.network(me.profile.avatar.url)),
                    ),
                  ),
                ),
              ),
              isActive: tabsRouter.activeIndex == 3,
              onTap: () => tabsRouter.setActiveIndex(3),
            ),
          ],
        );
      },
    );
  }
}

class LobbyBottomNavigationBar extends ConsumerWidget {
  const LobbyBottomNavigationBar({
    super.key,
    required this.items,
  });

  final List<LobbyBottomNavigationBarItem> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      height: 85,
      decoration: const BoxDecoration(
        color: BrandColors.gray_0,
        border: Border(top: BorderSide(color: BrandColors.gray_200)),
      ),
      child: SafeArea(
        child: Row(
          children: items.map((item) {
            return Expanded(
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTap: item.onTap,
                child: Center(
                  child: item.isActive == true ? item.activeIcon : item.icon,
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class LobbyBottomNavigationBarItem {
  const LobbyBottomNavigationBarItem({
    required this.icon,
    Widget? activeIcon,
    this.isActive,
    this.onTap,
  }) : activeIcon = activeIcon ?? icon;

  final Widget icon;
  final Widget? activeIcon;
  final bool? isActive;
  final Function()? onTap;
}
