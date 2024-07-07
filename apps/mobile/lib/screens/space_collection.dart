import 'dart:ui';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/btn.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/post_card.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/context/bottom_menu.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/graphql/__generated__/space_collection_screen_follow_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/space_collection_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/space_collection_screen_unfollow_space_mutation.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:share_plus/share_plus.dart';

@RoutePage()
class SpaceCollectionScreen extends StatefulWidget {
  const SpaceCollectionScreen({
    @PathParam() required this.id,
    this.order = GSpaceCollectionPostOrderByKind.LATEST,
    super.key,
  });

  final GSpaceCollectionPostOrderByKind order;
  final String id;

  @override
  createState() => _SpaceCollectionScreenState();
}

class _SpaceCollectionScreenState extends State<SpaceCollectionScreen> with SingleTickerProviderStateMixin {
  late AnimationController _appBarAnimationController;
  late Animation<Color?> _appBarBackgroundColorAnimation;
  late Animation<Color?> _appBarForegroundColorAnimation;

  final _thumbnailKey = GlobalKey();
  GSpaceCollectionPostOrderByKind order = GSpaceCollectionPostOrderByKind.LATEST;

  final orderToLocaleString = {
    GSpaceCollectionPostOrderByKind.LATEST: '최신화부터',
    GSpaceCollectionPostOrderByKind.OLDEST: '1화부터',
  };

