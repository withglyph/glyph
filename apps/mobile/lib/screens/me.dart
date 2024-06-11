import 'package:auto_route/auto_route.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/Img.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/me_screen_query.req.gql.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:sliver_tools/sliver_tools.dart';

@RoutePage()
class MeScreen extends ConsumerStatefulWidget {
  const MeScreen({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _MeScreenState();
}

class _MeScreenState extends ConsumerState<MeScreen>
    with TickerProviderStateMixin {
  final _spaceHeaderKey = GlobalKey();

  late AnimationController _appBarAnimationController;
  late Animation<Color?> _appBarBackgroundColorAnimation;
  late Animation<Color?> _appBarForegroundColorAnimation;

  @override
  void initState() {
    super.initState();

    _appBarAnimationController = AnimationController(
      vsync: this,
      duration: Duration.zero,
    );

    _appBarBackgroundColorAnimation = ColorTween(
      begin: BrandColors.gray_900,
      end: BrandColors.gray_0,
    ).animate(_appBarAnimationController);

    _appBarForegroundColorAnimation = ColorTween(
      begin: BrandColors.gray_0,
      end: BrandColors.gray_900,
    ).animate(_appBarAnimationController);
  }

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: GMeScreen_QueryReq(),
      builder: (context, client, data) {
        return Scaffold(
          backgroundColor: BrandColors.gray_900,
          appBar: Heading.animated(
            animation: _appBarAnimationController,
            builder: (context) {
              return Heading(
                bottomBorder: false,
                backgroundColor: _appBarBackgroundColorAnimation.value,
                actions: [
                  Pressable(
                    child: SvgIcon(
                      'notification',
                      color: _appBarForegroundColorAnimation.value,
                    ),
                    onPressed: () {
                      context.router.push(const NotificationRoute());
                    },
                  ),
                  const Gap(16),
                  Pressable(
                    child: SvgIcon(
                      'settings',
                      color: _appBarForegroundColorAnimation.value,
                    ),
                    onPressed: () {
                      context.router.push(const SettingsRoute());
                    },
                  ),
                ],
              );
            },
          ),
          body: NotificationListener<ScrollUpdateNotification>(
            onNotification: (notification) {
              final box = _spaceHeaderKey.currentContext?.findRenderObject()
                  as RenderBox;
              final offset = box.localToGlobal(Offset.zero);
              final safeAreaHeight = MediaQuery.of(context).padding.top;

              final spaceHeaderTopPosition = offset.dy - safeAreaHeight - 54;
              _appBarAnimationController.animateTo(
                clampDouble((-spaceHeaderTopPosition + 50) / 50, 0, 1),
              );

              return false;
            },
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: Container(
                    color: BrandColors.gray_900,
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
                    child: Column(
                      children: [
                        Pressable(
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 27,
                                backgroundColor: BrandColors.gray_600,
                                child: Padding(
                                  padding: const EdgeInsets.all(1),
                                  child: ClipOval(
                                    child: Img(data.me!.profile.avatar),
                                  ),
                                ),
                              ),
                              const Gap(8),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    data.me!.profile.name,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600,
                                      color: BrandColors.gray_0,
                                    ),
                                  ),
                                  Text(
                                    data.me!.email,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      color: BrandColors.gray_300,
                                    ),
                                  ),
                                ],
                              ),
                              const Spacer(),
                              const Gap(24),
                              const SvgIcon(
                                'chevron-right',
                                color: BrandColors.gray_400,
                              ),
                            ],
                          ),
                          onPressed: () {
                            context.router.push(const ProfileRoute());
                          },
                        ),
                        const Gap(20),
                        Container(
                          height: 76,
                          color: const Color(0xFF424242),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              Pressable(
                                child: const Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    SvgIcon('scan', color: BrandColors.gray_0),
                                    Gap(4),
                                    Text(
                                      '리딤코드',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                        color: BrandColors.gray_0,
                                      ),
                                    )
                                  ],
                                ),
                                onPressed: () {
                                  context.router.push(
                                    const PointPurchaseRoute(),
                                  );
                                },
                              ),
                              Container(
                                width: 1,
                                height: 42,
                                color: BrandColors.gray_500,
                              ),
                              Pressable(
                                child: const Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    SvgIcon(
                                      'pig-money',
                                      color: BrandColors.gray_0,
                                    ),
                                    Gap(4),
                                    Text(
                                      '수익/출금',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                        color: BrandColors.gray_0,
                                      ),
                                    )
                                  ],
                                ),
                                onPressed: () {
                                  context.router.push(
                                    WebViewRoute(
                                      title: '수익/출금',
                                      path: '/me/revenue',
                                    ),
                                  );
                                },
                              ),
                              Container(
                                width: 1,
                                height: 42,
                                color: BrandColors.gray_500,
                              ),
                              Pressable(
                                child: const Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    SvgIcon(
                                      'filter-cog',
                                      color: BrandColors.gray_0,
                                    ),
                                    Gap(4),
                                    Text(
                                      '콘텐츠 필터링',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                        color: BrandColors.gray_0,
                                      ),
                                    )
                                  ],
                                ),
                                onPressed: () {
                                  context.router.push(
                                    WebViewRoute(
                                      title: '콘텐츠 필터링',
                                      path: '/me/contentfilters',
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                SliverPinnedHeader(
                  child: Container(
                    key: _spaceHeaderKey,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                    decoration: const BoxDecoration(
                      color: BrandColors.gray_0,
                      border: Border(
                        bottom: BorderSide(color: BrandColors.gray_100),
                      ),
                    ),
                    child: Row(
                      children: [
                        const Text(
                          '내 스페이스',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const Spacer(),
                        Pressable(
                          child: Container(
                            color: BrandColors.gray_50,
                            padding: const EdgeInsets.fromLTRB(6, 4, 8, 4),
                            child: const Row(
                              children: [
                                SvgIcon('plus',
                                    size: 16, color: BrandColors.gray_600),
                                Text(
                                  '만들기',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: BrandColors.gray_600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                SliverList.builder(
                  itemCount: data.me!.spaces.length,
                  itemBuilder: (context, index) {
                    final space = data.me!.spaces[index];

                    return Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 16,
                      ),
                      decoration: const BoxDecoration(
                        color: BrandColors.gray_0,
                        border: Border(
                          bottom: BorderSide(color: BrandColors.gray_50),
                        ),
                      ),
                      child: Center(
                        child: Row(
                          children: [
                            Stack(
                              children: [
                                Img(
                                  space.icon,
                                  width: 36,
                                  height: 36,
                                ),
                                Positioned(
                                  bottom: 0,
                                  right: 0,
                                  child: Transform.translate(
                                    offset: const Offset(4, 4),
                                    child: Img(
                                      space.meAsMember!.profile.avatar,
                                      width: 22,
                                      height: 22,
                                      borderRadius: 11,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const Gap(12),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  space.name,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                Text(
                                  'by ${space.meAsMember!.profile.name}',
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: BrandColors.gray_500,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
                SliverFillRemaining(
                  hasScrollBody: false,
                  fillOverscroll: true,
                  child: Container(color: BrandColors.gray_0),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
