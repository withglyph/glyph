import 'package:auto_route/auto_route.dart';
import 'package:collection/collection.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/lib/screen.dart';
import 'package:glyph/providers/auth.dart';
import 'package:glyph/providers/push_notification.dart';
import 'package:glyph/router.gr.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class RootShellScreen extends StatefulScreen {
  const RootShellScreen({super.key});

  @override
  ScreenState<RootShellScreen> createState() {
    return _RootShellScreenState();
  }
}

class _RootShellScreenState extends ScreenState<RootShellScreen> {
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
        const EditorRoute(),
        const ArchiveRoute(),
        MeRoute(),
      ],
      transitionBuilder: (context, child, animation) => child,
      bottomNavigationBuilder: (context, tabsRouter) {
        return BottomNavigationBar(
          currentIndex: tabsRouter.activeIndex,
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
            ),
            me == null
                ? BottomNavigationBarItem(
                    icon: SvgPicture.asset(
                      'assets/icons/person-circle.svg',
                      width: 24,
                      colorFilter: const ColorFilter.mode(
                          BrandColors.gray_600, BlendMode.srcIn),
                    ),
                    activeIcon: SvgPicture.asset(
                      'assets/icons/person-circle-filled.svg',
                      width: 24,
                      colorFilter: const ColorFilter.mode(
                          BrandColors.gray_900, BlendMode.srcIn),
                    ),
                  )
                : BottomNavigationBarItem(
                    icon: CircleAvatar(
                      radius: 12,
                      backgroundColor: BrandColors.gray_200,
                      child: Padding(
                        padding: const EdgeInsets.all(1), // Border radius
                        child: ClipOval(
                            child: Image.network(me.profile.avatar.url)),
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
                                child: Image.network(me.profile.avatar.url)),
                          ),
                        ),
                      ),
                    ),
                  ),
          ],
          onTap: (index) {
            tabsRouter.setActiveIndex(index);
          },
        );
      },
    );
  }
}

class BottomNavigationBar extends ConsumerWidget {
  const BottomNavigationBar({
    super.key,
    required this.items,
    required this.currentIndex,
    required this.onTap,
  });

  final List<BottomNavigationBarItem> items;
  final int currentIndex;
  final Function(int) onTap;

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
          children: items.mapIndexed((index, item) {
            return Expanded(
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                child: Center(
                  child: index == currentIndex ? item.activeIcon : item.icon,
                ),
                onTap: () {
                  onTap(index);
                },
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
  }) : activeIcon = activeIcon ?? icon;

  final Widget icon;
  final Widget? activeIcon;
}
