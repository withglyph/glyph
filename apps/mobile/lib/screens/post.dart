import 'dart:async';
import 'dart:math';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/btn.dart';
import 'package:glyph/components/dot.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/post_card.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/context/bottom_menu.dart';
import 'package:glyph/context/bottom_sheet.dart';
import 'package:glyph/context/floating_bottom_sheet.dart';
import 'package:glyph/context/modal.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/extensions/build_context.dart';
import 'package:glyph/extensions/int.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/post_screen_bookmark_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_collection_post_list_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_create_comment_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_delete_comment_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_like_comment_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_query.data.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_unlike_comment_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_space_post_list_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_unbookmark_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_update_post_view_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/graphql/fragments/__generated__/comment_postcomment.data.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';
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

class _PostScreenState extends ConsumerState<PostScreen> with SingleTickerProviderStateMixin {
  final _mixpanel = GetIt.I<Mixpanel>();
  final _browser = ChromeSafariBrowser();

  final _staticFooterKey = GlobalKey();
  final _thumbnailKey = GlobalKey();

  bool _showBars = true;
  bool _showFloatingFooter = false;
  bool _webViewLoaded = false;
  double _webViewHeight = 1;

  bool _isOverThumbnail = true;
  double _thumbnailScale = 1;

  Timer? _floatingFooterVisibilityTimer;

  @override
  void initState() {
    super.initState();

    _floatingFooterVisibilityTimer = Timer.periodic(
      const Duration(milliseconds: 100),
      (_) {
        _updateFloatingFooterVisibility();
      },
    );
  }

