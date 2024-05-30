import 'package:auto_route/auto_route.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/ferry/extension.dart';
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
              icon:
                  const SvgIcon('home', size: 22, color: BrandColors.gray_400),
              label: '홈',
              activeIcon: const SvgIcon('home-filled', size: 22),
              isActive: tabsRouter.activeIndex == 0,
              onTap: () {
                if (tabsRouter.activeIndex == 0) {
                  final controller = PrimaryScrollController.maybeOf(context);
                  controller?.animateTo(
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
              icon:
                  const SvgIcon('star', size: 22, color: BrandColors.gray_400),
              activeIcon: const SvgIcon('star-filled', size: 22),
              label: '구독',
              isActive: tabsRouter.activeIndex == 1,
              onTap: () {
                if (tabsRouter.activeIndex == 1) {
                  final controller = PrimaryScrollController.maybeOf(context);
                  controller?.animateTo(
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
                constraints: const BoxConstraints(
                  maxWidth: 36,
                  maxHeight: 36,
                ),
                decoration: BoxDecoration(
                  color: BrandColors.gray_900,
                  borderRadius: BorderRadius.circular(18),
                ),
                child: const Center(
                  child: SvgIcon('plus', size: 20, color: BrandColors.gray_0),
                ),
              ),
              onTap: () async {
                final client = ref.read(ferryProvider);
                final req = GLobbyShell_CreatePost_MutationReq();
                final resp = await client.req(req);

                if (context.mounted) {
                  context.router.push(
                    EditorRoute(permalink: resp.createPost.permalink),
                  );
                }
              },
            ),
            LobbyBottomNavigationBarItem(
              icon: const SvgIcon('archive',
                  size: 22, color: BrandColors.gray_400),
              activeIcon: const SvgIcon('archive-filled', size: 22),
              label: '보관함',
              isActive: tabsRouter.activeIndex == 2,
              onTap: () {
                if (tabsRouter.activeIndex == 2) {
                  final controller = PrimaryScrollController.maybeOf(context);
                  controller?.animateTo(
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
                radius: 11,
                backgroundColor: BrandColors.gray_100,
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
                radius: 11,
                backgroundColor: BrandColors.gray_900,
                child: Padding(
                  padding: const EdgeInsets.all(1), // Border radius
                  child: ClipOval(
                      child: me == null
                          ? null
                          : Image.network(me.profile.avatar.url)),
                ),
              ),
              label: 'MY글리프',
              isActive: tabsRouter.activeIndex == 3,
              onTap: () {
                if (tabsRouter.activeIndex == 3) {
                  final controller = PrimaryScrollController.maybeOf(context);
                  controller?.animateTo(
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
    super.key,
    required this.items,
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
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 6),
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
      ),
    );
  }
}

class LobbyBottomNavigationBarItem extends ConsumerWidget {
  const LobbyBottomNavigationBarItem({
    super.key,
    required this.icon,
    this.activeIcon,
    this.label,
    this.isActive,
    this.onTap,
  });

  final Widget icon;
  final Widget? activeIcon;
  final String? label;
  final bool? isActive;
  final Function()? onTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentIcon = isActive == true ? activeIcon ?? icon : icon;

    return Pressable(
      onPressed: onTap,
      child: SizedBox(
        width: 60,
        child: Center(
          child: label == null
              ? currentIcon
              : Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    currentIcon,
                    const Gap(3),
                    Text(
                      label!,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: isActive == true
                            ? BrandColors.gray_900
                            : BrandColors.gray_400,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}