  @override
  void initState() {
    super.initState();

    _appBarAnimationController = AnimationController(
      vsync: this,
      duration: Duration.zero,
    );

    _appBarBackgroundColorAnimation = ColorTween(
      end: BrandColors.gray_0,
    ).animate(_appBarAnimationController);

    _appBarForegroundColorAnimation = ColorTween(
      begin: BrandColors.gray_0,
      end: BrandColors.gray_900,
    ).animate(_appBarAnimationController);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GraphQLOperation(
        operation: GSpaceCollectionScreen_QueryReq(
          (b) => b
            ..vars.slug = widget.id
            ..vars.order = order,
        ),
        builder: (context, client, data) {
          final safeAreaHeight = MediaQuery.of(context).padding.top;

          return Scaffold(
            extendBodyBehindAppBar: true,
            appBar: Heading.animated(
              animation: _appBarAnimationController,
              builder: (context) {
                return Heading(
                  backgroundColor: _appBarBackgroundColorAnimation.value,
                  fallbackSystemUiOverlayStyle: SystemUiOverlayStyle.light,
                  bottomBorder: false,
                  leading: Row(
                    children: [
                      HeadingAutoLeading(
                        color: _appBarForegroundColorAnimation.value,
                      ),
                      const Gap(18),
                      Pressable(
                        child: Icon(
                          Tabler.home,
                          color: _appBarForegroundColorAnimation.value,
                        ),
                        onPressed: () async {
                          await context.router.navigate(const MainRouter());
                        },
                      ),
                    ],
                  ),
                  actions: [
                    Pressable(
                      child: Icon(
                        Tabler.share_2,
                        color: _appBarForegroundColorAnimation.value,
                      ),
                      onPressed: () async {
                        await Share.shareUri(
                          Uri.parse(
                            'https://withglyph.com/${data.spaceCollection.space.slug}/collections/${widget.id}',
                          ),
                        );
                      },
                    ),
                    if (data.spaceCollection.space.meAsMember != null) ...[
                      const Gap(20),
                      Pressable(
                        child: Icon(
                          Tabler.dots_vertical,
                          color: _appBarForegroundColorAnimation.value,
                        ),
                        onPressed: () async {
                          await context.showBottomMenu(
                            title: '컬렉션',
                            items: [
                              BottomMenuItem(
                                icon: Tabler.settings,
                                title: '컬렉션 관리',
                                onTap: () async {
                                  await context.router.push(
                                    WebViewRoute(
                                      title: '컬렉션 관리',
                                      path: '/${data.spaceCollection.space.slug}/dashboard/collections/${widget.id}',
                                    ),
                                  );
                                },
                              ),
                            ],
                          );
                        },
                      ),
                    ],
                  ],
                );
              },
            ),
            body: NotificationListener<ScrollUpdateNotification>(
              onNotification: (notification) {
                final thumbnailBox = _thumbnailKey.currentContext?.findRenderObject() as RenderBox?;

                if (thumbnailBox != null) {
                  final offset = thumbnailBox.localToGlobal(Offset.zero);
                  final spaceHeaderTopPosition = offset.dy - safeAreaHeight - 54;
                  final value = clampDouble((-spaceHeaderTopPosition + 50) / 50, 0, 1);

                  _appBarAnimationController.animateTo(value);
                }

                return false;
              },
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                slivers: [
                  SliverToBoxAdapter(
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        return Stack(
                          fit: StackFit.passthrough,
                          children: [
                            Positioned(
                              top: 0,
                              left: 0,
                              right: 0,
                              child: ImageFiltered(
                                imageFilter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                                child: Img(
                                  data.spaceCollection.thumbnail,
                                  height: 450,
                                  width: constraints.maxWidth,
                                ),
                              ),
                            ),
                            Positioned(
                              top: 0,
                              left: 0,
                              right: 0,
                              child: Container(
                                height: 450,
                                decoration: BoxDecoration(
                                  color: BrandColors.gray_900.withOpacity(0.24),
                                ),
                              ),
                            ),
                            Container(
                              padding: Pad(top: 30 + 54 + safeAreaHeight, horizontal: 20, bottom: 40),
                              child: Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Img(
                                      data.spaceCollection.thumbnail,
                                      width: 95,
                                      aspectRatio: 3 / 4,
                                      borderWidth: 1,
                                      borderRadius: 4,
                                    ),
                                    const Gap(20),
                                    Text(
                                      data.spaceCollection.name,
                                      style: const TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.w700,
                                        color: BrandColors.gray_0,
                                      ),
                                    ),
                                    const Gap(8),
                                    Text(
                                      data.spaceCollection.space.name,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: BrandColors.gray_0,
                                      ),
                                    ),
                                    Text(
                                      'by ${data.spaceCollection.space.members[0].profile.name}',
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                        color: BrandColors.gray_0,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: Container(
                      key: _thumbnailKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (data.spaceCollection.description != null && data.spaceCollection.description != '') ...[
                            Container(
                              padding: const Pad(horizontal: 20, vertical: 24),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    '컬렉션 설명',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: BrandColors.gray_500,
                                    ),
                                  ),
                                  const Gap(8),
                                  Text(data.spaceCollection.description ?? '', style: const TextStyle(fontSize: 13)),
                                ],
                              ),
                            ),
                            const HorizontalDivider(
                              height: 8,
                            ),
                          ],
                          Container(
                            padding: const Pad(horizontal: 20, vertical: 24),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  '스페이스',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: BrandColors.gray_500,
                                  ),
                                ),
                                const Gap(12),
                                Pressable(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Img(
                                            data.spaceCollection.space.icon,
                                            width: 38,
                                            height: 38,
                                          ),
                                          const Gap(8),
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  data.spaceCollection.space.name,
                                                  maxLines: 2,
                                                  style: const TextStyle(
                                                    fontSize: 15,
                                                    fontWeight: FontWeight.w700,
                                                  ),
                                                ),
                                                const Gap(2),
                                                Text(
                                                  'by ${data.spaceCollection.space.members[0].profile.name}',
                                                  maxLines: 2,
                                                  style: const TextStyle(
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.w500,
                                                    color: BrandColors.gray_500,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                      if (data.spaceCollection.space.description != null &&
                                          data.spaceCollection.space.description != '') ...[
                                        const Gap(10),
                                        Text(
                                          data.spaceCollection.space.description ?? '',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: BrandColors.gray_400,
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                  onPressed: () async {
                                    await context.router.push(SpaceRoute(slug: data.spaceCollection.space.slug));
                                  },
                                ),
                                if (data.spaceCollection.space.meAsMember == null) ...[
                                  const Gap(18),
                                  Btn(
                                    data.spaceCollection.space.followed ? '스페이스 구독중' : '스페이스 구독',
                                    theme: data.spaceCollection.space.followed
                                        ? BtnTheme.secondaryOutline
                                        : BtnTheme.primary,
                                    iconLeft: data.spaceCollection.space.followed ? Tabler.check : Tabler.plus,
                                    onPressed: () async {
                                      if (data.spaceCollection.space.followed) {
                                        final req = GSpaceCollectionScreen_UnfollowSpace_MutationReq(
                                          (b) => b..vars.input.spaceId = data.spaceCollection.space.id,
                                        );
                                        await client.request(req);
                                      } else {
                                        final req = GSpaceCollectionScreen_FollowSpace_MutationReq(
                                          (b) => b..vars.input.spaceId = data.spaceCollection.space.id,
                                        );
                                        await client.request(req);
                                      }
                                    },
                                  ),
                                ],
                              ],
                            ),
                          ),
                          const HorizontalDivider(
                            height: 8,
                          ),
                        ],
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: Container(
                      padding: const Pad(
                        top: 20,
                        horizontal: 20,
                        bottom: 12,
                      ),
                      decoration: const BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: BrandColors.gray_50,
                          ),
                        ),
                      ),
                      child: Row(
                        children: [
                          const Text(
                            '포스트',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: BrandColors.gray_500,
                            ),
                          ),
                          const Gap(4),
                          Expanded(
                            child: Text(
                              data.spaceCollection.count.toString(),
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: BrandColors.gray_500,
                              ),
                            ),
                          ),
                          Pressable(
                            child: Row(
                              children: [
                                Text(
                                  orderToLocaleString[order] ?? '최신화부터',
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: BrandColors.gray_500,
                                  ),
                                ),
                                const Gap(4),
                                const Icon(Tabler.caret_down_filled, size: 12, color: BrandColors.gray_500),
                              ],
                            ),
                            onPressed: () async {
                              await context.showBottomMenu(
                                title: '필터',
                                items: [
                                  BottomMenuItem(
                                    icon: Tabler.arrow_down,
                                    iconColor: BrandColors.brand_400,
                                    title: '최신화부터',
                                    color: BrandColors.gray_600,
                                    onTap: () {
                                      setState(() {
                                        order = GSpaceCollectionPostOrderByKind.LATEST;
                                      });
                                    },
                                  ),
                                  BottomMenuItem(
                                    icon: Tabler.arrow_up,
                                    iconColor: BrandColors.brand_400,
                                    title: '1화부터',
                                    color: BrandColors.gray_600,
                                    onTap: () {
                                      setState(() {
                                        order = GSpaceCollectionPostOrderByKind.OLDEST;
                                      });
                                    },
                                  ),
                                ],
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                  ...(data.spaceCollection.posts.isEmpty
                      ? [
                          SliverToBoxAdapter(
                            child: Padding(
                              padding: const Pad(top: 120, bottom: 140),
                              child: EmptyState(
                                icon: TablerBold.notes_off,
                                title: '아직 포스트가 없어요',
                                description: data.spaceCollection.space.meAsMember == null
                                    ? '스페이스를 구독하면 새로운 포스트가\n올라올 때 알림을 받을 수 있어요'
                                    : '원하는 포스트를 작성해보세요',
                              ),
                            ),
                          ),
                        ]
                      : [
                          SliverList.separated(
                            itemCount: data.spaceCollection.posts.length,
                            itemBuilder: (context, index) {
                              final post = data.spaceCollection.posts[index];

                              return PostCard(
                                post,
                                padding: const Pad(horizontal: 20, vertical: 18),
                              );
                            },
                            separatorBuilder: (context, index) {
                              return const Padding(
                                padding: Pad(horizontal: 20),
                                child: HorizontalDivider(color: BrandColors.gray_50),
                              );
                            },
                          ),
                          const SliverGap(120),
                        ]),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
