import 'dart:math';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/Img.dart';
import 'package:glyph/components/btn.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/context/bottom_menu.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/me_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/space_screen_create_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/space_screen_follow_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/space_screen_mute_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/space_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/space_screen_unfollow_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/space_screen_unmute_space_mutation.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:mixpanel_flutter/mixpanel_flutter.dart';
import 'package:nested_scroll_view_plus/nested_scroll_view_plus.dart';
import 'package:share_plus/share_plus.dart';
import 'package:sliver_tools/sliver_tools.dart';

@RoutePage()
class SpaceScreen extends StatefulWidget {
  const SpaceScreen({
    @PathParam() required this.slug,
    super.key,
  });

  final String slug;

  @override
  createState() => _SpaceScreenState();
}

class _SpaceScreenState extends State<SpaceScreen> {
  final _mixpanel = GetIt.I<Mixpanel>();

  final _headerKey = GlobalKey();

  bool _isOverHeader = true;
  double _headerScale = 1;
  bool _revealMutedSpace = false;

  @override
  Widget build(BuildContext context) {
    final safeAreaTopHeight = MediaQuery.of(context).padding.top;

    return Scaffold(
      body: AutoTabsRouter.tabBar(
        routes: [
          SpacePostsRoute(),
          SpaceCollectionsRoute(),
        ],
        builder: (context, child, tabController) {
          return GraphQLOperation(
            operation: GSpaceScreen_QueryReq(
              (b) => b..vars.slug = widget.slug,
            ),
            builder: (context, client, data) {
              return Scaffold(
                appBar: Heading(
                  bottomBorder: false,
                  backgroundColor: _isOverHeader ? BrandColors.gray_50 : BrandColors.gray_0,
                  leading: Row(
                    children: [
                      const HeadingAutoLeading(),
                      const Gap(18),
                      Pressable(
                        child: const Icon(Tabler.home),
                        onPressed: () async {
                          await context.router.navigate(const MainRouter());
                        },
                      ),
                    ],
                  ),
                  actions: [
                    Pressable(
                      child: const Icon(Tabler.share_2),
                      onPressed: () async {
                        await Share.shareUri(
                          Uri.parse('https://withglyph.com/${data.space.slug}'),
                        );
                      },
                    ),
                    const Gap(20),
                    Pressable(
                      child: const Icon(Tabler.dots_vertical),
                      onPressed: () async {
                        await context.showBottomMenu(
                          title: '스페이스',
                          items: [
                            if (data.space.meAsMember == null)
                              BottomMenuItem(
                                icon: Tabler.volume_3,
                                title: data.space.muted ? '스페이스 뮤트 해제' : '스페이스 뮤트',
                                color: BrandColors.red_600,
                                onTap: () async {
                                  if (data.space.muted) {
                                    _mixpanel.track(
                                      'space:unmute',
                                      properties: {'spaceId': data.space.id, 'via': 'space-screen'},
                                    );
                                    final req = GSpaceScreen_UnmuteSpace_MutationReq(
                                      (b) => b..vars.input.spaceId = data.space.id,
                                    );
                                    await client.request(req);

                                    if (context.mounted) {
                                      context.toast.show('${data.space.name} 스페이스 뮤트를 해제했어요');
                                    }
                                  } else {
                                    _mixpanel.track(
                                      'space:mute',
                                      properties: {'spaceId': data.space.id, 'via': 'space-screen'},
                                    );

                                    final req = GSpaceScreen_MuteSpace_MutationReq(
                                      (b) => b..vars.input.spaceId = data.space.id,
                                    );
                                    await client.request(req);

                                    if (context.mounted) {
                                      context.toast.show(
                                        '${data.space.name} 스페이스를 뮤트했어요',
                                        type: ToastType.error,
                                        actionText: '뮤트해제',
                                        onAction: () async {
                                          _mixpanel.track(
                                            'space:unmute',
                                            properties: {'spaceId': data.space.id, 'via': 'space-screen'},
                                          );
                                          final req = GSpaceScreen_UnmuteSpace_MutationReq(
                                            (b) => b..vars.input.spaceId = data.space.id,
                                          );
                                          await client.request(req);

                                          if (context.mounted) {
                                            context.toast.show('${data.space.name} 스페이스 뮤트를 해제했어요');
                                          }
                                        },
                                      );
                                    }
                                  }
                                },
                              ),
                            if (data.space.meAsMember != null)
                              BottomMenuItem(
                                icon: Tabler.settings,
                                title: '스페이스 관리',
                                iconColor: BrandColors.gray_400,
                                onTap: () async {
                                  final res = await context.router.push(
                                    SpaceDashboardRoute(slug: data.space.slug),
                                  );

                                  await client.refetch(
                                    GSpaceScreen_QueryReq(
                                      (b) => b..vars.slug = widget.slug,
                                    ),
                                  );
                                  await client.refetch(GMeScreen_QueryReq());

                                  if (res == 'space:delete' && context.mounted) {
                                    await context.router.maybePop();
                                  }
                                },
                              ),
                          ],
                        );
                      },
                    ),
                  ],
                ),
                body: NotificationListener<ScrollUpdateNotification>(
                  onNotification: (notification) {
                    if (notification.depth != 0) return false;

                    final headerBox = _headerKey.currentContext?.findRenderObject() as RenderBox?;
                    if (headerBox == null) return false;

                    final pos = headerBox.localToGlobal(Offset.zero).dy + headerBox.size.height;

                    final threshhold = safeAreaTopHeight + 54;
                    final isOverHeader = pos >= threshhold;
                    if (isOverHeader != _isOverHeader) {
                      setState(() {
                        _isOverHeader = isOverHeader;
                      });
                    }

                    final overscrollHeight = -notification.metrics.pixels;
                    final scale = 1.0 + max(0.0, overscrollHeight / headerBox.size.height);
                    if (scale != _headerScale) {
                      setState(() {
                        _headerScale = scale;
                      });
                    }

                    return false;
                  },
                  child: NestedScrollViewPlus(
                    physics: const AlwaysScrollableScrollPhysics(
                      parent: BouncingScrollPhysics(),
                    ),
                    headerSliverBuilder: (context, innerBoxIsScrolled) {
                      return [
                        SliverToBoxAdapter(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Stack(
                                clipBehavior: Clip.none,
                                children: [
                                  Transform.scale(
                                    key: _headerKey,
                                    scale: _headerScale,
                                    alignment: Alignment.bottomCenter,
                                    child: const Box(width: double.infinity, height: 88, color: BrandColors.gray_50),
                                  ),
                                  Positioned(
                                    left: 20,
                                    bottom: -40,
                                    child: Stack(
                                      clipBehavior: Clip.none,
                                      children: [
                                        Img(
                                          data.space.icon,
                                          width: 80,
                                          height: 80,
                                          borderWidth: 1,
                                          borderRadius: 6,
                                        ),
                                        Positioned(
                                          bottom: -8,
                                          right: -8,
                                          child: Img(
                                            data.space.members[0].profile.avatar,
                                            width: 40,
                                            height: 40,
                                            aspectRatio: 1 / 1,
                                            borderWidth: 1,
                                            borderRadius: 20,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              Padding(
                                padding: const Pad(horizontal: 20),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Gap(52),
                                    Text(
                                      data.space.name,
                                      style: const TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const Gap(2),
                                    Text(
                                      'by ${data.space.members[0].profile.name}',
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                    const Gap(10),
                                    Row(
                                      children: [
                                        const Icon(
                                          Tabler.user_filled,
                                          size: 14,
                                          color: BrandColors.gray_400,
                                        ),
                                        const Gap(4),
                                        Text(
                                          '${data.space.followerCount}명',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w500,
                                            color: BrandColors.gray_500,
                                          ),
                                        ),
                                        const Gap(12),
                                        const Icon(
                                          Tabler.notes,
                                          size: 14,
                                          color: BrandColors.gray_400,
                                        ),
                                        const Gap(4),
                                        Text(
                                          '${data.space.postCount}개',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w500,
                                            color: BrandColors.gray_500,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const Gap(34),
                                    Btn(
                                      data.space.meAsMember != null
                                          ? '포스트 작성'
                                          : data.space.muted
                                              ? '뮤트됨'
                                              : data.space.followed
                                                  ? '스페이스 구독중'
                                                  : '스페이스 구독',
                                      theme: (data.space.meAsMember == null && data.space.followed)
                                          ? BtnTheme.secondaryOutline
                                          : BtnTheme.primary,
                                      iconLeft: data.space.muted
                                          ? Tabler.volume_3
                                          : data.space.followed
                                              ? Tabler.check
                                              : Tabler.plus,
                                      enabled: !data.space.muted,
                                      onPressed: data.space.muted
                                          ? null
                                          : () async {
                                              if (data.space.meAsMember == null) {
                                                if (data.space.followed) {
                                                  _mixpanel.track(
                                                    'space:unfollow',
                                                    properties: {'spaceId': data.space.id, 'via': 'space-screen'},
                                                  );
                                                  final req = GSpaceScreen_UnfollowSpace_MutationReq(
                                                    (b) => b..vars.input.spaceId = data.space.id,
                                                  );
                                                  await client.request(req);
                                                } else {
                                                  _mixpanel.track(
                                                    'space:follow',
                                                    properties: {'spaceId': data.space.id, 'via': 'space-screen'},
                                                  );
                                                  final req = GSpaceScreen_FollowSpace_MutationReq(
                                                    (b) => b..vars.input.spaceId = data.space.id,
                                                  );
                                                  await client.request(req);
                                                }
                                              } else {
                                                _mixpanel.track(
                                                  'post:create',
                                                  properties: {'via': 'space-screen'},
                                                );

                                                final req = GSpaceScreen_CreatePost_MutationReq(
                                                  (b) => b..vars.input.spaceId = data.space.id,
                                                );
                                                final resp = await client.request(req);

                                                if (context.mounted) {
                                                  await context.router.push(
                                                    EditorRoute(permalink: resp.createPost.permalink),
                                                  );
                                                }
                                              }
                                            },
                                    ),
                                    const Gap(24),
                                  ],
                                ),
                              ),
                              const HorizontalDivider(
                                height: 8,
                                color: BrandColors.gray_50,
                              ),
                              if ((data.space.description != null && data.space.description != '') ||
                                  data.space.meAsMember != null) ...[
                                Padding(
                                  padding: const Pad(horizontal: 20, vertical: 24),
                                  child: SizedBox(
                                    width: double.infinity,
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          '소개',
                                          style: TextStyle(
                                            fontSize: 13,
                                            fontWeight: FontWeight.w700,
                                            color: BrandColors.gray_400,
                                          ),
                                        ),
                                        const Gap(8),
                                        Text(
                                          data.space.description != null && data.space.description != ''
                                              ? '${data.space.description}'
                                              : '아직 스페이스를 소개하는 글이 작성되지 않았어요\n스페이스 관리에서 소개글을 작성해주세요',
                                          style: TextStyle(
                                            fontSize: 14,
                                            color: (data.space.description == '' || data.space.description == null) &&
                                                    data.space.meAsMember != null
                                                ? BrandColors.gray_400
                                                : BrandColors.gray_900,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                const HorizontalDivider(
                                  height: 8,
                                  color: BrandColors.gray_50,
                                ),
                              ],
                            ],
                          ),
                        ),
                        SliverPinnedHeader(
                          child: Stack(
                            children: [
                              const Positioned.fill(
                                child: ColoredBox(
                                  color: BrandColors.gray_0,
                                ),
                              ),
                              const Positioned.fill(
                                top: null,
                                child: HorizontalDivider(
                                  color: BrandColors.gray_50,
                                ),
                              ),
                              Padding(
                                padding: const Pad(horizontal: 20),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: _TabItem(
                                        title: '포스트 ${data.space.postCount}',
                                        isActive: tabController.index == 0,
                                        onTap: () => tabController.animateTo(0),
                                      ),
                                    ),
                                    Expanded(
                                      child: _TabItem(
                                        title: '컬렉션 ${data.space.collections.length}',
                                        isActive: tabController.index == 1,
                                        onTap: () => tabController.animateTo(1),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ];
                    },
                    body: data.space.muted && !_revealMutedSpace
                        ? Center(
                            child: Padding(
                              padding: const Pad(horizontal: 20),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(TablerBold.alert_triangle, size: 40),
                                  const Gap(16),
                                  const Text(
                                    '뮤트된 스페이스에요',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.w700,
                                      color: BrandColors.gray_800,
                                    ),
                                  ),
                                  const Gap(4),
                                  Text(
                                    '포스트를 봐도 ${data.space.name} 스페이스의 차단이 해제되지 않아요',
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      fontSize: 14,
                                      color: BrandColors.gray_500,
                                    ),
                                  ),
                                  const Gap(20),
                                  Padding(
                                    padding: const Pad(horizontal: 100),
                                    child: Btn(
                                      '포스트 보기',
                                      onPressed: () {
                                        setState(() {
                                          _revealMutedSpace = true;
                                        });
                                      },
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                        : child,
                  ),
                ),
              );
            },
          );
        },
      ),
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
        padding: const Pad(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              width: 2,
              color: isActive ? BrandColors.gray_900 : Colors.transparent,
            ),
          ),
        ),
        child: Text(
          title,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
            color: isActive ? BrandColors.gray_900 : BrandColors.gray_400,
          ),
        ),
      ),
    );
  }
}
