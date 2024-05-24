import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/post_screen_query.req.gql.dart';
import 'package:glyph/shells/default.dart';

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

    _scrollController.addListener(() {
      print(_scrollController.offset);
    });
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
            child: SingleChildScrollView(
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
                    onJsMessage: (message, reply) async {
                      if (message['type'] == 'ready') {
                        await reply({
                          'type': 'content',
                          'content': data.post.publishedRevision!.content.value
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
                  // Container(
                  //   width: double.infinity,
                  //   height: 85,
                  //   decoration: const BoxDecoration(
                  //     color: BrandColors.gray_0,
                  //     border:
                  //         Border(top: BorderSide(color: BrandColors.gray_200)),
                  //   ),
                  //   child: const SafeArea(
                  //     child: Text('무언가 보여드리겠습니다'),
                  //   ),
                  // ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
