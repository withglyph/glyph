import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/post_screen_bookmark_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_screen_unbookmark_post_mutation.req.gql.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:share_plus/share_plus.dart';

@RoutePage()
class PostScreen extends ConsumerStatefulWidget {
  const PostScreen({super.key, @PathParam() required this.permalink});

  final String permalink;

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _PostScreenState();
}

class _PostScreenState extends ConsumerState<PostScreen> {
  final browser = ChromeSafariBrowser();

  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      child: GraphQLOperation(
        operation: GPostScreen_QueryReq(
          (b) => b..vars.permalink = widget.permalink,
        ),
        builder: (context, client, data) {
          return SizedBox.expand(
            child: Stack(
              fit: StackFit.passthrough,
              children: [
                SingleChildScrollView(
                  controller: _scrollController,
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              data.post.publishedRevision!.title ?? '(제목 없음)',
                              style: const TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            if (data.post.publishedRevision!.subtitle != null)
                              Text(
                                data.post.publishedRevision!.subtitle!,
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            const Gap(20),
                            const Divider(),
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
                          }
                        },
                        onNavigate: (controller, navigationAction) async {
                          if (navigationAction.navigationType ==
                              NavigationType.LINK_ACTIVATED) {
                            await browser.open(
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
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: DecoratedBox(
                    decoration: const BoxDecoration(
                      color: BrandColors.gray_0,
                      border:
                          Border(top: BorderSide(color: BrandColors.gray_100)),
                    ),
                    child: SafeArea(
                      child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 12,
                          ),
                          child: Row(
                            children: [
                              Pressable(
                                child: const Padding(
                                  padding: EdgeInsets.all(5),
                                  child: SvgIcon('message-circle'),
                                ),
                                onPressed: () {
                                  context.toast.show('댓글');
                                },
                              ),
                              const Gap(16),
                              Pressable(
                                child: const Padding(
                                  padding: EdgeInsets.all(5),
                                  child: SvgIcon('mood-plus'),
                                ),
                                onPressed: () {
                                  context.toast.show('이모지');
                                },
                              ),
                              const Spacer(),
                              Pressable(
                                child: const Padding(
                                  padding: EdgeInsets.all(5),
                                  child: SvgIcon('share'),
                                ),
                                onPressed: () {
                                  Share.shareUri(Uri.parse(
                                    'https://glph.to/${data.post.shortlink}',
                                  ));
                                },
                              ),
                              const Gap(16),
                              Pressable(
                                child: Padding(
                                  padding: const EdgeInsets.all(5),
                                  child: SvgIcon(
                                      data.post.bookmarkGroups.isEmpty
                                          ? 'bookmark'
                                          : 'bookmark-filled'),
                                ),
                                onPressed: () async {
                                  if (data.post.bookmarkGroups.isEmpty) {
                                    final req =
                                        GPostScreen_BookmarkPost_MutationReq(
                                      (b) =>
                                          b..vars.input.postId = data.post.id,
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
                            ],
                          )),
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
