import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/Img.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/components/webview.dart';
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
import 'package:glyph/themes/colors.dart';
import 'package:jiffy/jiffy.dart';
import 'package:mixpanel_flutter/mixpanel_flutter.dart';
import 'package:share_plus/share_plus.dart';

@RoutePage()
class PostScreen extends ConsumerStatefulWidget {
  const PostScreen({super.key, @PathParam() required this.permalink});

  final String permalink;

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _PostScreenState();
}

class _PostScreenState extends ConsumerState<PostScreen>
    with SingleTickerProviderStateMixin {
  final _mixpanel = GetIt.I<Mixpanel>();
  final _browser = ChromeSafariBrowser();

  late AnimationController _scrollAnimationController;
  late Animation<double> _bottomBarHeightAnimation;

  bool _showBars = true;

  @override
  void initState() {
    super.initState();

    _scrollAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 100),
      value: 1,
    );

    final curve = CurvedAnimation(
      parent: _scrollAnimationController,
      curve: Curves.linear,
    );

    _bottomBarHeightAnimation = Tween<double>(
      begin: 0,
      end: 44,
    ).animate(curve);
  }

  @override
  Widget build(BuildContext context) {
    final safeAreaBottomHeight = MediaQuery.of(context).padding.bottom;

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        toolbarHeight: 0,
      ),
      body: GraphQLOperation(
        operation: GPostScreen_QueryReq(
          (b) => b..vars.permalink = widget.permalink,
        ),
        onDataLoaded: (context, client, data) async {
          _mixpanel.track('post:view', properties: {
            'postId': data.post.id,
          });

          final req = GPostScreen_UpdatePostView_MutationReq(
            (b) => b..vars.input.postId = data.post.id,
          );
          await client.req(req);
        },
        builder: (context, client, data) {
          return SizedBox.expand(
            child: Stack(
              fit: StackFit.passthrough,
              children: [
                NotificationListener<ScrollNotification>(
                  onNotification: (notification) {
                    if (notification.metrics.pixels <= 0 && !_showBars) {
                      setState(() {
                        _showBars = true;
                      });

                      return false;
                    }

                    if (notification is UserScrollNotification) {
                      if (notification.direction == ScrollDirection.forward &&
                          !_showBars) {
                        setState(() {
                          _showBars = true;
                        });
                      } else if (notification.direction ==
                              ScrollDirection.reverse &&
                          _showBars) {
                        setState(() {
                          _showBars = false;
                        });
                      }
                    }

                    return false;
                  },
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    child: Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const Gap(44),
                              Text(
                                data.post.publishedRevision!.title ?? '(제목 없음)',
                                overflow: TextOverflow.ellipsis,
                                maxLines: 2,
                                style: const TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              if (data.post.publishedRevision!.subtitle != null)
                                Text(
                                  data.post.publishedRevision!.subtitle!,
                                  overflow: TextOverflow.ellipsis,
                                  maxLines: 2,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              const Gap(20),
                              Row(
                                children: [
                                  Stack(
                                    children: [
                                      Img(
                                        data.post.space!.icon,
                                        width: 42,
                                        height: 42,
                                      ),
                                      Positioned(
                                        bottom: 0,
                                        right: 0,
                                        child: Transform.translate(
                                          offset: const Offset(4, 4),
                                          child: Img(
                                            data.post.member!.profile.avatar,
                                            width: 26,
                                            height: 26,
                                            borderRadius: 12,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Gap(12),
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        data.post.space!.name,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          color: BrandColors.gray_600,
                                        ),
                                      ),
                                      Text(
                                        'by ${data.post.member!.profile.name}',
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          color: BrandColors.gray_600,
                                        ),
                                      ),
                                      const Gap(4),
                                      Text(
                                        Jiffy.parse(
                                          data.post.publishedAt!.value,
                                        ).format(
                                          pattern: 'yyyy년 MM월 dd일',
                                        ),
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w300,
                                          color: BrandColors.gray_500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const Gap(20),
                              const HorizontalDivider(),
                              const Gap(20),
                            ],
                          ),
                        ),
                        WebView(
                          path: '/_webview/tiptap-renderer',
                          fitToContent: true,
                          onJsMessage: (message, reply) async {
                            if (message['type'] == 'ready') {
                              await reply({
                                'type': 'content',
                                'content':
                                    data.post.publishedRevision!.content.value
                              });

                              await reply({
                                'type': 'info',
                                'permalink': widget.permalink,
                                'revisionId': data.post.publishedRevision!.id,
                              });
                            }
                          },
                          onNavigate: (controller, navigationAction) async {
                            if (navigationAction.navigationType ==
                                NavigationType.LINK_ACTIVATED) {
                              await _browser.open(
                                url: navigationAction.request.url,
                                settings: ChromeSafariBrowserSettings(
                                  barCollapsingEnabled: true,
                                  dismissButtonStyle: DismissButtonStyle.CLOSE,
                                  enableUrlBarHiding: true,
                                  presentationStyle:
                                      ModalPresentationStyle.FULL_SCREEN,
                                ),
                              );

                              return NavigationActionPolicy.CANCEL;
                            }

                            return NavigationActionPolicy.ALLOW;
                          },
                        ),
                        const Gap(100),
                      ],
                    ),
                  ),
                ),
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 150),
                  curve: Curves.easeInOut,
                  top: _showBars ? 0 : -44,
                  left: 0,
                  right: 0,
                  child: Container(
                    height: 44,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    decoration: const BoxDecoration(
                      color: BrandColors.gray_0,
                      border: Border(
                        bottom: BorderSide(
                          color: BrandColors.gray_100,
                          width: 1,
                        ),
                      ),
                    ),
                    child: NavigationToolbar(
                      leading: AutoLeadingButton(
                        builder: (context, leadingType, action) {
                          if (leadingType == LeadingType.noLeading) {
                            return const SizedBox.shrink();
                          }

                          return Pressable(
                            child: SvgIcon(
                              switch (leadingType) {
                                LeadingType.back => 'arrow-left',
                                LeadingType.close => 'x',
                                _ => throw UnimplementedError(),
                              },
                            ),
                            onPressed: () => action?.call(),
                          );
                        },
                      ),
                      middle: Text(
                        data.post.publishedRevision!.title ?? '(제목 없음)',
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: BrandColors.gray_800,
                        ),
                      ),
                      centerMiddle: false,
                      trailing: Row(mainAxisSize: MainAxisSize.min, children: [
                        Pressable(
                          child: const SvgIcon('share-3'),
                          onPressed: () {
                            Share.shareUri(Uri.parse(
                              'https://glph.to/${data.post.shortlink}',
                            ));
                          },
                        ),
                        const Gap(16),
                        Pressable(
                          child: SvgIcon(
                            data.post.bookmarkGroups.isEmpty
                                ? 'bookmark'
                                : 'bookmark-filled',
                          ),
                          onPressed: () async {
                            if (data.post.bookmarkGroups.isEmpty) {
                              final req = GPostScreen_BookmarkPost_MutationReq(
                                (b) => b..vars.input.postId = data.post.id,
                              );
                              await client.req(req);
                            } else {
                              final req =
                                  GPostScreen_UnbookmarkPost_MutationReq(
                                (b) => b
                                  ..vars.input.postId = data.post.id
                                  ..vars.input.bookmarkGroupId =
                                      data.post.bookmarkGroups.first.id,
                              );
                              await client.req(req);
                            }
                          },
                        ),
                        const Gap(16),
                        const SvgIcon('dots-vertical'),
                      ]),
                    ),
                  ),
                ),
                AnimatedPositioned(
                  duration: const Duration(milliseconds: 150),
                  curve: Curves.easeInOut,
                  left: 0,
                  right: 0,
                  bottom: _showBars ? 0 : -44 - safeAreaBottomHeight,
                  child: Container(
                    // height: _bottomBarHeightAnimation.value,
                    decoration: const BoxDecoration(
                      color: BrandColors.gray_0,
                      border: Border(
                        top: BorderSide(color: BrandColors.gray_100),
                      ),
                    ),
                    child: SafeArea(
                      child: Container(
                        // height: 44,
                        height: _bottomBarHeightAnimation.value,
                        child: Row(
                          children: [
                            Pressable(
                              child: const SizedBox(
                                width: 60,
                                child: Center(child: SvgIcon('list', size: 22)),
                              ),
                              onPressed: () {},
                            ),
                            Pressable(
                              child: Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 5),
                                child: Row(
                                  children: [
                                    const SvgIcon('mood-heart', size: 22),
                                    const Gap(3),
                                    Text(
                                      data.post.reactionCount.toString(),
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              onPressed: () {},
                            ),
                            const Gap(16),
                            Pressable(
                              child: Padding(
                                padding:
                                    const EdgeInsets.symmetric(horizontal: 5),
                                child: Row(
                                  children: [
                                    const SvgIcon('message-circle', size: 22),
                                    const Gap(3),
                                    Text(
                                      data.post.commentCount.toString(),
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              onPressed: () {
                                showModalBottomSheet(
                                  context: context,
                                  backgroundColor: BrandColors.gray_0,
                                  isScrollControlled: true,
                                  useSafeArea: true,
                                  builder: (context) {
                                    return Container(
                                      width: double.infinity,
                                      height: double.infinity,
                                      child: SafeArea(
                                        child: Comments(
                                          permalink: widget.permalink,
                                        ),
                                      ),
                                    );
                                  },
                                );
                              },
                            ),
                            const Spacer(),
                            Pressable(
                              child: const SizedBox(
                                width: 60,
                                child: Center(
                                  child: SvgIcon('chevron-left', size: 22),
                                ),
                              ),
                              onPressed: () {},
                            ),
                            Pressable(
                              child: const SizedBox(
                                width: 60,
                                child: Center(
                                  child: SvgIcon('chevron-right', size: 22),
                                ),
                              ),
                              onPressed: () {},
                            ),
                          ],
                        ),
                      ),
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

class Comments extends ConsumerStatefulWidget {
  const Comments({super.key, required this.permalink});

  final String permalink;

  @override
  createState() => _CommentsState();
}

class _CommentsState extends ConsumerState<Comments>
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
    return GraphQLOperation(
      operation: GPostScreen_Comnments_QueryReq(
        (b) => b..vars.permalink = widget.permalink,
      ),
      builder: (context, client, data) {
        final isCommentEnabled =
            data.post.commentQualification == GPostCommentQualification.ANY ||
                (data.post.commentQualification ==
                        GPostCommentQualification.IDENTIFIED &&
                    data.me!.personalIdentity != null);

        Future<void> _onSubmit() async {
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
          await client.req(GPostScreen_Comnments_QueryReq(
            (b) => b..vars.permalink = widget.permalink,
          ));

          _textController.clear();
          setState(() {
            _isEmpty = true;
          });

          _scrollController.animateTo(
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
                    width: 1,
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
                    child: const SvgIcon('x'),
                    onPressed: () {
                      context.router.maybePop();
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

                  return StatefulBuilder(builder: (context, setState) {
                    bool showReply = false;

                    return Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                comment.profile.name,
                                style: const TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: BrandColors.gray_800,
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
                                Jiffy.parse(comment.createdAt.value).format(
                                  pattern: 'yyyy.MM.dd HH:mm',
                                ),
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: BrandColors.gray_400,
                                ),
                              ),
                              const Spacer(),
                              const SvgIcon(
                                'dots-vertical',
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
                                          const SvgIcon(
                                            'message',
                                            size: 20,
                                            color: BrandColors.gray_500,
                                          ),
                                          if (comment.children.length > 0) ...[
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
                                          comment.liked
                                              ? const SvgIcon(
                                                  'heart-filled',
                                                  size: 20,
                                                )
                                              : const SvgIcon(
                                                  'heart',
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
                              // const Spacer(),
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
                                            data.post.member!.profile.avatar,
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
                                        child: const SvgIcon(
                                          'heart-filled',
                                          size: 16,
                                        ),
                                      ),
                                    ),
                                  ],
                                )
                            ],
                          ),
                        ],
                      ),
                    );
                  });
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
                    width: 1,
                  ),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    data.post.space!.myMasquerade?.profile.name ??
                        data.post.space!.meAsMember?.profile.name ??
                        '(알 수 없음)',
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
                                    width: 1,
                                  ),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                                focusedBorder: OutlineInputBorder(
                                  borderSide: const BorderSide(
                                    color: BrandColors.gray_100,
                                    width: 1,
                                  ),
                                  borderRadius: BorderRadius.circular(2),
                                ),
                                disabledBorder: OutlineInputBorder(
                                  borderSide: const BorderSide(
                                    color: BrandColors.gray_100,
                                    width: 1,
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
                                            GPostCommentQualification.IDENTIFIED
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
                              onSubmitted: (value) {
                                _onSubmit();
                              },
                            );
                          },
                        ),
                      ),
                      const Gap(8),
                      Pressable(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          child: SvgIcon(
                            'send-2',
                            color: _isEmpty
                                ? BrandColors.gray_400
                                : BrandColors.brand_600,
                          ),
                        ),
                        onPressed: _onSubmit,
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
