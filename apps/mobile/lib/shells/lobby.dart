import 'package:auto_route/auto_route.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/push_notification.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class LobbyShell extends ConsumerStatefulWidget {
  const LobbyShell({super.key});

  @override
  ConsumerState<LobbyShell> createState() {
    return _LobbyShellState();
  }
}

class _LobbyShellState extends ConsumerState<LobbyShell> {
  final _messaging = GetIt.I<FirebaseMessaging>();

  @override
  void initState() {
    super.initState();

    _messaging.requestPermission();
    ref.read(pushNotificationProvider.notifier).registerToken();
  }

  @override
  Widget build(BuildContext context) {
    final authValue = ref.watch(authProvider);
    final me = switch (authValue) {
      AsyncData(value: Authenticated(:final me)) => me,
      _ => null,
    };

    return AutoTabsScaffold(
      resizeToAvoidBottomInset: false,
      routes: [
        const HomeRoute(),
        const FeedRoute(),
        const ArchiveRoute(),
        MeRoute(),
      ],
      transitionBuilder: (context, child, animation) => child,
      bottomNavigationBuilder: (context, tabsRouter) {
        return BottomNavigationBar(
          items: [
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                'assets/icons/home.svg',
                width: 24,
                colorFilter: const ColorFilter.mode(
                    BrandColors.gray_600, BlendMode.srcIn),
              ),
              activeIcon: SvgPicture.asset(
                'assets/icons/home-filled.svg',
                width: 24,
                colorFilter: const ColorFilter.mode(
                    BrandColors.gray_900, BlendMode.srcIn),
              ),
              isActive: tabsRouter.activeIndex == 0,
              onTap: () => tabsRouter.setActiveIndex(0),
            ),
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                'assets/icons/newspaper.svg',
                width: 24,
                colorFilter: const ColorFilter.mode(
                    BrandColors.gray_600, BlendMode.srcIn),
              ),
              activeIcon: SvgPicture.asset(
                'assets/icons/newspaper-filled.svg',
                width: 24,
                colorFilter: const ColorFilter.mode(
                    BrandColors.gray_900, BlendMode.srcIn),
              ),
              isActive: tabsRouter.activeIndex == 1,
              onTap: () => tabsRouter.setActiveIndex(1),
            ),
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                'assets/icons/create.svg',
                width: 24,
                colorFilter: const ColorFilter.mode(
                    BrandColors.gray_600, BlendMode.srcIn),
              ),
              activeIcon: SvgPicture.asset(
                'assets/icons/create-filled.svg',
                width: 24,
                colorFilter: const ColorFilter.mode(
                    BrandColors.gray_900, BlendMode.srcIn),
              ),
              onTap: () {
                context.router.push(const EditorRoute());
              },
            ),
            BottomNavigationBarItem(
              icon: SvgPicture.asset(
                'assets/icons/albums.svg',
                width: 24,
                colorFilter: const ColorFilter.mode(
                    BrandColors.gray_600, BlendMode.srcIn),
              ),
              activeIcon: SvgPicture.asset(
                'assets/icons/albums-filled.svg',
                width: 24,
                colorFilter: const ColorFilter.mode(
                    BrandColors.gray_900, BlendMode.srcIn),
              ),
              isActive: tabsRouter.activeIndex == 2,
              onTap: () => tabsRouter.setActiveIndex(2),
            ),
            BottomNavigationBarItem(
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

class BottomNavigationBar extends ConsumerWidget {
  const BottomNavigationBar({
    super.key,
    required this.items,
  });

  final List<BottomNavigationBarItem> items;

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

class BottomNavigationBarItem {
  const BottomNavigationBarItem({
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
