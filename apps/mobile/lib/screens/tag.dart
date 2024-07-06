import 'dart:async';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/foundation.dart';
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
import 'package:glyph/const.dart';
import 'package:glyph/context/bottom_menu.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/tag_screen_follow_tag_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/tag_screen_mute_tag_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/tag_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/tag_screen_unfollow_tag_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/tag_screen_unmute_tag_mutation.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class TagScreen extends StatefulWidget {
  const TagScreen({
    @PathParam() required this.name,
    super.key,
  });

  final String name;

  @override
  createState() => _TagScreenState();
}

class _TagScreenState extends State<TagScreen> with SingleTickerProviderStateMixin {
  late AnimationController _appBarAnimationController;
  late Animation<Color?> _appBarBackgroundColorAnimation;
  late Animation<Color?> _appBarForegroundColorAnimation;

  final _thumbnailKey = GlobalKey();

  bool _isOverThumbnail = false;
  int _page = 1;
  bool _fetching = false;
  bool _eol = false;

  late GTagScreen_QueryReq req;

  @override
  void initState() {
    super.initState();
    req = GTagScreen_QueryReq(
      (b) => b
        ..requestId = 'TagScreen_Query'
        ..vars.name = widget.name
        ..vars.page = 1
        ..vars.take = kPaginationSize,
    );

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
        operation: req,
        builder: (context, client, data) {
          final hasThumbnail = data.tag.thumbnail != null;
          final safeAreaHeight = MediaQuery.of(context).padding.top;

          return Scaffold(
            extendBodyBehindAppBar: hasThumbnail ? true : false,
            appBar: Heading.animated(
              animation: _appBarAnimationController,
              builder: (context) {
                return Heading(
                  backgroundColor: hasThumbnail ? _appBarBackgroundColorAnimation.value : BrandColors.gray_0,
                  fallbackSystemUiOverlayStyle: hasThumbnail && !_isOverThumbnail ? SystemUiOverlayStyle.light : null,
                  bottomBorder: hasThumbnail && _isOverThumbnail,
                  leading: Row(
                    children: [
                      HeadingAutoLeading(
                        color: hasThumbnail && !_isOverThumbnail
                            ? _appBarForegroundColorAnimation.value
                            : BrandColors.gray_900,
                      ),
                      const Gap(18),
                      Pressable(
                        child: Icon(
                          Tabler.home,
                          color: hasThumbnail && !_isOverThumbnail
                              ? _appBarForegroundColorAnimation.value
                              : BrandColors.gray_900,
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
                        Tabler.dots_vertical,
                        color: hasThumbnail && !_isOverThumbnail
                            ? _appBarForegroundColorAnimation.value
                            : BrandColors.gray_900,
                      ),
                      onPressed: () async {
                        await context.showBottomMenu(
                          title: '태그',
                          items: [
                            BottomMenuItem(
                              icon: Tabler.volume_3,
                              title: data.tag.muted ? '태그 뮤트 해제' : '태그 뮤트',
                              color: BrandColors.red_600,
                              onTap: () async {
                                if (data.tag.muted) {
                                  final req = GTagScreen_UnmuteTag_MutationReq(
                                    (b) => b..vars.input.tagId = data.tag.id,
                                  );
                                  await client.req(req);
                                } else {
                                  final req = GTagScreen_MuteTag_MutationReq(
                                    (b) => b..vars.input.tagId = data.tag.id,
                                  );
                                  await client.req(req);

                                  if (context.mounted) {
                                    await context.router.maybePop();
                                  }
                                }
                              },
                            ),
                          ],
                        );
                      },
                    ),
                  ],
                );
              },
            ),
            body: NotificationListener<ScrollUpdateNotification>(
              onNotification: (notification) {
                if (notification.metrics.extentAfter <= 200) {
                  if (!_fetching && !_eol) {
                    _fetching = true;
                    final newReq = req.rebuild(
                      (b) => b
                        ..vars.page = ++_page
                        ..updateResult = (previous, result) =>
                            previous?.rebuild((b) => b..tag.posts.addAll(result?.tag.posts ?? [])),
                    );

                    unawaited(
                      client.req(newReq).then((value) {
                        _fetching = false;
                        if (data.tag.posts.length == value.tag.posts.length) {
                          _eol = true;
                        }
                      }),
                    );
                  }
                }

                final thumbnailBox = _thumbnailKey.currentContext?.findRenderObject() as RenderBox?;

                if (thumbnailBox != null) {
                  final offset = thumbnailBox.localToGlobal(Offset.zero);
                  final spaceHeaderTopPosition = offset.dy - safeAreaHeight - 54;
                  final value = clampDouble((-spaceHeaderTopPosition + 50) / 50, 0, 1);

                  _appBarAnimationController.animateTo(value);

                  setState(() {
                    _isOverThumbnail = hasThumbnail && value >= 1;
                  });
                }

                return false;
              },
              child: CustomScrollView(
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                slivers: [
                  SliverToBoxAdapter(
                    child: Column(
                      children: [
                        if (hasThumbnail)
                          LayoutBuilder(
                            builder: (context, constraints) {
                              return Stack(
                                children: [
                                  Img(
                                    data.tag.thumbnail,
                                    height: 190 + safeAreaHeight,
                                    width: constraints.maxWidth,
                                  ),
                                  Positioned.fill(
                                    child: Container(
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            BrandColors.gray_900.withOpacity(0.6),
                                            BrandColors.gray_900.withOpacity(0),
                                          ],
                                          begin: Alignment.topCenter,
                                          end: Alignment.bottomCenter,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                        Container(
                          key: _thumbnailKey,
                          padding: const Pad(all: 20),
                          decoration: const BoxDecoration(
                            border: Border(
                              bottom: BorderSide(color: BrandColors.gray_100),
                            ),
                          ),
                          child: Center(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '#${data.tag.name}',
                                  style: const TextStyle(
                                    fontSize: 23,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                const Gap(14),
                                Row(
                                  children: [
                                    const Icon(
                                      Tabler.user_filled,
                                      size: 14,
                                      color: BrandColors.gray_800,
                                    ),
                                    const Gap(4),
                                    Text(
                                      '${data.tag.followerCount}명',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        color: BrandColors.gray_800,
                                      ),
                                    ),
                                    const Gap(12),
                                    const Icon(
                                      Tabler.notes,
                                      size: 14,
                                      color: BrandColors.gray_800,
                                    ),
                                    const Gap(4),
                                    Text(
                                      '${data.tag.postCount}개',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        color: BrandColors.gray_800,
                                      ),
                                    ),
                                  ],
                                ),
                                const Gap(24),
                                Btn(
                                  data.tag.muted
                                      ? '뮤트됨'
                                      : data.tag.followed
                                          ? '태그 구독중'
                                          : '태그 구독',
                                  iconLeft: data.tag.muted
                                      ? Tabler.volume_3
                                      : data.tag.followed
                                          ? Tabler.check
                                          : Tabler.plus,
                                  theme: data.tag.followed ? BtnTheme.secondaryOutline : BtnTheme.primary,
                                  enabled: !data.tag.muted,
                                  onPressed: () async {
                                    if (data.tag.followed) {
                                      final req = GTagScreen_UnfollowTag_MutationReq(
                                        (b) => b..vars.input.tagId = data.tag.id,
                                      );
                                      await client.req(req);
                                    } else {
                                      final req = GTagScreen_FollowTag_MutationReq(
                                        (b) => b..vars.input.tagId = data.tag.id,
                                      );
                                      await client.req(req);
                                    }
                                  },
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  ...(data.tag.muted
                      ? [
                          const SliverToBoxAdapter(
                            child: Column(
                              children: [
                                Gap(78),
                                Text(
                                  '해당 태그가 뮤트되어 있어 포스트를 볼 수 없습니다.\n포스트를 보시려면 뮤트 설정을 해제해주세요.',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: BrandColors.gray_400,
                                  ),
                                ),
                                Gap(78),
                              ],
                            ),
                          ),
                        ]
                      : [
                          ...(data.tag.posts.isEmpty
                              ? [
                                  const SliverFillRemaining(
                                    hasScrollBody: false,
                                    child: EmptyState(
                                      icon: TablerBold.notes_off,
                                      title: '해당 태그에 대한 포스트가 없어요',
                                      description: '태그에 대한 포스트가\n삭제되었거나 비공개되었어요',
                                    ),
                                  ),
                                ]
                              : [
                                  SliverList.separated(
                                    itemCount: data.tag.posts.length,
                                    itemBuilder: (context, index) {
                                      final post = data.tag.posts[index];

                                      return PostCard(
                                        post,
                                        padding: const Pad(horizontal: 20, vertical: 18),
                                      );
                                    },
                                    separatorBuilder: (context, index) {
                                      return const Padding(
                                        padding: Pad(horizontal: 20),
                                        child: HorizontalDivider(
                                          color: BrandColors.gray_50,
                                        ),
                                      );
                                    },
                                  ),
                                  const SliverGap(60),
                                ]),
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
