import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/Img.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/context/bottom_menu.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/space_screen_create_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/space_screen_follow_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/space_screen_mute_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/space_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/space_screen_unfollow_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/space_screen_unmute_space_mutation.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:share_plus/share_plus.dart';

@RoutePage()
class SpaceScreen extends StatefulWidget {
  const SpaceScreen({required this.slug, super.key});

  final String slug;

  @override
  createState() => _SpaceScreenState();
}

class _SpaceScreenState extends State<SpaceScreen> with SingleTickerProviderStateMixin {
  late AnimationController _appBarAnimationController;
  late Animation<Color?> _appBarBackgroundColorAnimation;

  @override
  void initState() {
    super.initState();

    _appBarAnimationController = AnimationController(
      vsync: this,
      duration: Duration.zero,
    );

    _appBarBackgroundColorAnimation = ColorTween(
      // ignore: avoid_redundant_argument_values
      begin: null,
      end: BrandColors.gray_0,
    ).animate(_appBarAnimationController);
  }

  @override
  Widget build(BuildContext context) {
    return AutoTabsRouter.tabBar(
      routes: [
        SpacePostsRoute(slug: widget.slug),
        SpaceCollectionsRoute(slug: widget.slug),
      ],
      builder: (context, child, tabController) {
        return GraphQLOperation(
          operation: GSpaceScreen_QueryReq((b) => b..vars.slug = widget.slug),
          builder: (context, client, data) {
            final safeAreaHeight = MediaQuery.of(context).padding.top;

            return Scaffold(
              extendBodyBehindAppBar: true,
              appBar: Heading(
                bottomBorder: false,
                backgroundColor: _appBarBackgroundColorAnimation.value,
                leading: Row(
                  children: [
                    const HeadingAutoLeading(),
                    const Gap(18),
                    Pressable(
                      child: const Icon(
                        Tabler.home,
                      ),
                      onPressed: () {
                        context.router.popUntilRoot();
                      },
                    ),
                  ],
                ),
                actions: [
                  Pressable(
                    child: const Icon(Tabler.share_2),
                    onPressed: () async {
                      await Share.shareUri(
                        Uri.parse(
                          'https://withglyph.com/${data.space.slug}',
                        ),
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
                              color: data.space.muted ? BrandColors.gray_900 : BrandColors.red_600,
                              onTap: () async {
                                if (data.space.muted) {
                                  final req = GSpaceScreen_UnmuteSpace_MutationReq(
                                    (b) => b..vars.input.spaceId = data.space.id,
                                  );
                                  await client.req(req);
                                } else {
                                  final req = GSpaceScreen_MuteSpace_MutationReq(
                                    (b) => b..vars.input.spaceId = data.space.id,
                                  );
                                  await client.req(req);
                                }
                              },
                            ),
                          if (data.space.meAsMember != null)
                            BottomMenuItem(
                              icon: Tabler.settings,
                              title: '스페이스 관리',
                              iconColor: BrandColors.gray_400,
                              onTap: () async {
                                await context.router.push(
                                  WebViewRoute(
                                    title: '스페이스 설정',
                                    path: '/${data.space.slug}/dashboard/settings',
                                  ),
                                );
                              },
                            ),
                        ],
                      );
                    },
                  ),
                ],
              ),
              body: NestedScrollView(
                headerSliverBuilder: (context, innerBoxIsScrolled) {
                  return [
                    SliverAppBar(
                      automaticallyImplyLeading: false,
                      pinned: true,
                      expandedHeight: 400 + safeAreaHeight,
                      forceElevated: innerBoxIsScrolled,
                      flexibleSpace: FlexibleSpaceBar(
                        background: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Stack(
                              clipBehavior: Clip.none,
                              children: [
                                Container(
                                  height: 142 + safeAreaHeight,
                                  padding: EdgeInsets.only(top: safeAreaHeight),
                                  color: BrandColors.gray_50,
                                ),
                                Positioned(
                                  bottom: -40,
                                  left: 0,
                                  child: Transform.translate(
                                    offset: const Offset(20, 0),
                                    child: Stack(
                                      children: [
                                        // ignore: use_decorated_box
                                        Container(
                                          decoration: BoxDecoration(
                                            border: Border.all(
                                              color: BrandColors.gray_50,
                                            ),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Img(
                                            data.space.icon,
                                            height: 80,
                                            aspectRatio: 1 / 1,
                                            borderRadius: 6,
                                          ),
                                        ),
                                        Positioned(
                                          bottom: 0,
                                          right: 0,
                                          child: Transform.translate(
                                            offset: const Offset(8, 8),
                                            // ignore: use_decorated_box
                                            child: Container(
                                              decoration: BoxDecoration(
                                                border: Border.all(
                                                  color: BrandColors.gray_50,
                                                ),
                                                borderRadius: BorderRadius.circular(20),
                                              ),
                                              child: Img(
                                                data.space.members[0].profile.avatar,
                                                height: 40,
                                                aspectRatio: 1 / 1,
                                                borderRadius: 20,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 20),
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
                                  Text(
                                    'by ${data.space.members[0].profile.name}',
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                  const Gap(16),
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
                                  const Gap(16),
                                  Pressable(
                                    child: DecoratedBox(
                                      decoration: BoxDecoration(
                                        color: data.space.followed ? BrandColors.gray_0 : BrandColors.gray_900,
                                        border: Border.all(
                                          color: data.space.followed ? BrandColors.gray_150 : BrandColors.gray_900,
                                        ),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Padding(
                                        padding: const EdgeInsets.symmetric(vertical: 11),
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Icon(
                                              data.space.followed ? Tabler.check : Tabler.plus,
                                              size: 18,
                                              color: data.space.followed ? BrandColors.gray_600 : BrandColors.gray_0,
                                            ),
                                            const Gap(3),
                                            Text(
                                              data.space.followed
                                                  ? '스페이스 구독중'
                                                  : data.space.meAsMember != null
                                                      ? '포스트 작성'
                                                      : '스페이스 구독',
                                              style: TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w700,
                                                color: data.space.followed ? BrandColors.gray_600 : BrandColors.gray_0,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                    onPressed: () async {
                                      if (data.space.meAsMember == null) {
                                        if (data.space.followed) {
                                          final req = GSpaceScreen_UnfollowSpace_MutationReq(
                                            (b) => b..vars.input.spaceId = data.space.id,
                                          );
                                          await client.req(req);
                                        } else {
                                          final req = GSpaceScreen_FollowSpace_MutationReq(
                                            (b) => b..vars.input.spaceId = data.space.id,
                                          );
                                          await client.req(req);
                                        }
                                      } else {
                                        final req = GSpaceScreen_CreatePost_MutationReq();
                                        final resp = await client.req(req);

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
                            if (data.space.description != null || data.space.meAsMember != null) ...[
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
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
                                        data.space.description ?? '아직 스페이스를 소개하는 글이 작성되지 않았어요\n스페이스 관리에서 소개글을 작성해주세요',
                                        style: TextStyle(
                                          fontSize: 13,
                                          color: data.space.description != null && data.space.meAsMember != null
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
                      bottom: PreferredSize(
                        preferredSize: const Size.fromHeight(0),
                        child: ColoredBox(
                          color: BrandColors.gray_0,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 20),
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
                        ),
                      ),
                    ),
                  ];
                },
                body: Expanded(child: child),
              ),
            );
          },
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
    return Pressable(
      onPressed: onTap,
      child: Container(
        padding: const EdgeInsets.fromLTRB(15, 10, 15, 7),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              width: 2,
              color: isActive ? BrandColors.gray_900 : BrandColors.gray_0,
            ),
          ),
        ),
        child: Text(
          title,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
            color: isActive ? BrandColors.gray_900 : BrandColors.gray_400,
          ),
        ),
      ),
    );
  }
}