  @override
  void dispose() {
    _floatingFooterVisibilityTimer?.cancel();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GraphQLOperation(
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
          final hasThumbnail = data.post.thumbnail != null;
          final safeAreaTopHeight = MediaQuery.of(context).padding.top;

          final heading = Heading(
            backgroundColor: hasThumbnail && _isOverThumbnail ? null : BrandColors.gray_0,
            fallbackSystemUiOverlayStyle: hasThumbnail && _isOverThumbnail ? SystemUiOverlayStyle.light : null,
            bottomBorder: !(hasThumbnail && _isOverThumbnail),
            leading: Row(
              children: [
                HeadingAutoLeading(
                  color: hasThumbnail && _isOverThumbnail ? BrandColors.gray_0 : BrandColors.gray_900,
                ),
                const Gap(16),
                Pressable(
                  child: Icon(
                    Tabler.home,
                    color: hasThumbnail && _isOverThumbnail ? BrandColors.gray_0 : BrandColors.gray_900,
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
                  color: hasThumbnail && _isOverThumbnail ? BrandColors.gray_0 : BrandColors.gray_900,
                ),
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
          );

          final footer = Box(
            height: 54,
            padding: const Pad(horizontal: 20),
            child: Row(
              children: [
                Pressable(
                  child: Row(
                    children: [
                      const Icon(Tabler.mood_heart),
                      const Gap(4),
                      Text(
                        data.post.reactionCount.toString(),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: BrandColors.gray_500,
                        ),
                      ),
                    ],
                  ),
                  onPressed: () {},
                ),
                const Gap(20),
                Pressable(
                  child: Row(
                    children: [
                      const Icon(Tabler.message_circle),
                      const Gap(4),
                      Text(
                        data.post.commentCount.toString(),
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: BrandColors.gray_500,
                        ),
                      ),
                    ],
                  ),
                  onPressed: () async {
                    await context.showModal(
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
                  child: const Icon(Tabler.share_2),
                  onPressed: () async {
                    await Share.shareUri(
                      Uri.parse(
                        'https://glph.to/${data.post.shortlink}',
                      ),
                    );
                  },
                ),
                const Gap(20),
                Pressable(
                  child: Icon(data.post.bookmarkGroups.isEmpty ? Tabler.bookmark : Tabler.bookmark_filled),
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
                          ..vars.input.bookmarkGroupId = data.post.bookmarkGroups.first.id,
                      );
                      await client.req(req);
                    }
                  },
                ),
                const Gap(20),
                Pressable(
                  child: const Icon(Tabler.list),
                  onPressed: () async {
                    if (data.post.collection != null) {
                      await context.showFloatingBottomSheet(
                        title: '컬렉션 목차',
                        builder: (context) {
                          return _CollectionPostList(permalink: widget.permalink);
                        },
                      );
                    } else {
                      await context.showFloatingBottomSheet(
                        title: '스페이스 목차',
                        builder: (context) {
                          return _SpacePostList(permalink: widget.permalink);
                        },
                      );
                    }
                  },
                ),
              ],
            ),
          );

          return Stack(
            fit: StackFit.passthrough,
            children: [
              NotificationListener<ScrollNotification>(
                onNotification: (notification) {
                  _updateFloatingFooterVisibility();

                  final thumbnailBox = _thumbnailKey.currentContext?.findRenderObject() as RenderBox?;
                  if (thumbnailBox != null) {
                    final pos = thumbnailBox.localToGlobal(Offset.zero).dy + thumbnailBox.size.height;
                    final threshhold = safeAreaTopHeight + 54;

                    final isOverThumbnail = pos >= threshhold;
                    if (isOverThumbnail != _isOverThumbnail) {
                      setState(() {
                        _isOverThumbnail = isOverThumbnail;
                      });
                    }

                    final overscrollHeight = -notification.metrics.pixels;
                    final scale = 1.0 + max(0.0, overscrollHeight / thumbnailBox.size.height);
                    if (scale != _thumbnailScale) {
                      setState(() {
                        _thumbnailScale = scale;
                      });
                    }
                  }

                  if (notification.metrics.pixels <= 0) {
                    if (!_showBars) {
                      setState(() {
                        _showBars = true;
                      });
                    }
                  }

                  if (notification is UserScrollNotification) {
                    if (notification.direction == ScrollDirection.forward) {
                      if (!_showBars) {
                        setState(() {
                          _showBars = true;
                        });
                      }
                    } else if (notification.direction == ScrollDirection.reverse) {
                      if (_showBars) {
                        setState(() {
                          _showBars = false;
                        });
                      }
                    } else if (notification.direction == ScrollDirection.idle) {
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
                      if (data.post.thumbnail != null)
                        Transform.scale(
                          key: _thumbnailKey,
                          scale: _thumbnailScale,
                          alignment: Alignment.bottomCenter,
                          child: Stack(
                            children: [
                              Img(
                                data.post.thumbnail,
                                width: MediaQuery.of(context).size.width,
                                aspectRatio: 16 / 10,
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
                          ),
                        ),
                      Padding(
                        padding: const Pad(all: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (data.post.thumbnail == null) Gap(safeAreaTopHeight + 54),
                            Text(
                              data.post.publishedRevision!.title ?? '(제목 없음)',
                              style: const TextStyle(
                                height: 1.3,
                                fontSize: 23,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            if (data.post.publishedRevision!.subtitle != null) ...[
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
                            Pressable(
                              child: Row(
                                children: [
                                  Stack(
                                    clipBehavior: Clip.none,
                                    children: [
                                      Img(
                                        data.post.space!.icon,
                                        width: 30,
                                        height: 30,
                                        borderWidth: 1,
                                      ),
                                      Positioned(
                                        bottom: -4,
                                        right: -4,
                                        child: Img(
                                          data.post.member!.profile.avatar,
                                          width: 20,
                                          height: 20,
                                          borderWidth: 1,
                                          borderRadius: 10,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Gap(12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
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
                              onPressed: () async {
                                await context.router.push(
                                  SpaceRoute(slug: data.post.space!.slug),
                                );
                              },
                            ),
                            const Gap(10),
                            Row(
                              children: [
                                Text(
                                  Jiffy.parse(data.post.publishedAt!.value, isUtc: true).format(pattern: 'yyyy.MM.dd'),
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                    color: BrandColors.gray_400,
                                  ),
                                ),
                                const Gap(6),
                                const Dot(),
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
                          padding: Pad(horizontal: 20),
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
                          readOnly: true,
                          onJsMessage: (message, reply) async {
                            if (message['type'] == 'resize') {
                              final height = (message['height'] as num).toDouble();
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
                                title: '포스트 구매',
                                builder: (context) {
                                  final purchasable = data.me!.point >= data.post.publishedRevision!.price!;

                                  return Padding(
                                    padding: const Pad(horizontal: 20),
                                    child: Column(
                                      children: [
                                        Padding(
                                          padding: const Pad(vertical: 20),
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.stretch,
                                            children: [
                                              Row(
                                                children: [
                                                  const Icon(Tabler.notes, size: 16),
                                                  const Gap(3),
                                                  Text(
                                                    data.post.publishedRevision!.title ?? '(제목 없음)',
                                                    overflow: TextOverflow.ellipsis,
                                                    style: const TextStyle(
                                                      color: BrandColors.gray_500,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                              const Gap(4),
                                              Text(
                                                '${data.post.publishedRevision!.price?.comma}P',
                                                style: const TextStyle(
                                                  fontSize: 18,
                                                  fontWeight: FontWeight.w800,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        const HorizontalDivider(),
                                        const Gap(8),
                                        Padding(
                                          padding: const Pad(vertical: 12),
                                          child: Row(
                                            children: [
                                              const Text(
                                                '보유 포인트',
                                                style: TextStyle(
                                                  fontWeight: FontWeight.w600,
                                                  color: BrandColors.gray_900,
                                                ),
                                              ),
                                              const Spacer(),
                                              Text(
                                                '${data.me!.point.comma}P',
                                                style: const TextStyle(
                                                  fontWeight: FontWeight.w800,
                                                  color: BrandColors.gray_400,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        Padding(
                                          padding: const Pad(vertical: 12),
                                          child: Row(
                                            children: [
                                              const Text(
                                                '사용할 포인트',
                                                style: TextStyle(
                                                  fontWeight: FontWeight.w600,
                                                  color: BrandColors.gray_900,
                                                ),
                                              ),
                                              const Spacer(),
                                              Text(
                                                '${data.post.publishedRevision!.price!.comma}P',
                                                style: TextStyle(
                                                  fontWeight: FontWeight.w800,
                                                  color: (purchasable ? BrandColors.brand_400 : BrandColors.gray_400),
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        if (purchasable) ...[
                                          const Gap(24),
                                          Btn(
                                            '구매하기',
                                            theme: BtnTheme.accent,
                                            onPressed: () async {
                                              await reply({
                                                'type': 'purchase:proceed',
                                              });

                                              if (context.mounted) {
                                                await context.router.maybePop();
                                              }
                                            },
                                          ),
                                        ] else ...[
                                          Padding(
                                            padding: const Pad(vertical: 12),
                                            child: Row(
                                              children: [
                                                const Text(
                                                  '필요한 포인트',
                                                  style: TextStyle(
                                                    fontWeight: FontWeight.w600,
                                                    color: BrandColors.brand_400,
                                                  ),
                                                ),
                                                const Spacer(),
                                                Text(
                                                  '${(data.post.publishedRevision!.price! - data.me!.point).comma}P',
                                                  style: const TextStyle(
                                                    fontWeight: FontWeight.w800,
                                                    color: BrandColors.brand_400,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                          const Gap(8),
                                          const DecoratedBox(
                                            decoration: BoxDecoration(
                                              color: BrandColors.gray_50,
                                              borderRadius: BorderRadius.all(
                                                Radius.circular(4),
                                              ),
                                            ),
                                            child: Padding(
                                              padding: Pad(all: 10),
                                              child: Row(
                                                children: [
                                                  Icon(
                                                    Tabler.coin_filled,
                                                    size: 16,
                                                    color: Color(0xFFFCC04B),
                                                  ),
                                                  Gap(4),
                                                  Text(
                                                    '해당 포스트를 구매하려면 포인트가 필요해요',
                                                    style: TextStyle(
                                                      color: BrandColors.gray_800,
                                                      fontSize: 12,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                          const Gap(24),
                                          Btn(
                                            '충전하기',
                                            onPressed: () async {
                                              await context.popWaitAndPush(const PointPurchaseRoute());
                                            },
                                          ),
                                        ],
                                      ],
                                    ),
                                  );
                                },
                              );
                            }
                          },
                          onNavigate: (controller, navigationAction) async {
                            if (navigationAction.navigationType == NavigationType.LINK_ACTIVATED) {
                              await _browser.open(
                                url: navigationAction.request.url,
                                settings: ChromeSafariBrowserSettings(
                                  barCollapsingEnabled: true,
                                  dismissButtonStyle: DismissButtonStyle.CLOSE,
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
                        padding: const Pad(horizontal: 20),
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
                      Box(
                        key: _staticFooterKey,
                        child: footer,
                      ),
                      const HorizontalDivider(),
                      const Gap(32),
                      Padding(
                        padding: const Pad(horizontal: 20),
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
                            IntrinsicHeight(
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Expanded(
                                    child: data.post.previousPost == null
                                        ? Container(
                                            padding: const Pad(all: 10, left: 2),
                                            decoration: BoxDecoration(
                                              border: Border.all(color: BrandColors.gray_50),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: const Row(
                                              children: [
                                                Icon(Tabler.arrow_left, size: 16, color: BrandColors.gray_300),
                                                Gap(8),
                                                Text(
                                                  '이전 포스트가 없습니다',
                                                  style: TextStyle(
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.w700,
                                                    color: BrandColors.gray_300,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          )
                                        : Pressable(
                                            child: Container(
                                              padding: const Pad(all: 10, left: 2),
                                              decoration: BoxDecoration(
                                                color: BrandColors.gray_50,
                                                borderRadius: BorderRadius.circular(4),
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
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      children: [
                                                        Text(
                                                          data.post.previousPost!.publishedRevision!.title ?? '(제목 없음)',
                                                          overflow: TextOverflow.ellipsis,
                                                          style: const TextStyle(
                                                            fontSize: 13,
                                                            fontWeight: FontWeight.w700,
                                                            color: BrandColors.gray_800,
                                                          ),
                                                        ),
                                                        const Gap(1),
                                                        Text(
                                                          data.post.previousPost!.publishedRevision!.subtitle ?? '',
                                                          overflow: TextOverflow.ellipsis,
                                                          style: const TextStyle(
                                                            fontSize: 11,
                                                            fontWeight: FontWeight.w500,
                                                            color: BrandColors.gray_500,
                                                          ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                            onPressed: () async {
                                              await context.router.push(
                                                PostRoute(
                                                  permalink: data.post.previousPost!.permalink,
                                                ),
                                              );
                                            },
                                          ),
                                  ),
                                  const Gap(10),
                                  Expanded(
                                    child: data.post.nextPost == null
                                        ? Container(
                                            padding: const Pad(all: 10, left: 2),
                                            decoration: BoxDecoration(
                                              border: Border.all(color: BrandColors.gray_50),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: const Row(
                                              children: [
                                                Text(
                                                  '다음 포스트가 없습니다',
                                                  style: TextStyle(
                                                    fontSize: 13,
                                                    fontWeight: FontWeight.w700,
                                                    color: BrandColors.gray_300,
                                                  ),
                                                ),
                                                Gap(8),
                                                Icon(Tabler.arrow_right, size: 16, color: BrandColors.gray_300),
                                              ],
                                            ),
                                          )
                                        : Pressable(
                                            child: Container(
                                              padding: const Pad(all: 10, left: 2),
                                              decoration: BoxDecoration(
                                                color: BrandColors.gray_50,
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: Row(
                                                children: [
                                                  Expanded(
                                                    child: Column(
                                                      crossAxisAlignment: CrossAxisAlignment.start,
                                                      children: [
                                                        Text(
                                                          data.post.nextPost!.publishedRevision!.title ?? '(제목 없음)',
                                                          overflow: TextOverflow.ellipsis,
                                                          style: const TextStyle(
                                                            fontSize: 13,
                                                            fontWeight: FontWeight.w700,
                                                            color: BrandColors.gray_800,
                                                          ),
                                                        ),
                                                        const Gap(1),
                                                        Text(
                                                          data.post.nextPost!.publishedRevision!.subtitle ?? '',
                                                          overflow: TextOverflow.ellipsis,
                                                          style: const TextStyle(
                                                            fontSize: 11,
                                                            fontWeight: FontWeight.w500,
                                                            color: BrandColors.gray_500,
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
                                              await context.router.push(
                                                PostRoute(
                                                  permalink: data.post.nextPost!.permalink,
                                                ),
                                              );
                                            },
                                          ),
                                  ),
                                ],
                              ),
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
                                      borderWidth: 1,
                                    ),
                                    Positioned(
                                      bottom: 0,
                                      right: 0,
                                      child: Transform.translate(
                                        offset: const Offset(4, 4),
                                        child: Img(
                                          data.post.member!.profile.avatar,
                                          width: 24,
                                          height: 24,
                                          borderWidth: 1,
                                          borderRadius: 12,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const Gap(12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
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
                            if (data.post.space!.description != null) ...[
                              const Gap(10),
                              Text(
                                data.post.space!.description!,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: BrandColors.gray_400,
                                ),
                              ),
                            ],
                            const Gap(18),
                            Pressable(
                              child: Container(
                                padding: const Pad(horizontal: 16, vertical: 10),
                                decoration: BoxDecoration(
                                  color: BrandColors.gray_900,
                                  borderRadius: BorderRadius.circular(2),
                                ),
                                child: const Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(Tabler.plus, size: 16, color: BrandColors.gray_0),
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
                      const HorizontalDivider(height: 10, color: BrandColors.gray_50),
                      const Gap(22),
                      Padding(
                        padding: const Pad(horizontal: 20),
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
                                padding: const Pad(vertical: 18),
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
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: _showBars || (hasThumbnail && _isOverThumbnail)
                    ? heading
                    : Heading.empty(systemUiOverlayStyle: SystemUiOverlayStyle.dark),
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
                      top: false,
                      child: footer,
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  void _updateFloatingFooterVisibility() {
    if (!mounted) {
      return;
    }

    final staticFooterBox = _staticFooterKey.currentContext?.findRenderObject() as RenderBox?;

    if (staticFooterBox != null) {
      final staticFooterPosition = staticFooterBox.localToGlobal(Offset.zero).dy;
      final viewportHeight = MediaQuery.of(context).size.height;
      final safeAreaBottomHeight = MediaQuery.of(context).padding.bottom;
      final floatingFooterPosition = viewportHeight - 54 - safeAreaBottomHeight;

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
            padding: const Pad(horizontal: 6, vertical: 2),
            child: Text(
              kind,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: BrandColors.gray_500,
              ),
            ),
          ),
          Flexible(
            child: Box(
              color: const Color(0xFFF3F3F3),
              padding: const Pad(horizontal: 6, vertical: 2),
              child: Text(
                '#$name',
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: BrandColors.gray_600,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SpacePostList extends StatefulWidget {
  const _SpacePostList({required this.permalink});

  final String permalink;

  @override
  createState() => _SpacePostListState();
}

class _SpacePostListState extends State<_SpacePostList> {
  final _controller = ScrollController();

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: GPostScreen_SpacePostList_QueryReq(
        (b) => b..vars.permalink = widget.permalink,
      ),
      onDataLoaded: (context, client, data) {
        if (data.post.space!.posts.isEmpty) {
          return;
        }

        final thisIndex = data.post.space!.posts.indexWhere((post) => post.id == data.post.id);
        final itemHeight = _controller.position.extentTotal / data.post.space!.posts.length;
        final fraction = thisIndex / data.post.space!.posts.length;
        final scrollPosition =
            _controller.position.extentTotal * fraction - (_controller.position.extentInside / 2) + (itemHeight / 2);

        _controller.jumpTo(scrollPosition.clamp(0, _controller.position.maxScrollExtent));
      },
      builder: (context, client, data) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const Pad(top: 8, bottom: 16),
              child: Row(
                children: [
                  Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Img(
                        data.post.space!.icon,
                        width: 38,
                        height: 38,
                        borderWidth: 1,
                      ),
                      Positioned(
                        bottom: -4,
                        right: -4,
                        child: Img(
                          data.post.member!.profile.avatar,
                          width: 24,
                          height: 24,
                          borderWidth: 1,
                          borderRadius: 12,
                        ),
                      ),
                    ],
                  ),
                  const Gap(16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          data.post.space!.name,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: BrandColors.gray_800,
                          ),
                        ),
                        if (data.post.space!.description != null && data.post.space!.description!.isNotEmpty)
                          Text(
                            data.post.space!.description!,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 12,
                              color: BrandColors.gray_800.withOpacity(0.8),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Transform.scale(scaleX: 2, child: const HorizontalDivider()),
            Flexible(
              child: ListView.builder(
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                controller: _controller,
                shrinkWrap: true,
                itemCount: data.post.space!.posts.isEmpty ? 1 : data.post.space!.posts.length,
                itemBuilder: (context, index) {
                  final dynamic post = data.post.space!.posts.isEmpty ? data.post : data.post.space!.posts[index];

                  return Pressable(
                    child: Padding(
                      padding: const Pad(vertical: 15),
                      child: Row(
                        children: [
                          Expanded(
                            child: Text(
                              post.publishedRevision!.title ?? '(제목 없음)',
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: post.id == data.post.id ? BrandColors.gray_800 : BrandColors.gray_500,
                              ),
                            ),
                          ),
                          const Gap(18),
                          if (post.id == data.post.id)
                            const Icon(TablerBold.check, size: 20, color: BrandColors.brand_400)
                          else
                            const Gap(20),
                        ],
                      ),
                    ),
                    onPressed: () async {
                      if (post.id != data.post.id) {
                        await context.popWaitAndPush(PostRoute(permalink: post.permalink));
                      }
                    },
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}

class _CollectionPostList extends StatefulWidget {
  const _CollectionPostList({required this.permalink});

  final String permalink;

  @override
  createState() => _CollectionPostListState();
}

class _CollectionPostListState extends State<_CollectionPostList> {
  final _controller = ScrollController();

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: GPostScreen_CollectionPostList_QueryReq(
        (b) => b..vars.permalink = widget.permalink,
      ),
      onDataLoaded: (context, client, data) {
        if (data.post.collection?.posts.isEmpty ?? true) {
          return;
        }

        final thisIndex = data.post.collection!.posts.indexWhere((post) => post.id == data.post.id);
        final itemHeight = _controller.position.extentTotal / data.post.collection!.posts.length;
        final fraction = thisIndex / data.post.collection!.posts.length;
        final scrollPosition =
            _controller.position.extentTotal * fraction - (_controller.position.extentInside / 2) + (itemHeight / 2);

        _controller.jumpTo(scrollPosition.clamp(0, _controller.position.maxScrollExtent));
      },
      builder: (context, client, data) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const Pad(top: 8, bottom: 16),
              child: Row(
                children: [
                  Img(
                    data.post.collection!.thumbnail,
                    width: 43,
                    aspectRatio: 3 / 4,
                  ),
                  const Gap(12),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          data.post.collection!.name,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: BrandColors.gray_800,
                          ),
                        ),
                        if (data.post.collection!.description?.isNotEmpty ?? false)
                          Text(
                            data.post.collection!.description!,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 12,
                              color: BrandColors.gray_800.withOpacity(0.8),
                            ),
                          ),
                        const Gap(4),
                        Text(
                          '총 ${data.post.collection!.posts.length}화',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w400,
                            color: BrandColors.gray_400.withOpacity(0.8),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Transform.scale(scaleX: 2, child: const HorizontalDivider()),
            Flexible(
              child: ListView.builder(
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                controller: _controller,
                shrinkWrap: true,
                itemCount: data.post.collection!.posts.isEmpty ? 1 : data.post.collection!.posts.length,
                itemBuilder: (context, index) {
                  final dynamic post =
                      data.post.collection!.posts.isEmpty ? data.post : data.post.collection!.posts[index];

                  return Pressable(
                    child: Padding(
                      padding: const Pad(vertical: 15),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 41,
                            child: Text(
                              '${index + 1}화',
                              textAlign: TextAlign.start,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: BrandColors.gray_400,
                              ),
                            ),
                          ),
                          const Padding(
                            padding: Pad(horizontal: 8),
                            child: Box(width: 1, height: 12, color: BrandColors.gray_200),
                          ),
                          Expanded(
                            child: Text(
                              post.publishedRevision!.title ?? '(제목 없음)',
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: post.id == data.post.id ? BrandColors.gray_800 : BrandColors.gray_500,
                              ),
                            ),
                          ),
                          const Gap(18),
                          if (post.id == data.post.id)
                            const Icon(TablerBold.check, size: 20, color: BrandColors.brand_400)
                          else
                            const Gap(20),
                        ],
                      ),
                    ),
                    onPressed: () async {
                      if (post.id != data.post.id) {
                        await context.popWaitAndPush(PostRoute(permalink: post.permalink));
                      }
                    },
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}

class _Comments extends ConsumerStatefulWidget {
  const _Comments({required this.permalink});

  final String permalink;

  @override
  createState() => _CommentsState();
}

class _CommentsState extends ConsumerState<_Comments> with SingleTickerProviderStateMixin {
  final _focusNode = FocusNode();
  final _textController = TextEditingController();
  final _scrollController = ScrollController();

  late AnimationController _textFieldAnimationController;
  late Animation<Color?> _textFieldFillColorAnimation;

  bool _isEmpty = true;
  GPostCommentVisibility _visibility = GPostCommentVisibility.PUBLIC;

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
          final isCommentEnabled = data.post.commentQualification == GPostCommentQualification.ANY ||
              (data.post.commentQualification == GPostCommentQualification.IDENTIFIED &&
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
                ..vars.input.visibility = _visibility,
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
                      color: BrandColors.gray_50,
                    ),
                  ),
                ),
                child: NavigationToolbar(
                  middle: Text(
                    '댓글 ${data.post.commentCount}',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  trailing: Padding(
                    padding: const Pad(right: 20),
                    child: Pressable(
                      child: const Icon(Tabler.x),
                      onPressed: () async {
                        await context.router.maybePop();
                      },
                    ),
                  ),
                ),
              ),
              if (data.post.commentQualification == GPostCommentQualification.NONE)
                const Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(TablerBold.message_circle_off, size: 40, color: Colors.black),
                      Gap(16),
                      Text(
                        '댓글을 달 수 없어요',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: BrandColors.gray_800),
                      ),
                      Gap(4),
                      Text(
                        '창작자가 댓글을 달 수 없도록 설정했어요',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: BrandColors.gray_500),
                      ),
                    ],
                  ),
                )
              else if (data.post.comments.isEmpty)
                const Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(TablerBold.mood_edit, size: 40, color: Colors.black),
                      Gap(16),
                      Text(
                        '아직 댓글이 없어요',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: BrandColors.gray_800),
                      ),
                      Gap(4),
                      Text(
                        '첫 번째 댓글을 달아보세요',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: BrandColors.gray_500),
                      ),
                    ],
                  ),
                )
              else
                Expanded(
                  child: Padding(
                    padding: const Pad(horizontal: 20),
                    child: ListView.separated(
                      physics: const AlwaysScrollableScrollPhysics(
                        parent: BouncingScrollPhysics(),
                      ),
                      controller: _scrollController,
                      itemCount: data.post.comments.length,
                      itemBuilder: (context, index) {
                        final comment = data.post.comments[index];
                        final isMyComment = comment.profile.id == data.post.space?.commentProfile?.id;

                        onDelete() async {
                          final client = ref.read(ferryProvider);
                          final req = GPostScreen_Comments_DeleteComment_MutationReq(
                            (b) => b..vars.input.commentId = comment.id,
                          );
                          await client.req(req);

                          if (context.mounted) {
                            // FIXME: 문구 미정
                            context.toast.show('댓글을 삭제했어요');
                          }

                          await client.req(
                            GPostScreen_Comnments_QueryReq(
                              (b) => b..vars.permalink = widget.permalink,
                            ),
                          );
                        }

                        return _Comment(
                          comment: comment,
                          children: comment.children.toList(),
                          commentProfile: data.post.space?.commentProfile,
                          postAuthorProfile: data.post.member!.profile,
                          isMyPost: data.post.space?.meAsMember != null,
                          onLike: () async {
                            if (comment.liked) {
                              final req = GPostScreen_Comments_UnlikeComment_MutationReq(
                                (b) => b..vars.input.commentId = comment.id,
                              );
                              await client.req(req);
                            } else {
                              final req = GPostScreen_Comments_LikeComment_MutationReq(
                                (b) => b..vars.input.commentId = comment.id,
                              );
                              await client.req(req);
                            }
                          },
                          onMore: () async {
                            await context.showBottomMenu(
                              title: '댓글',
                              items: isMyComment
                                  ? [
                                      BottomMenuItem(
                                        icon: Tabler.x,
                                        iconColor: BrandColors.red_600,
                                        title: '삭제',
                                        color: BrandColors.red_600,
                                        onTap: onDelete,
                                      ),
                                    ]
                                  : [
                                      BottomMenuItem(
                                        icon: Tabler.x,
                                        iconColor: BrandColors.gray_600,
                                        title: '삭제',
                                        onTap: onDelete,
                                      ),
                                      // BottomMenuItem(
                                      //   icon: Tabler.user_x,
                                      //   iconColor: BrandColors.red_600,
                                      //   title: '차단',
                                      //   color: BrandColors.red_600,
                                      //   onTap: () async {
                                      //     if (context.mounted) {
                                      //       // TODO:
                                      //       context.toast.show('Not implemented');
                                      //     }
                                      //   },
                                      // ),
                                    ],
                            );
                          },
                          onReply: () async {
                            await context.showModal(
                              builder: (context) {
                                return _Replies(
                                  parentId: comment.id,
                                  permalink: widget.permalink,
                                );
                              },
                            );
                          },
                        );
                      },
                      separatorBuilder: (context, index) {
                        return const HorizontalDivider(color: BrandColors.gray_50);
                      },
                    ),
                  ),
                ),
              Container(
                padding: const Pad(horizontal: 20, vertical: 14),
                decoration: const BoxDecoration(
                  border: Border(
                    top: BorderSide(
                      color: BrandColors.gray_150,
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
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: BrandColors.gray_500,
                      ),
                    ),
                    const Gap(4),
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
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: InputBorder.none,
                                  disabledBorder: InputBorder.none,
                                  contentPadding: const Pad(vertical: 2),
                                  hintText: isCommentEnabled
                                      ? '창작자에게 응원의 글을 남겨주세요'
                                      : (data.post.commentQualification == GPostCommentQualification.IDENTIFIED
                                          ? '본인인증이 된 계정만 댓글을 달 수 있어요'
                                          : '댓글을 달 수 없는 포스트에요'),
                                  hintStyle: const TextStyle(
                                    color: BrandColors.gray_400,
                                  ),
                                ),
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w400,
                                  color: BrandColors.gray_900,
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
                        const Gap(10),
                        Row(
                          children: [
                            Pressable(
                              onPressed: () {
                                setState(() {
                                  if (_visibility == GPostCommentVisibility.PUBLIC) {
                                    _visibility = GPostCommentVisibility.PRIVATE;
                                  } else if (_visibility == GPostCommentVisibility.PRIVATE) {
                                    _visibility = GPostCommentVisibility.PUBLIC;
                                  }
                                });
                              },
                              child: Icon(
                                _visibility == GPostCommentVisibility.PRIVATE ? Tabler.lock : Tabler.lock_open,
                                size: 24,
                                color: _visibility == GPostCommentVisibility.PRIVATE
                                    ? BrandColors.gray_900
                                    : BrandColors.gray_300,
                              ),
                            ),
                            const Gap(20),
                            Pressable(
                              onPressed: onSubmit,
                              child: Icon(
                                Tabler.circle_arrow_up_filled,
                                size: 24,
                                color: _isEmpty ? BrandColors.gray_300 : BrandColors.gray_900,
                              ),
                            ),
                          ],
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

class _Comment extends ConsumerWidget {
  const _Comment({
    required this.comment,
    required this.onLike,
    required this.onMore,
    required this.postAuthorProfile,
    required this.commentProfile,
    required this.isMyPost,
    this.children,
    this.onReply,
  });

  final GComment_postComment comment;
  final List<GComment_postComment>? children;
  final GPostScreen_Comnments_QueryData_post_member_profile postAuthorProfile;
  final GPostScreen_Comnments_QueryData_post_space_commentProfile? commentProfile;
  final bool isMyPost;
  final VoidCallback? onReply;
  final VoidCallback onLike;
  final VoidCallback onMore;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isMyComment = comment.profile.id == commentProfile?.id;
    final invisible = comment.visibility == GPostCommentVisibility.PRIVATE && !isMyComment && !isMyPost;

    return Stack(
      children: [
        Padding(
          padding: const Pad(
            vertical: 20,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        if (comment.visibility == GPostCommentVisibility.PRIVATE) ...[
                          const Icon(
                            Icons.lock,
                            size: 16,
                            color: BrandColors.gray_400,
                          ),
                          const Gap(6),
                        ],
                        if (comment.profile.id == postAuthorProfile.id)
                          Flexible(
                            child: Container(
                              padding: const Pad(
                                horizontal: 6,
                                vertical: 1.5,
                              ),
                              decoration: const BoxDecoration(
                                color: BrandColors.gray_400,
                                borderRadius: BorderRadius.all(
                                  Radius.circular(2),
                                ),
                              ),
                              child: Text(
                                postAuthorProfile.name,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          )
                        else
                          Flexible(
                            child: Text(
                              comment.profile.name,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: BrandColors.gray_900,
                              ),
                            ),
                          ),
                        const Gap(6),
                        Text(
                          Jiffy.parse(comment.createdAt.value, isUtc: true).fromNow(),
                          style: const TextStyle(
                            fontSize: 12,
                            color: BrandColors.gray_400,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isMyComment || isMyPost)
                    Pressable(
                      onPressed: onMore,
                      child: const Icon(
                        Tabler.dots_vertical,
                        size: 20,
                        color: BrandColors.gray_300,
                      ),
                    ),
                ],
              ),
              const Gap(4),
              Padding(
                padding: const Pad(right: 12),
                child: invisible
                    ? const Text(
                        '비밀댓글입니다',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: BrandColors.gray_400,
                        ),
                      )
                    : Text(
                        comment.content,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w400,
                          color: BrandColors.gray_900,
                        ),
                      ),
              ),
              const Gap(12),
              Row(
                children: [
                  Expanded(
                    child: Row(
                      children: [
                        if (children != null) ...[
                          Pressable(
                            onPressed: onReply,
                            child: Row(
                              children: [
                                const Icon(
                                  Tabler.message,
                                  size: 16,
                                  color: BrandColors.gray_400,
                                ),
                                const Gap(3),
                                Text(
                                  '답글${(children!.isEmpty) ? '' : ' ${children!.length}'}',
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                    color: BrandColors.gray_400,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Gap(12),
                          Container(
                            width: 1,
                            height: 10,
                            color: BrandColors.gray_100,
                          ),
                          const Gap(12),
                        ],
                        Pressable(
                          onPressed: onLike,
                          child: Row(
                            children: [
                              if (comment.liked)
                                const Icon(
                                  Tabler.heart_filled,
                                  size: 16,
                                  color: BrandColors.gray_900,
                                )
                              else
                                const Icon(
                                  Tabler.heart,
                                  size: 16,
                                  color: BrandColors.gray_400,
                                ),
                              const Gap(3),
                              Text(
                                '좋아요${comment.likeCount > 0 ? ' ${comment.likeCount}' : ''}',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: comment.liked ? BrandColors.gray_900 : BrandColors.gray_400,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        if (comment.likedByPostUser)
          Positioned(
            right: 0,
            bottom: 17,
            child: Stack(
              children: [
                CircleAvatar(
                  radius: 12,
                  backgroundColor: BrandColors.gray_900,
                  child: Padding(
                    padding: const Pad(all: 1),
                    child: ClipOval(
                      child: Img(
                        postAuthorProfile.avatar,
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
          ),
      ],
    );
  }
}

class _Replies extends ConsumerStatefulWidget {
  const _Replies({
    required this.parentId,
    required this.permalink,
  });

  final String parentId;
  final String permalink;

  @override
  createState() => _RepliesState();
}

class _RepliesState extends ConsumerState<_Replies> with SingleTickerProviderStateMixin {
  final _focusNode = FocusNode();
  final _textController = TextEditingController();
  final _scrollController = ScrollController();

  late AnimationController _textFieldAnimationController;
  late Animation<Color?> _textFieldFillColorAnimation;

  bool _isEmpty = true;
  GPostCommentVisibility _visibility = GPostCommentVisibility.PUBLIC;

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
          final isCommentEnabled = data.post.commentQualification == GPostCommentQualification.ANY ||
              (data.post.commentQualification == GPostCommentQualification.IDENTIFIED &&
                  data.me!.personalIdentity != null);

          final comment = data.post.comments.firstWhere((comment) => comment.id == widget.parentId);

          onLike({required bool liked, required String id}) async {
            if (liked) {
              final req = GPostScreen_Comments_UnlikeComment_MutationReq(
                (b) => b..vars.input.commentId = id,
              );
              await client.req(req);
            } else {
              final req = GPostScreen_Comments_LikeComment_MutationReq(
                (b) => b..vars.input.commentId = id,
              );
              await client.req(req);
            }
          }

          onDelete({required String id}) async {
            final req = GPostScreen_Comments_DeleteComment_MutationReq(
              (b) => b..vars.input.commentId = id,
            );
            await client.req(req);

            if (context.mounted) {
              // FIXME: 문구 미정
              context.toast.show('댓글을 삭제했어요');
            }

            await client.req(
              GPostScreen_Comnments_QueryReq(
                (b) => b..vars.permalink = widget.permalink,
              ),
            );
          }

          onMore({required GComment_postComment comment}) async {
            await context.showBottomMenu(
              title: '댓글',
              items: comment.profile.id == data.post.space?.commentProfile?.id // isMyComment
                  ? [
                      BottomMenuItem(
                        icon: Tabler.x,
                        iconColor: BrandColors.red_600,
                        title: '삭제',
                        color: BrandColors.red_600,
                        onTap: () => onDelete(id: comment.id),
                      ),
                    ]
                  : [
                      BottomMenuItem(
                        icon: Tabler.x,
                        iconColor: BrandColors.gray_600,
                        title: '삭제',
                        onTap: () => onDelete(id: comment.id),
                      ),
                      // BottomMenuItem(
                      //   icon: Tabler.user_x,
                      //   iconColor: BrandColors.red_600,
                      //   title: '차단',
                      //   color: BrandColors.red_600,
                      //   onTap: () async {
                      //     if (context.mounted) {
                      //       // TODO:
                      //       context.toast.show('Not implemented');
                      //     }
                      //   },
                      // ),
                    ],
            );
          }

          Future<void> onSubmit() async {
            final value = _textController.text;
            if (value.isEmpty) {
              return;
            }

            _focusNode.unfocus();

            final req = GPostScreen_Comments_CreateComment_MutationReq(
              (b) => b
                ..vars.input.postId = data.post.id
                ..vars.input.parentId = widget.parentId
                ..vars.input.content = value
                ..vars.input.visibility = _visibility,
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
                      color: BrandColors.gray_50,
                    ),
                  ),
                ),
                child: NavigationToolbar(
                  middle: Text(
                    '답글 ${comment.children.length}',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  trailing: Padding(
                    padding: const Pad(
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
                child: Padding(
                  padding: const Pad(
                    horizontal: 20,
                  ),
                  child: Column(
                    children: [
                      _Comment(
                        comment: comment,
                        commentProfile: data.post.space?.commentProfile,
                        postAuthorProfile: data.post.member!.profile,
                        isMyPost: data.post.space?.meAsMember != null,
                        onLike: () async => onLike(
                          liked: comment.liked,
                          id: comment.id,
                        ),
                        onMore: () async => onMore(comment: comment),
                      ),
                      if (comment.children.isNotEmpty) ...[
                        const HorizontalDivider(
                          color: BrandColors.gray_50,
                        ),
                        Expanded(
                          child: ListView.separated(
                            controller: _scrollController,
                            itemCount: comment.children.length,
                            separatorBuilder: (context, index) {
                              return const Padding(
                                padding: Pad(left: 24),
                                child: HorizontalDivider(
                                  color: BrandColors.gray_50,
                                ),
                              );
                            },
                            itemBuilder: (context, index) {
                              final commentReply = comment.children[index];

                              // FIXME: comment visible 여부는 서버에서 주기로 했다
                              final invisible = commentReply.visibility == GPostCommentVisibility.PRIVATE &&
                                  data.post.space?.commentProfile?.id != commentReply.profile.id &&
                                  data.post.space?.meAsMember == null;

                              return Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Padding(
                                    padding: Pad(vertical: 20),
                                    child: Icon(Tabler.chevron_down_left, size: 16, color: BrandColors.gray_400),
                                  ),
                                  const Gap(8),
                                  Expanded(
                                    child: _Comment(
                                      comment: commentReply,
                                      commentProfile: data.post.space?.commentProfile,
                                      postAuthorProfile: data.post.member!.profile,
                                      isMyPost: data.post.space?.meAsMember != null,
                                      onLike: () async => onLike(
                                        liked: commentReply.liked,
                                        id: commentReply.id,
                                      ),
                                      onMore: () async => onMore(comment: commentReply),
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              Container(
                padding: const Pad(
                  horizontal: 20,
                  vertical: 14,
                ),
                decoration: const BoxDecoration(
                  border: Border(
                    top: BorderSide(
                      color: BrandColors.gray_150,
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
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: BrandColors.gray_500,
                      ),
                    ),
                    const Gap(4),
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
                                  enabledBorder: InputBorder.none,
                                  focusedBorder: InputBorder.none,
                                  disabledBorder: InputBorder.none,
                                  contentPadding: const Pad(
                                    vertical: 2,
                                  ),
                                  hintText: isCommentEnabled
                                      ? '답글을 입력해주세요'
                                      : (data.post.commentQualification == GPostCommentQualification.IDENTIFIED
                                          ? '본인인증이 된 계정만 댓글을 달 수 있어요'
                                          : '댓글을 달 수 없는 포스트에요'),
                                  hintStyle: const TextStyle(
                                    color: BrandColors.gray_400,
                                  ),
                                ),
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w400,
                                  color: BrandColors.gray_900,
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
                        const Gap(10),
                        Row(
                          children: [
                            Pressable(
                              onPressed: () {
                                setState(() {
                                  if (_visibility == GPostCommentVisibility.PUBLIC) {
                                    _visibility = GPostCommentVisibility.PRIVATE;
                                  } else if (_visibility == GPostCommentVisibility.PRIVATE) {
                                    _visibility = GPostCommentVisibility.PUBLIC;
                                  }
                                });
                              },
                              child: Icon(
                                _visibility == GPostCommentVisibility.PRIVATE ? Tabler.lock : Tabler.lock_open,
                                size: 24,
                                color: _visibility == GPostCommentVisibility.PRIVATE
                                    ? BrandColors.gray_900
                                    : BrandColors.gray_300,
                              ),
                            ),
                            const Gap(20),
                            Pressable(
                              onPressed: onSubmit,
                              child: Icon(
                                Tabler.circle_arrow_up_filled,
                                size: 24,
                                color: _isEmpty ? BrandColors.gray_300 : BrandColors.gray_900,
                              ),
                            ),
                          ],
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
