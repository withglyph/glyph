import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/button.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/post_screen_query.req.gql.dart';
import 'package:glyph/routers/app.gr.dart';
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

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      title: '포스트',
      child: GraphQLOperation(
        operation: GPostScreen_QueryReq(
          (b) => b..vars.permalink = widget.permalink,
        ),
        builder: (context, client, data) {
          return Column(
            children: [
              Button(
                child: const Text('open'),
                onPressed: () {
                  context.router.push(PostRoute(permalink: '1748834474'));
                },
              ),
              Expanded(
                child: WebView(
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
                          presentationStyle: ModalPresentationStyle.FULL_SCREEN,
                        ),
                      );
                      return NavigationActionPolicy.CANCEL;
                    }

                    return NavigationActionPolicy.ALLOW;
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
