import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/button.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/post_card.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/context/bottom_menu.dart';
import 'package:glyph/context/bottom_sheet.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/post_screen_bookmark_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_create_comment_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_like_comment_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_unlike_comment_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_unbookmark_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_update_post_view_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:jiffy/jiffy.dart';
import 'package:mixpanel_flutter/mixpanel_flutter.dart';
import 'package:share_plus/share_plus.dart';

@RoutePage()
class PostScreen extends ConsumerStatefulWidget {
  const PostScreen({@PathParam() required this.permalink, super.key});

  final String permalink;

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _PostScreenState();
}

class _PostScreenState extends ConsumerState<PostScreen>
    with SingleTickerProviderStateMixin {
  final _mixpanel = GetIt.I<Mixpanel>();
  final _browser = ChromeSafariBrowser();

  final _staticFooterKey = GlobalKey();

  bool _showBars = true;
  bool _showFloatingFooter = true;
  bool _webViewLoaded = false;
  double _webViewHeight = 1;

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      appBar: Heading.empty(),
      child: GraphQLOperation(
        operation: GPostScreen_QueryReq(
          (b) => b..vars.permalink = widget.permalink,
        ),
        onDataLoaded: (context, client, data) async {
          _mixpanel.track(
            'post:view',
            properties: {
              'postId': data.post.id,
            },
          );

          final req = GPostScreen_UpdatePostView_MutationReq(
            (b) => b..vars.input.postId = data.post.id,
          );
          await client.req(req);
        },
        builder: (context, client, data) {
          final footer = Container(
            height: 54,
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                Pressable(
                  child: Row(
                    children: [
                      const Icon(
                        Tabler.mood_heart,
                        size: 20,
                        color: BrandColors.gray_800,
                      ),
                      const Gap(4),
                      Text(
                        data.post.reactionCount.toString(),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: BrandColors.gray_800,
                        ),
                      ),
                    ],
                  ),
                  onPressed: () {},
                ),
                const Gap(22),
                Pressable(
                  child: Row(
                    children: [
                      const Icon(
                        Tabler.message_circle,
                        size: 20,
                        color: BrandColors.gray_800,
                      ),
                      const Gap(4),
                      Text(
                        data.post.commentCount.toString(),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: BrandColors.gray_800,
                        ),
                      ),
                    ],
                  ),
                  onPressed: () async {
                    await context.showBottomSheet(
                      builder: (context) {
                        return _Comments(
                          permalink: widget.permalink,
                        );
                      },
                    );
                  },
                ),
                const Spacer(),
                Pressable(
                  child: const Icon(
                    Tabler.share_2,
                    size: 20,
                    color: BrandColors.gray_800,
                  ),
                  onPressed: () async {
                    await Share.shareUri(
                      Uri.parse(
                        'https://glph.to/${data.post.shortlink}',
                      ),
                    );
                  },
                ),
                const Gap(22),
                Pressable(
                  child: Icon(
                    data.post.bookmarkGroups.isEmpty
                        ? Tabler.bookmark
                        : Tabler.bookmark_filled,
                    size: 20,
                    color: data.post.bookmarkGroups.isEmpty
                        ? BrandColors.gray_800
                        : BrandColors.gray_900,
                  ),
                  onPressed: () async {
                    if (data.post.bookmarkGroups.isEmpty) {
                      final req = GPostScreen_BookmarkPost_MutationReq(
                        (b) => b..vars.input.postId = data.post.id,
                      );
                      await client.req(req);
                    } else {
                      final req = GPostScreen_UnbookmarkPost_MutationReq(
                        (b) => b
                          ..vars.input.postId = data.post.id
                          ..vars.input.bookmarkGroupId =
                              data.post.bookmarkGroups.first.id,
                      );
                      await client.req(req);
                    }
                  },
                ),
                const Gap(22),
                Pressable(
                  child: const Icon(
                    Tabler.list,
                    size: 20,
                    color: BrandColors.gray_800,
                  ),
                  onPressed: () {},
                ),
              ],
            ),
          );

          return SizedBox.expand(
            child: Stack(
              fit: StackFit.passthrough,
              children: [
                NotificationListener<ScrollNotification>(
                  onNotification: (notification) {
                    final staticFooterBox = _staticFooterKey.currentContext
                        ?.findRenderObject() as RenderBox?;

                    if (staticFooterBox != null) {
                      final staticFooterPosition =
                          staticFooterBox.localToGlobal(Offset.zero).dy;
                      final viewportHeight = MediaQuery.of(context).size.height;
                      final safeAreaBottomHeight =
                          MediaQuery.of(context).padding.bottom;
                      final floatingFooterPosition =
                          viewportHeight - 44 - safeAreaBottomHeight;

                      if (staticFooterPosition <= floatingFooterPosition) {
                        if (_showFloatingFooter) {
                          setState(() {
                            _showFloatingFooter = false;
                          });
                        }
                      } else {
                        if (!_showFloatingFooter) {
                          setState(() {
                            _showFloatingFooter = true;
                          });
                        }
                      }
                    }

                    if (notification is UserScrollNotification) {
                      if (notification.direction == ScrollDirection.forward) {
                        if (!_showBars) {
                          setState(() {
                            _showBars = true;
                          });
                        }
                      } else if (notification.direction ==
                          ScrollDirection.reverse) {
                        if (_showBars) {
                          setState(() {
                            _showBars = false;
                          });
                        }
                      } else if (notification.direction ==
                          ScrollDirection.idle) {
                        if (notification.metrics.pixels <= 0) {
                          if (!_showBars) {
                            setState(() {
                              _showBars = true;
                            });
                          }
                        }
                      }
                    }

                    return false;
                  },
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(
                      parent: BouncingScrollPhysics(),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Gap(54),
                              Text(
                                data.post.publishedRevision!.title ?? '(제목 없음)',
                                style: const TextStyle(
                                  height: 1.3,
                                  fontSize: 23,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              if (data.post.publishedRevision!.subtitle !=
                                  null) ...[
                                const Gap(4),
                                Text(
                                  data.post.publishedRevision!.subtitle!,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                              const Gap(12),
                              Row(
                                children: [
                                  Stack(
                                    children: [
                                      Img(
                                        data.post.space!.icon,
                                        width: 30,
                                        height: 30,
                                      ),
                                      Positioned(
                                        bottom: 0,
                                        right: 0,
                                        child: Transform.translate(
                                          offset: const Offset(4, 4),
                                          child: CircleAvatar(
                                            radius: 10,
                                            backgroundColor:
                                                BrandColors.gray_50,
                                            child: Padding(
                                              padding:
                                                  const EdgeInsets.all(0.5),
                                              child: Img(
                                                data.post.member!.profile
                                                    .avatar,
                                                width: 19,
                                                height: 19,
                                                borderRadius: 10,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Gap(12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          data.post.space!.name,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        Text(
                                          'by ${data.post.member!.profile.name}',
                                          overflow: TextOverflow.ellipsis,
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
                              const Gap(10),
                              Row(
                                children: [
                                  Text(
                                    Jiffy.parse(
                                      data.post.publishedAt!.value,
                                    ).format(
                                      pattern: 'yyyy.MM.dd',
                                    ),
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                      color: BrandColors.gray_400,
                                    ),
                                  ),
                                  const Gap(6),
                                  Container(
                                    width: 2,
                                    height: 2,
                                    decoration: const BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: BrandColors.gray_400,
                                    ),
                                  ),
                                  const Gap(6),
                                  const Text(
                                    '읽는 시간 7분',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500,
                                      color: BrandColors.gray_400,
                                    ),
                                  ),
                                ],
                              ),
                              const Gap(20),
                              const HorizontalDivider(),
                            ],
                          ),
                        ),
                        if (!_webViewLoaded)
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                _Skeleton(widthFactor: 1.0),
                                Gap(20),
                                _Skeleton(widthFactor: 1.0),
                                Gap(20),
                                _Skeleton(widthFactor: 1.0),
                                Gap(20),
                                _Skeleton(widthFactor: 0.4),
                              ],
                            ),
                          ),
                        SizedBox(
                          height: _webViewHeight,
                          child: WebView(
                            path: '/_webview/post-view/${widget.permalink}',
                            onJsMessage: (message, reply) async {
                              if (message['type'] == 'resize') {
                                final height =
                                    (message['height'] as num).toDouble();
                                if (height != _webViewHeight) {
                                  setState(() {
                                    _webViewHeight = height;
                                  });
                                }
                                if (!_webViewLoaded) {
                                  setState(() {
                                    _webViewLoaded = true;
                                  });
                                }
                              } else if (message['type'] == 'purchase') {
                                await context.showBottomSheet(
                                  builder: (context) {
                                    return Padding(
                                      padding: const EdgeInsets.all(20),
                                      child: Column(
                                        mainAxisSize: MainAxisSize.min,
                                        crossAxisAlignment:
                                            CrossAxisAlignment.stretch,
                                        children: [
                                          Text(
                                            '현재 보유 포인트: ${data.me!.point}P',
                                            style:
                                                const TextStyle(fontSize: 16),
                                          ),
                                          Text(
                                            '필요 포인트: ${data.post.publishedRevision!.price}P',
                                            style:
                                                const TextStyle(fontSize: 16),
                                          ),
                                          const Gap(16),
                                          if (data.me!.point <
                                              data.post.publishedRevision!
                                                  .price!)
                                            Button(
                                              '충전하기',
                                              onPressed: () async {
                                                await context.router.popAndPush(
                                                  const PointPurchaseRoute(),
                                                );
                                              },
                                            )
                                          else
                                            Button(
                                              '구매하기',
                                              onPressed: () async {
                                                await reply({
                                                  'type': 'purchase:proceed',
                                                });

                                                if (context.mounted) {
                                                  await context.router
                                                      .maybePop();
                                                }
                                              },
                                            ),
                                        ],
                                      ),
                                    );
                                  },
                                );
                              }
                            },
                            onNavigate: (controller, navigationAction) async {
                              if (navigationAction.navigationType ==
                                  NavigationType.LINK_ACTIVATED) {
                                await _browser.open(
                                  url: navigationAction.request.url,
                                  settings: ChromeSafariBrowserSettings(
                                    barCollapsingEnabled: true,
                                    dismissButtonStyle:
                                        DismissButtonStyle.CLOSE,
                                    enableUrlBarHiding: true,
                                  ),
                                );

                                return NavigationActionPolicy.CANCEL;
                              }

                              return NavigationActionPolicy.ALLOW;
                            },
                          ),
                        ),
                        const Gap(20),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                '태그',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: BrandColors.gray_400,
                                ),
                              ),
                              const Gap(12),
                              Wrap(
                                spacing: 8,
                                runSpacing: 10,
                                children: [
                                  _Tag(
                                    kind: '카테고리',
                                    name: switch (data.post.category) {
                                      GPostCategory.ORIGINAL => '오리지널',
                                      GPostCategory.FANFICTION => '2차창작',
                                      GPostCategory.NONFICTION => '비문학',
                                      GPostCategory.OTHER => '기타',
                                      _ => throw UnimplementedError(),
                                    },
                                  ),
                                  ...data.post.tags.map((item) {
                                    return _Tag(
                                      kind: switch (item.kind) {
                                        GPostTagKind.TITLE => '작품',
                                        GPostTagKind.CHARACTER => '캐릭터',
                                        GPostTagKind.COUPLING => '커플링',
                                        GPostTagKind.EXTRA => '기타',
                                        GPostTagKind.TRIGGER => '트리거',
                                        GPostTagKind.CHALLENGE => '챌린지',
                                        _ => throw UnimplementedError(),
                                      },
                                      name: item.tag.name,
                                    );
                                  }),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const Gap(24),
                        Container(
                          key: _staticFooterKey,
                          child: footer,
                        ),
                        const HorizontalDivider(),
                        const Gap(32),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                '이전 포스트 / 다음 포스트',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: BrandColors.gray_400,
                                ),
                              ),
                              const Gap(12),
                              Row(
                                children: [
                                  Expanded(
                                    child: data.post.previousPost == null
                                        ? const SizedBox.shrink()
                                        : Pressable(
                                            child: Container(
                                              padding: const EdgeInsets.all(10),
                                              decoration: BoxDecoration(
                                                color: BrandColors.gray_50,
                                                borderRadius:
                                                    BorderRadius.circular(4),
                                              ),
                                              child: Row(
                                                children: [
                                                  const Icon(
                                                    Tabler.arrow_left,
                                                    size: 16,
                                                    color: BrandColors.gray_800,
                                                  ),
                                                  const Gap(8),
                                                  Expanded(
                                                    child: Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        Text(
                                                          data
                                                                  .post
                                                                  .previousPost!
                                                                  .publishedRevision!
                                                                  .title ??
                                                              '(제목 없음)',
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                          style:
                                                              const TextStyle(
                                                            fontSize: 13,
                                                            fontWeight:
                                                                FontWeight.w700,
                                                            color: BrandColors
                                                                .gray_800,
                                                          ),
                                                        ),
                                                        const Gap(1),
                                                        Text(
                                                          data
                                                                  .post
                                                                  .previousPost!
                                                                  .publishedRevision!
                                                                  .subtitle ??
                                                              '',
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                          style:
                                                              const TextStyle(
                                                            fontSize: 11,
                                                            fontWeight:
                                                                FontWeight.w500,
                                                            color: BrandColors
                                                                .gray_500,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            onPressed: () async {
                                              await context.router.replace(
                                                PostRoute(
                                                  permalink: data.post
                                                      .previousPost!.permalink,
                                                ),
                                              );
                                            },
                                          ),
                                  ),
                                  const Gap(10),
                                  Expanded(
                                    child: data.post.nextPost == null
                                        ? const SizedBox.shrink()
                                        : Pressable(
                                            child: Container(
                                              padding: const EdgeInsets.all(10),
                                              decoration: BoxDecoration(
                                                color: BrandColors.gray_50,
                                                borderRadius:
                                                    BorderRadius.circular(4),
                                              ),
                                              child: Row(
                                                children: [
                                                  Expanded(
                                                    child: Column(
                                                      crossAxisAlignment:
                                                          CrossAxisAlignment
                                                              .start,
                                                      children: [
                                                        Text(
                                                          data
                                                                  .post
                                                                  .nextPost!
                                                                  .publishedRevision!
                                                                  .title ??
                                                              '(제목 없음)',
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                          style:
                                                              const TextStyle(
                                                            fontSize: 13,
                                                            fontWeight:
                                                                FontWeight.w700,
                                                            color: BrandColors
                                                                .gray_800,
                                                          ),
                                                        ),
                                                        const Gap(1),
                                                        Text(
                                                          data
                                                                  .post
                                                                  .nextPost!
                                                                  .publishedRevision!
                                                                  .subtitle ??
                                                              '',
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                          style:
                                                              const TextStyle(
                                                            fontSize: 11,
                                                            fontWeight:
                                                                FontWeight.w500,
                                                            color: BrandColors
                                                                .gray_500,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                  const Gap(8),
                                                  const Icon(
                                                    Tabler.arrow_right,
                                                    size: 16,
                                                    color: BrandColors.gray_800,
                                                  ),
                                                ],
                                              ),
                                            ),
                                            onPressed: () async {
                                              await context.router.replace(
                                                PostRoute(
                                                  permalink: data
                                                      .post.nextPost!.permalink,
                                                ),
                                              );
                                            },
                                          ),
                                  ),
                                ],
                              ),
                              const Gap(32),
                              const HorizontalDivider(
                                color: BrandColors.gray_50,
                              ),
                              const Gap(32),
                              const Text(
                                '스페이스',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: BrandColors.gray_400,
                                ),
                              ),
                              const Gap(12),
                              Row(
                                children: [
                                  Stack(
                                    children: [
                                      Img(
                                        data.post.space!.icon,
                                        width: 38,
                                        height: 38,
                                      ),
                                      Positioned(
                                        bottom: 0,
                                        right: 0,
                                        child: Transform.translate(
                                          offset: const Offset(4, 4),
                                          child: CircleAvatar(
                                            radius: 12,
                                            backgroundColor:
                                                BrandColors.gray_50,
                                            child: Padding(
                                              padding:
                                                  const EdgeInsets.all(0.5),
                                              child: Img(
                                                data.post.member!.profile
                                                    .avatar,
                                                width: 23,
                                                height: 23,
                                                borderRadius: 12,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Gap(12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          data.post.space!.name,
                                          overflow: TextOverflow.ellipsis,
                                          style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                        Text(
                                          'by ${data.post.member!.profile.name}',
                                          overflow: TextOverflow.ellipsis,
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
                              const Gap(10),
                              Text(
                                data.post.space!.description ?? '스페이스 설명이 없어요',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: BrandColors.gray_400,
                                ),
                              ),
                              const Gap(18),
                              Pressable(
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 16,
                                    vertical: 10,
                                  ),
                                  decoration: BoxDecoration(
                                    color: BrandColors.gray_900,
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                  child: const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Tabler.plus,
                                        size: 16,
                                        color: BrandColors.gray_0,
                                      ),
                                      Gap(3),
                                      Text(
                                        '스페이스 구독',
                                        style: TextStyle(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                          color: BrandColors.gray_0,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                onPressed: () {},
                              ),
                            ],
                          ),
                        ),
                        const Gap(32),
                        const HorizontalDivider(
                          height: 10,
                          color: BrandColors.gray_50,
                        ),
                        const Gap(22),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                '추천',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const Gap(3),
                              ...data.post.recommendedPosts.map((item) {
                                return PostCard(
                                  item,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 18,
                                  ),
                                  onPressed: () async {
                                    await context.router.replace(
                                      PostRoute(permalink: item.permalink),
                                    );
                                  },
                                );
                              }).intersperse(
                                const HorizontalDivider(
                                  color: BrandColors.gray_50,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Gap(100),
                      ],
                    ),
                  ),
                ),
                if (_showBars)
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: Heading(
                      titleOnLeft: true,
                      title: Text(
                        data.post.publishedRevision!.title ?? '(제목 없음)',
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: BrandColors.gray_800,
                        ),
                      ),
                      actions: [
                        Pressable(
                          child: const Icon(Tabler.dots_vertical),
                          onPressed: () async {
                            await context.showBottomMenu(
                              title: '포스트',
                              items: [
                                BottomMenuItem(
                                  icon: Tabler.volume_3,
                                  title: '스페이스 뮤트',
                                  color: BrandColors.red_600,
                                  onTap: () {},
                                ),
                              ],
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                if (_showBars && _showFloatingFooter)
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: DecoratedBox(
                      decoration: const BoxDecoration(
                        color: BrandColors.gray_0,
                        border: Border(
                          top: BorderSide(
                            color: BrandColors.gray_100,
                          ),
                        ),
                      ),
                      child: SafeArea(
                        child: footer,
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _Skeleton extends StatelessWidget {
  const _Skeleton({required this.widthFactor});

  final double widthFactor;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints.tightFor(height: 20),
      child: FractionallySizedBox(
        widthFactor: widthFactor,
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: BrandColors.gray_50,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag({
    required this.kind,
    required this.name,
  });

  final String kind;
  final String name;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFF3F3F3)),
        borderRadius: BorderRadius.circular(2),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            child: Text(
              kind,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: BrandColors.gray_500,
              ),
            ),
          ),
          Container(
            color: const Color(0xFFF3F3F3),
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            child: Text(
              '#$name',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: BrandColors.gray_600,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Comments extends ConsumerStatefulWidget {
  const _Comments({required this.permalink});

  final String permalink;

  @override
  createState() => _CommentsState();
}

class _CommentsState extends ConsumerState<_Comments>
    with SingleTickerProviderStateMixin {
  final _focusNode = FocusNode();
  final _textController = TextEditingController();
  final _scrollController = ScrollController();

  late AnimationController _textFieldAnimationController;
  late Animation<Color?> _textFieldFillColorAnimation;

  bool _isEmpty = true;

  @override
  void initState() {
    super.initState();

    _textFieldAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
    );

    _textFieldFillColorAnimation = ColorTween(
      begin: BrandColors.gray_0,
      end: BrandColors.gray_50,
    ).animate(_textFieldAnimationController);

    _focusNode.addListener(() {
      if (_focusNode.hasFocus) {
        _textFieldAnimationController.forward();
      } else {
        _textFieldAnimationController.reverse();
      }
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    _textFieldAnimationController.dispose();
    _scrollController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GraphQLOperation(
        operation: GPostScreen_Comnments_QueryReq(
          (b) => b..vars.permalink = widget.permalink,
        ),
        builder: (context, client, data) {
          final isCommentEnabled =
              data.post.commentQualification == GPostCommentQualification.ANY ||
                  (data.post.commentQualification ==
                          GPostCommentQualification.IDENTIFIED &&
                      data.me!.personalIdentity != null);

          Future<void> onSubmit() async {
            final value = _textController.text;
            if (value.isEmpty) {
              return;
            }

            _focusNode.unfocus();

            final req = GPostScreen_Comments_CreateComment_MutationReq(
              (b) => b
                ..vars.input.postId = data.post.id
                ..vars.input.content = value
                ..vars.input.visibility = GPostCommentVisibility.PUBLIC,
            );
            await client.req(req);
            await client.req(
              GPostScreen_Comnments_QueryReq(
                (b) => b..vars.permalink = widget.permalink,
              ),
            );

            _textController.clear();
            setState(() {
              _isEmpty = true;
            });

            await _scrollController.animateTo(
              _scrollController.position.maxScrollExtent,
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
            );
          }

          return Column(
            children: [
              Container(
                height: 54,
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: BrandColors.gray_100,
                    ),
                  ),
                ),
                child: NavigationToolbar(
                  middle: Text(
                    '댓글 ${data.post.commentCount}',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  trailing: Padding(
                    padding: const EdgeInsets.only(
                      right: 20,
                    ),
                    child: Pressable(
                      child: const Icon(Tabler.x),
                      onPressed: () async {
                        await context.router.maybePop();
                      },
                    ),
                  ),
                ),
              ),
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  itemCount: data.post.comments.length,
                  itemBuilder: (context, index) {
                    final comment = data.post.comments[index];

                    return StatefulBuilder(
                      builder: (context, setState) {
                        var showReply = false;

                        return Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 16,
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: Row(
                                      children: [
                                        Flexible(
                                          child: Text(
                                            comment.profile.name,
                                            overflow: TextOverflow.ellipsis,
                                            style: const TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w600,
                                              color: BrandColors.gray_800,
                                            ),
                                          ),
                                        ),
                                        if (comment.profile.id ==
                                            data.post.member!.profile.id) ...[
                                          const Gap(4),
                                          Container(
                                            width: 2,
                                            height: 2,
                                            decoration: const BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: BrandColors.gray_500,
                                            ),
                                          ),
                                          const Gap(4),
                                          const Text(
                                            '창작자',
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w600,
                                              color: BrandColors.brand_600,
                                            ),
                                          ),
                                          const Gap(2),
                                        ],
                                        if (comment.purchased) ...[
                                          const Gap(4),
                                          Container(
                                            width: 2,
                                            height: 2,
                                            decoration: const BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: BrandColors.gray_500,
                                            ),
                                          ),
                                          const Gap(4),
                                          const Text(
                                            '구매자',
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w600,
                                              color: BrandColors.brand_600,
                                            ),
                                          ),
                                          const Gap(2),
                                        ],
                                        const Gap(6),
                                        Text(
                                          Jiffy.parse(comment.createdAt.value)
                                              .format(
                                            pattern: 'yyyy.MM.dd HH:mm',
                                          ),
                                          style: const TextStyle(
                                            fontSize: 12,
                                            color: BrandColors.gray_400,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const Gap(12),
                                  const Icon(
                                    Tabler.dots_vertical,
                                    size: 20,
                                    color: BrandColors.gray_400,
                                  ),
                                ],
                              ),
                              const Gap(6),
                              Text(
                                comment.content,
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: BrandColors.gray_800,
                                ),
                              ),
                              const Gap(10),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(
                                    child: Row(
                                      children: [
                                        Pressable(
                                          child: Row(
                                            children: [
                                              const Icon(
                                                Tabler.message,
                                                size: 20,
                                                color: BrandColors.gray_500,
                                              ),
                                              if (comment
                                                  .children.isNotEmpty) ...[
                                                const Gap(2),
                                                Text(
                                                  comment.children.length
                                                      .toString(),
                                                  style: const TextStyle(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w500,
                                                    color: BrandColors.gray_500,
                                                  ),
                                                ),
                                              ],
                                            ],
                                          ),
                                          onPressed: () {
                                            setState(() {
                                              showReply = !showReply;
                                            });
                                          },
                                        ),
                                        const Gap(12),
                                        Container(
                                          width: 1,
                                          height: 10,
                                          color: BrandColors.gray_100,
                                        ),
                                        const Gap(12),
                                        Pressable(
                                          child: Row(
                                            children: [
                                              if (comment.liked)
                                                const Icon(
                                                  Tabler.heart_filled,
                                                  size: 20,
                                                )
                                              else
                                                const Icon(
                                                  Tabler.heart,
                                                  size: 20,
                                                  color: BrandColors.gray_500,
                                                ),
                                              if (comment.likeCount > 0) ...[
                                                const Gap(2),
                                                Text(
                                                  comment.likeCount.toString(),
                                                  style: const TextStyle(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w500,
                                                    color: BrandColors.gray_500,
                                                  ),
                                                ),
                                              ],
                                            ],
                                          ),
                                          onPressed: () async {
                                            if (comment.liked) {
                                              final req =
                                                  GPostScreen_Comments_UnlikeComment_MutationReq(
                                                (b) => b
                                                  ..vars.input.commentId =
                                                      comment.id,
                                              );
                                              await client.req(req);
                                            } else {
                                              final req =
                                                  GPostScreen_Comments_LikeComment_MutationReq(
                                                (b) => b
                                                  ..vars.input.commentId =
                                                      comment.id,
                                              );
                                              await client.req(req);
                                            }
                                          },
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (comment.likedByPostUser)
                                    Stack(
                                      children: [
                                        CircleAvatar(
                                          radius: 12,
                                          backgroundColor: BrandColors.gray_900,
                                          child: Padding(
                                            padding: const EdgeInsets.all(1),
                                            child: ClipOval(
                                              child: Img(
                                                data.post.member!.profile
                                                    .avatar,
                                                width: 24,
                                                height: 24,
                                              ),
                                            ),
                                          ),
                                        ),
                                        Positioned(
                                          right: 0,
                                          bottom: 0,
                                          child: Transform.translate(
                                            offset: const Offset(4, 4),
                                            child: const Icon(
                                              Tabler.heart_filled,
                                              size: 16,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    );
                  },
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 10,
                ),
                decoration: const BoxDecoration(
                  border: Border(
                    top: BorderSide(
                      color: BrandColors.gray_100,
                    ),
                  ),
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      data.post.space!.commentProfile?.name ?? '(알 수 없음)',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: BrandColors.gray_800,
                      ),
                    ),
                    const Gap(6),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Expanded(
                          child: AnimatedBuilder(
                            animation: _textFieldAnimationController,
                            builder: (context, child) {
                              return TextField(
                                controller: _textController,
                                focusNode: _focusNode,
                                enabled: isCommentEnabled,
                                textInputAction: TextInputAction.newline,
                                minLines: 1,
                                maxLines: 4,
                                decoration: InputDecoration(
                                  isCollapsed: true,
                                  filled: true,
                                  fillColor: isCommentEnabled
                                      ? _textFieldFillColorAnimation.value
                                      : BrandColors.gray_50,
                                  enabledBorder: OutlineInputBorder(
                                    borderSide: const BorderSide(
                                      color: BrandColors.gray_100,
                                    ),
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderSide: const BorderSide(
                                      color: BrandColors.gray_100,
                                    ),
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                  disabledBorder: OutlineInputBorder(
                                    borderSide: const BorderSide(
                                      color: BrandColors.gray_100,
                                    ),
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 12,
                                    vertical: 8,
                                  ),
                                  hintText: isCommentEnabled
                                      ? '창작자에게 응원의 글을 남겨주세요'
                                      : (data.post.commentQualification ==
                                              GPostCommentQualification
                                                  .IDENTIFIED
                                          ? '댓글을 작성하려면 본인인증이 필요해요'
                                          : '댓글을 받지 않는 포스트에요'),
                                  hintStyle: const TextStyle(
                                    color: BrandColors.gray_400,
                                  ),
                                ),
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w500,
                                ),
                                onChanged: (value) {
                                  setState(() {
                                    _isEmpty = value.isEmpty;
                                  });
                                },
                                onSubmitted: (value) async {
                                  await onSubmit();
                                },
                              );
                            },
                          ),
                        ),
                        const Gap(8),
                        Pressable(
                          onPressed: onSubmit,
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 6),
                            child: Icon(
                              Tabler.send_2,
                              color: _isEmpty
                                  ? BrandColors.gray_400
                                  : BrandColors.brand_600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
