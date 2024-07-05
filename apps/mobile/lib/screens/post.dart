import 'dart:async';
import 'dart:math';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:collection/collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/btn.dart';
import 'package:glyph/components/dot.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/components/forms/form_text_field.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/post_card.dart';
import 'package:glyph/components/post_warning.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/rectangle_chip.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/context/bottom_menu.dart';
import 'package:glyph/context/bottom_sheet.dart';
import 'package:glyph/context/dialog.dart';
import 'package:glyph/context/floating_bottom_sheet.dart';
import 'package:glyph/context/modal.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/emojis/data.dart';
import 'package:glyph/emojis/emoji.dart';
import 'package:glyph/emojis/subset.dart';
import 'package:glyph/extensions/build_context.dart';
import 'package:glyph/extensions/int.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/ferry/error.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/post_screen_bookmark_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_collection_post_list_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_block_masquerade_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_create_comment_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_delete_comment_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_like_comment_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_query.data.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_comments_unlike_comment_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_delete_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_follow_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_mute_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_reactions_create_post_reaction_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_reactions_delete_post_reaction_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_reactions_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_space_post_list_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_unbookmark_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_unfollow_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_unlock_passworded_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_unmute_space_mutation.req.gql.dart';
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
import 'package:sliver_tools/sliver_tools.dart';

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

  bool _blurContent = false;

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
          _blurContent = data.post.blurredReason != null;

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
                      ...(data.post.space?.meAsMember == null
                          ? [
                              BottomMenuItem(
                                icon: Tabler.volume_3,
                                title: data.post.space!.muted ? '스페이스 뮤트 해제' : '스페이스 뮤트',
                                color: BrandColors.red_600,
                                onTap: () async {
                                  if (data.post.space!.muted) {
                                    _mixpanel.track(
                                      'space:unmute',
                                      properties: {
                                        'spaceId': data.post.space!.id,
                                        'via': 'post',
                                      },
                                    );

                                    final req = GPostScreen_UnmuteSpace_MutationReq(
                                      (b) => b..vars.input.spaceId = data.post.space!.id,
                                    );
                                    await client.req(req);

                                    if (context.mounted) {
                                      context.toast.show('${data.post.space!.name} 스페이스 뮤트를 해제했어요');
                                    }
                                  } else {
                                    _mixpanel.track(
                                      'space:mute',
                                      properties: {
                                        'spaceId': data.post.space!.id,
                                        'via': 'post',
                                      },
                                    );

                                    final req = GPostScreen_MuteSpace_MutationReq(
                                      (b) => b..vars.input.spaceId = data.post.space!.id,
                                    );
                                    await client.req(req);

                                    if (context.mounted) {
                                      context.toast.show('${data.post.space!.name} 스페이스를 뮤트했어요', type: ToastType.error);
                                    }
                                  }
                                },
                              ),
                            ]
                          : [
                              BottomMenuItem(
                                icon: Tabler.pencil,
                                title: '수정',
                                color: BrandColors.gray_600,
                                onTap: () async {
                                  if (context.mounted) {
                                    await context.router.push(
                                      EditorRoute(permalink: data.post.permalink),
                                    );
                                  }
                                },
                              ),
                              BottomMenuItem(
                                icon: Tabler.x,
                                title: '삭제',
                                color: BrandColors.red_600,
                                onTap: () {
                                  context.showDialog(
                                    title: '포스트를 삭제하시겠어요?',
                                    content: '삭제된 글은 복구할 수 없어요',
                                    confirmText: '삭제',
                                    onConfirmed: () async {
                                      final client = ref.read(ferryProvider);

                                      _mixpanel.track(
                                        'post:delete',
                                        properties: {
                                          'postId': data.post.id,
                                          'via': 'post',
                                        },
                                      );

                                      final req = GPostScreen_DeletePost_MutationReq(
                                        (b) => b..vars.input.postId = data.post.id,
                                      );
                                      await client.req(req);

                                      if (context.mounted) {
                                        context.toast.show('포스트가 삭제되었어요', type: ToastType.error);
                                        await context.router.maybePop();
                                      }
                                    },
                                  );
                                },
                              ),
                            ]),
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
                  onPressed: () async {
                    if (data.post.reactionCount > 0) {
                      await context.showBottomSheet(
                        title: '이모지 ${data.post.reactionCount}',
                        builder: (context) {
                          return _Reactions(
                            permalink: widget.permalink,
                          );
                        },
                      );
                    } else {
                      await context.showFullScreenModal(
                        title: '이모지 삽입',
                        builder: (context) {
                          return _EmojiPicker(postId: data.post.id);
                        },
                      );
                    }
                  },
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
                    await context.showFullScreenModal(
                      title: '댓글 ${data.post.commentCount}',
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
                      _mixpanel.track(
                        'post:bookmark',
                        properties: {
                          'postId': data.post.id,
                          'via': 'post',
                        },
                      );
                      final req = GPostScreen_BookmarkPost_MutationReq(
                        (b) => b..vars.input.postId = data.post.id,
                      );
                      await client.req(req);
                    } else {
                      _mixpanel.track(
                        'post:unbookmark',
                        properties: {
                          'postId': data.post.id,
                          'via': 'post',
                        },
                      );
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

          onUnblurPost() {
            _blurContent = false;
            setState(() {});
          }

          onGoToIdentification() async {
            await context.router.push(const IdentificationRoute());
          }

          onUnlockPasswordedPost(String password) async {
            _mixpanel.track(
              'post:unlock',
              properties: {
                'postId': data.post.id,
              },
            );

            final req = GPostScreen_UnlockPasswordedPost_MutationReq(
              (b) => b
                ..vars.input.postId = data.post.id
                ..vars.input.password = password,
            );

            await client.req(req).then((_) async {
              _blurContent = false;
              setState(() {});
            });
          }

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
                            if (data.post.collection != null)
                              Pressable(
                                child: Column(
                                  children: [
                                    Text(
                                      data.post.collection!.name,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                        color: BrandColors.gray_500,
                                      ),
                                    ),
                                    const Gap(12),
                                  ],
                                ),
                                onPressed: () async {
                                  await context.router.push(
                                    SpaceCollectionRoute(collection: data.post.collection!.id),
                                  );
                                },
                              ),
                            if (data.post.ageRating != GPostAgeRating.ALL ||
                                data.post.hasPassword ||
                                (data.post.publishedRevision?.price != null &&
                                    data.post.publishedRevision!.price! > 0)) ...[
                              Row(
                                children: [
                                  if (data.post.ageRating == GPostAgeRating.R15) ...[
                                    const RectangleChip('15세'),
                                    const Gap(4),
                                  ],
                                  if (data.post.ageRating == GPostAgeRating.R19) ...[
                                    const RectangleChip('성인', theme: RectangleChipTheme.pink),
                                    const Gap(4),
                                  ],
                                  if (data.post.hasPassword) ...[
                                    const RectangleChip('비밀글', theme: RectangleChipTheme.purple),
                                    const Gap(4),
                                  ],
                                  if (data.post.publishedRevision!.price! > 0) ...[
                                    const RectangleChip('유료', theme: RectangleChipTheme.blue),
                                    const Gap(4),
                                  ],
                                ],
                              ),
                              const Gap(6),
                            ],
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
                                Text(
                                  '읽는 시간 ${(data.post.publishedRevision!.readingTime / 60).ceil()}분',
                                  style: const TextStyle(
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
                      if (_blurContent)
                        switch (data.post.blurredReason) {
                          GPostBlurredReason.ADULT_HIDDEN => PostWarning(
                              title: '성인용 콘텐츠',
                              description: '해당 내용은 20세 이상만 열람할 수 있어요',
                              onPressed: onUnblurPost,
                            ),
                          GPostBlurredReason.AGE_RATING => switch (data.post.ageRating) {
                              GPostAgeRating.R15 => data.me?.personalIdentity == null
                                  ? PostWarning(
                                      title: '15세 콘텐츠',
                                      description: '해당 내용을 감상하려면 본인 인증이 필요해요',
                                      buttonTitle: '본인인증하기',
                                      onPressed: onGoToIdentification,
                                    )
                                  : PostWarning(
                                      title: '15세 콘텐츠',
                                      description: '해당 내용은 15세 이상만 열람할 수 있어요',
                                      onPressed: onUnblurPost,
                                    ),
                              GPostAgeRating.R19 => data.me?.personalIdentity == null
                                  ? PostWarning(
                                      title: '성인용 콘텐츠',
                                      description: '해당 내용을 감상하려면 본인 인증이 필요해요',
                                      buttonTitle: '본인인증하기',
                                      onPressed: onGoToIdentification,
                                    )
                                  : PostWarning(
                                      title: '성인용 콘텐츠',
                                      description: '해당 내용은 20세 이상만 열람할 수 있어요',
                                      buttonTitle: '돌아가기',
                                      onPressed: () async {
                                        await context.router.maybePop();
                                      },
                                    ),
                              _ => throw UnimplementedError(),
                            },
                          GPostBlurredReason.PASSWORD => _PasswordedPostGuard(
                              onSubmit: onUnlockPasswordedPost,
                            ),
                          GPostBlurredReason.TRIGGER => PostWarning(
                              title: '보기전 주의사항',
                              description: data.post.tags
                                  .where((tag) => tag.kind == GPostTagKind.TRIGGER)
                                  .map((tag) => '#${tag.tag.name}')
                                  .join(' '),
                              onPressed: onUnblurPost,
                            ),
                          _ => throw UnimplementedError(),
                        }
                      else
                        SizedBox(
                          height: _webViewHeight,
                          child: WebView(
                            path: '/_webview/post-view/${widget.permalink}',
                            readOnly: true,
                            onJsMessage: (message, reply, controller) async {
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
                      if (!_webViewLoaded && !_blurContent)
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
                                fontWeight: FontWeight.w600,
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
                                fontWeight: FontWeight.w600,
                                color: BrandColors.gray_400,
                              ),
                            ),
                            const Gap(12),
                            SizedBox(
                              height: 56,
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
                                                Flexible(
                                                  child: Text(
                                                    '이전 포스트가 없습니다',
                                                    maxLines: 2,
                                                    style: TextStyle(
                                                      fontSize: 13,
                                                      fontWeight: FontWeight.w700,
                                                      color: BrandColors.gray_300,
                                                    ),
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
                                                      mainAxisAlignment: MainAxisAlignment.center,
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
                                                        if (data.post.previousPost!.publishedRevision!.subtitle !=
                                                                null &&
                                                            data.post.previousPost!.publishedRevision!.subtitle !=
                                                                '') ...[
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
                                                Expanded(
                                                  child: Text(
                                                    '다음 포스트가 없습니다',
                                                    maxLines: 2,
                                                    style: TextStyle(
                                                      fontSize: 13,
                                                      fontWeight: FontWeight.w700,
                                                      color: BrandColors.gray_300,
                                                    ),
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
                                                      mainAxisAlignment: MainAxisAlignment.center,
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
                                                        if (data.post.nextPost!.publishedRevision!.subtitle != null &&
                                                            data.post.nextPost!.publishedRevision!.subtitle != '') ...[
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
                            if (data.post.collection != null) ...[
                              const Gap(32),
                              const HorizontalDivider(
                                color: BrandColors.gray_50,
                              ),
                              const Gap(32),
                              const Text(
                                '컬렉션',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: BrandColors.gray_400,
                                ),
                              ),
                              const Gap(12),
                              IntrinsicHeight(
                                child: Pressable(
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Img(
                                        data.post.collection?.thumbnail,
                                        width: 67,
                                        aspectRatio: 3 / 4,
                                        borderWidth: 1,
                                      ),
                                      const Gap(14),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              data.post.collection!.name,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                fontSize: 15,
                                                fontWeight: FontWeight.w700,
                                              ),
                                            ),
                                            const Gap(2),
                                            Text(
                                              data.post.collection?.description ?? '',
                                              maxLines: 2,
                                              style: const TextStyle(
                                                fontSize: 12,
                                                color: Color(0xFF848489),
                                              ),
                                            ),
                                            const Spacer(),
                                            Text(
                                              '총 ${data.post.collection?.count ?? 0}화',
                                              style: const TextStyle(
                                                fontSize: 11,
                                                color: BrandColors.gray_400,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  onPressed: () async {
                                    await context.router
                                        .push(SpaceCollectionRoute(collection: data.post.collection!.id));
                                  },
                                ),
                              ),
                            ],
                            const Gap(32),
                            const HorizontalDivider(
                              color: BrandColors.gray_50,
                            ),
                            const Gap(32),
                            const Text(
                              '스페이스',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: BrandColors.gray_400,
                              ),
                            ),
                            const Gap(12),
                            Pressable(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
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
                                ],
                              ),
                              onPressed: () async {
                                await context.router.push(SpaceRoute(slug: data.post.space!.slug));
                              },
                            ),
                            if (data.post.space?.meAsMember == null) ...[
                              const Gap(18),
                              Btn(
                                data.post.space!.followed ? '스페이스 구독중' : '스페이스 구독',
                                theme: data.post.space!.followed ? BtnTheme.secondaryOutline : BtnTheme.primary,
                                iconLeft: data.post.space!.followed ? Tabler.check : Tabler.plus,
                                onPressed: () async {
                                  if (data.post.space!.followed) {
                                    _mixpanel.track(
                                      'space:unfollow',
                                      properties: {
                                        'spaceId': data.post.space!.id,
                                        'via': 'post',
                                      },
                                    );
                                    final req = GPostScreen_UnfollowSpace_MutationReq(
                                      (b) => b..vars.input.spaceId = data.post.space!.id,
                                    );
                                    await client.req(req);
                                  } else {
                                    _mixpanel.track(
                                      'space:follow',
                                      properties: {
                                        'spaceId': data.post.space!.id,
                                        'via': 'post',
                                      },
                                    );
                                    final req = GPostScreen_FollowSpace_MutationReq(
                                      (b) => b..vars.input.spaceId = data.post.space!.id,
                                    );
                                    await client.req(req);
                                  }
                                },
                              ),
                            ],
                          ],
                        ),
                      ),
                      if (data.post.recommendedPosts.isNotEmpty) ...[
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
                      ],
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
            child: Pressable(
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
              onPressed: () async {
                if (kind != '카테고리') {
                  await context.router.push(TagRoute(name: name));
                }
              },
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

class _Reactions extends StatelessWidget {
  const _Reactions({required this.permalink});

  final String permalink;

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: GPostScreen_Reactions_QueryReq(
        (b) => b..vars.permalink = permalink,
      ),
      builder: (context, client, data) {
        final reactions =
            data.post.reactions.groupListsBy((element) => element.emoji).entries.sortedBy((element) => element.key);

        return Padding(
          padding: const Pad(all: 20, bottom: 40),
          child: Wrap(
            spacing: 12,
            runSpacing: 14,
            children: [
              ...reactions.map(
                (entry) {
                  final emoji = entry.key;
                  final reactions = entry.value;
                  final hasReacted = reactions.any((element) => element.mine);

                  return Pressable(
                    child: Container(
                      padding: const Pad(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: hasReacted ? BrandColors.gray_200 : BrandColors.gray_50,
                        border: Border.all(
                          color: hasReacted ? BrandColors.gray_900 : BrandColors.gray_150,
                        ),
                        borderRadius: BorderRadius.circular(30),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Emoji(Emojis.fromShortCode(emoji), size: 20),
                          const Gap(6),
                          Text(
                            reactions.length.toString(),
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: hasReacted ? BrandColors.gray_900 : BrandColors.gray_500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    onPressed: () async {
                      if (hasReacted) {
                        final req = GPostScreen_Reactions_DeletePostReaction_MutationReq(
                          (b) => b
                            ..vars.input.postId = data.post.id
                            ..vars.input.emoji = emoji,
                        );
                        await client.req(req);
                      } else {
                        final req = GPostScreen_Reactions_CreatePostReaction_MutationReq(
                          (b) => b
                            ..vars.input.postId = data.post.id
                            ..vars.input.emoji = emoji,
                        );
                        await client.req(req);
                      }
                    },
                  );
                },
              ),
              Pressable(
                child: Container(
                  padding: const Pad(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: BrandColors.gray_50,
                    border: Border.all(color: BrandColors.gray_150),
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: const Icon(TablerBold.mood_plus, size: 20, color: BrandColors.gray_500),
                ),
                onPressed: () async {
                  await context.showFullScreenModal(
                    title: '이모지 삽입',
                    builder: (context) {
                      return _EmojiPicker(postId: data.post.id);
                    },
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

class _EmojiPicker extends ConsumerWidget {
  const _EmojiPicker({required this.postId});

  final String postId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return CustomScrollView(
      physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
      slivers: [
        SliverPadding(
          padding: const Pad(horizontal: 20, vertical: 16),
          sliver: MultiSliver(
            children: [
              ...EmojiSubsets.sections.map((section) {
                return MultiSliver(
                  children: [
                    SliverToBoxAdapter(
                      child: Text(
                        section.name,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: BrandColors.gray_800,
                        ),
                      ),
                    ),
                    const SliverGap(8),
                    SliverGrid.builder(
                      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                        maxCrossAxisExtent: 40,
                        mainAxisSpacing: 10,
                        crossAxisSpacing: 10,
                      ),
                      itemCount: section.emojis.length,
                      itemBuilder: (context, index) {
                        final emoji = section.emojis[index];
                        return Pressable(
                          child: Center(child: Emoji(emoji, size: 28)),
                          onPressed: () async {
                            final client = ref.read(ferryProvider);
                            final req = GPostScreen_Reactions_CreatePostReaction_MutationReq(
                              (b) => b
                                ..vars.input.postId = postId
                                ..vars.input.emoji = emoji.name,
                            );
                            await client.req(req);

                            if (context.mounted) {
                              await context.router.maybePop();
                            }
                          },
                        );
                      },
                    ),
                    const SliverGap(36),
                  ],
                );
              }),
            ],
          ),
        ),
      ],
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
  final _mixpanel = GetIt.I<Mixpanel>();
  final _focusNode = FocusNode();
  final _textController = TextEditingController();
  final _scrollController = ScrollController();

  bool _isEmpty = true;
  GPostCommentVisibility _visibility = GPostCommentVisibility.PUBLIC;

  @override
  void dispose() {
    _focusNode.dispose();
    _scrollController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
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

          _mixpanel.track(
            'comment:create',
            properties: {
              'postId': data.post.id,
            },
          );
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

          if (_scrollController.hasClients) {
            await _scrollController.animateTo(
              _scrollController.position.maxScrollExtent,
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
            );
          }
        }

        return Column(
          children: [
            if (data.post.commentQualification == GPostCommentQualification.NONE)
              const Expanded(
                child: EmptyState(
                  icon: TablerBold.message_circle_off,
                  title: '댓글을 달 수 없어요',
                  description: '창작자가 댓글을 달 수 없도록 설정했어요',
                ),
              )
            else if (data.post.comments.isEmpty)
              const Expanded(
                child: EmptyState(
                  icon: TablerBold.mood_edit,
                  title: '아직 댓글이 없어요',
                  description: '첫 번째 댓글을 달아보세요',
                ),
              )
            else
              Expanded(
                child: Padding(
                  padding: const Pad(horizontal: 20),
                  child: ListView.separated(
                    padding: const Pad(bottom: 32),
                    physics: const AlwaysScrollableScrollPhysics(
                      parent: BouncingScrollPhysics(),
                    ),
                    controller: _scrollController,
                    itemCount: data.post.comments.length,
                    itemBuilder: (context, index) {
                      final comment = data.post.comments[index];
                      final isMyComment = comment.profile.id == data.post.space?.commentProfile?.id;
                      final client = ref.read(ferryProvider);

                      onDelete() async {
                        await context.showDialog(
                          title: '댓글을 삭제하시겠어요?',
                          confirmText: '삭제',
                          onConfirmed: () async {
                            final client = ref.read(ferryProvider);
                            _mixpanel.track(
                              'comment:delete',
                              properties: {
                                'commentId': comment.id,
                              },
                            );
                            final req = GPostScreen_Comments_DeleteComment_MutationReq(
                              (b) => b..vars.input.commentId = comment.id,
                            );
                            await client.req(req);

                            if (context.mounted) {
                              context.toast.show('댓글이 삭제되었어요', type: ToastType.error);
                            }

                            await client.req(
                              GPostScreen_Comnments_QueryReq(
                                (b) => b..vars.permalink = widget.permalink,
                              ),
                            );
                          },
                        );
                      }

                      onBlock() async {
                        await context.showDialog(
                          title: '${comment.profile.name}님을 차단할까요?',
                          content: '차단된 유저는 스페이스의 모든 게시물을 볼 수 없으며, 댓글을 달 수 없어요. 차단 해지는 [스페이스 설정- 독자관리]에서 가능해요.',
                          confirmText: '차단',
                          onConfirmed: () async {
                            _mixpanel.track(
                              'space:masquerade:block',
                              properties: {
                                'masqueradeId': comment.masquerade?.id,
                                'spaceId': data.post.space!.id,
                              },
                            );
                            final req = GPostScreen_Comments_BlockMasquerade_MutationReq(
                              (b) => b
                                ..vars.input.masqueradeId = comment.masquerade!.id
                                ..vars.input.spaceId = data.post.space!.id,
                            );
                            await client.req(req);

                            if (context.mounted) {
                              context.toast.show('${comment.profile.name}님이 차단되었습니다.');
                            }

                            await client.req(
                              GPostScreen_Comnments_QueryReq(
                                (b) => b..vars.permalink = widget.permalink,
                              ),
                            );
                          },
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
                            _mixpanel.track(
                              'comment:unlike',
                              properties: {
                                'commentId': comment.id,
                              },
                            );
                            final req = GPostScreen_Comments_UnlikeComment_MutationReq(
                              (b) => b..vars.input.commentId = comment.id,
                            );
                            await client.req(req);
                          } else {
                            _mixpanel.track(
                              'comment:like',
                              properties: {
                                'commentId': comment.id,
                              },
                            );
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
                                    BottomMenuItem(
                                      icon: Tabler.user_x,
                                      iconColor: BrandColors.red_600,
                                      title: '차단',
                                      color: BrandColors.red_600,
                                      onTap: onBlock,
                                    ),
                                  ],
                          );
                        },
                        onReply: () async {
                          await context.showFullScreenModal(
                            title: '답글 ${comment.children.length}',
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
                        child: TextField(
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
              const Gap(6),
              switch (comment.invisibleReason) {
                GCommentInvisibleReason.DELETED => const Text(
                    '삭제된 댓글입니다',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                      color: BrandColors.gray_400,
                    ),
                  ),
                GCommentInvisibleReason.PRIVATE => const Text(
                    '비밀댓글입니다',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                      color: BrandColors.gray_400,
                    ),
                  ),
                null => Text(
                    comment.content,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                      color: BrandColors.gray_900,
                    ),
                  ),
                _ => throw UnimplementedError(),
              },
              if (comment.visibility == GPostCommentVisibility.PUBLIC || isMyComment || isMyPost) ...[
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
  final _mixpanel = GetIt.I<Mixpanel>();
  final _focusNode = FocusNode();
  final _textController = TextEditingController();
  final _scrollController = ScrollController();

  bool _isEmpty = true;
  GPostCommentVisibility _visibility = GPostCommentVisibility.PUBLIC;

  @override
  void dispose() {
    _focusNode.dispose();
    _scrollController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
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
            _mixpanel.track(
              'comment:unlike',
              properties: {
                'commentId': id,
              },
            );
            final req = GPostScreen_Comments_UnlikeComment_MutationReq(
              (b) => b..vars.input.commentId = id,
            );
            await client.req(req);
          } else {
            _mixpanel.track(
              'comment:like',
              properties: {
                'commentId': id,
              },
            );
            final req = GPostScreen_Comments_LikeComment_MutationReq(
              (b) => b..vars.input.commentId = id,
            );
            await client.req(req);
          }
        }

        onDelete({required String id}) async {
          await context.showDialog(
            title: '댓글을 삭제하시겠어요?',
            confirmText: '삭제',
            onConfirmed: () async {
              final client = ref.read(ferryProvider);
              _mixpanel.track(
                'comment:delete',
                properties: {
                  'commentId': id,
                },
              );
              final req = GPostScreen_Comments_DeleteComment_MutationReq(
                (b) => b..vars.input.commentId = id,
              );
              await client.req(req);

              if (context.mounted) {
                context.toast.show('댓글이 삭제되었어요', type: ToastType.error);
              }

              await client.req(
                GPostScreen_Comnments_QueryReq(
                  (b) => b..vars.permalink = widget.permalink,
                ),
              );
            },
          );
        }

        onBlock({required GComment_postComment comment}) async {
          await context.showDialog(
            title: '${comment.profile.name}님을 차단할까요?',
            content: '차단된 유저는 스페이스의 모든 게시물을 볼 수 없으며, 댓글을 달 수 없어요. 차단 해지는 [스페이스 설정- 독자관리]에서 가능해요.',
            confirmText: '차단',
            onConfirmed: () async {
              _mixpanel.track(
                'space:masquerade:block',
                properties: {
                  'masqueradeId': comment.masquerade?.id,
                  'spaceId': data.post.space!.id,
                },
              );
              final req = GPostScreen_Comments_BlockMasquerade_MutationReq(
                (b) => b
                  ..vars.input.masqueradeId = comment.masquerade!.id
                  ..vars.input.spaceId = data.post.space!.id,
              );
              await client.req(req);

              if (context.mounted) {
                context.toast.show('${comment.profile.name}님이 차단되었습니다.');
              }

              await client.req(
                GPostScreen_Comnments_QueryReq(
                  (b) => b..vars.permalink = widget.permalink,
                ),
              );
            },
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
                    BottomMenuItem(
                      icon: Tabler.user_x,
                      iconColor: BrandColors.red_600,
                      title: '차단',
                      color: BrandColors.red_600,
                      onTap: () => onBlock(comment: comment),
                    ),
                  ],
          );
        }

        Future<void> onSubmit() async {
          final value = _textController.text;
          if (value.isEmpty) {
            return;
          }

          _focusNode.unfocus();

          _mixpanel.track(
            'comment:create',
            properties: {
              'postId': data.post.id,
            },
          );
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

          if (_scrollController.hasClients) {
            await _scrollController.animateTo(
              _scrollController.position.maxScrollExtent,
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
            );
          }
        }

        return Column(
          children: [
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
                          padding: const Pad(bottom: 32),
                          physics: const AlwaysScrollableScrollPhysics(
                            parent: BouncingScrollPhysics(),
                          ),
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
                        child: TextField(
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
    );
  }
}

class _PasswordedPostGuard extends StatefulWidget {
  const _PasswordedPostGuard({
    required this.onSubmit,
  });

  final Future<void> Function(String password) onSubmit;

  @override
  createState() => _PasswordedPostGuardState();
}

class _PasswordedPostGuardState extends State<_PasswordedPostGuard> {
  final _controller = TextEditingController();
  String? validationMessage;

  @override
  Widget build(BuildContext context) {
    onSubmit(String? value) async {
      if (value != null && value.isNotEmpty) {
        await widget.onSubmit(value).catchError((error) {
          if (error is FormValidationError) {
            validationMessage = error.message;
            setState(() {});
          }
        });
        _controller.clear();
      }
    }

    return Center(
      child: Padding(
        padding: const Pad(vertical: 80),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 300),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                TablerBold.lock,
                size: 34,
                color: Color(0xFFC7C7C7),
              ),
              const Gap(10),
              const Text(
                '비밀글',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                  color: BrandColors.gray_800,
                ),
              ),
              const Gap(18),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 255),
                child: FormTextField(
                  hintText: '비밀번호를 입력해주세요',
                  name: 'password',
                  autofocus: true,
                  controller: _controller,
                  keyboardType: TextInputType.visiblePassword,
                  textInputAction: TextInputAction.done,
                  onSubmitted: onSubmit,
                  obscureText: true,
                  autovalidateMode: AutovalidateMode.always,
                  validators: [
                    (value) {
                      if (validationMessage != null) {
                        return validationMessage;
                      }
                      return null;
                    },
                  ],
                ),
              ),
              const Gap(24),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 254),
                child: Btn(
                  '확인',
                  onPressed: () async {
                    await onSubmit(_controller.text);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
