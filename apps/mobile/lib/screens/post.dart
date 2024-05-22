import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/webview.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/post_screen_query.req.gql.dart';
import 'package:glyph/shells/default.dart';

@RoutePage()
class PostScreen extends ConsumerWidget {
  const PostScreen({super.key, required this.permalink});

  final String permalink;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultShell(
      title: '포스트',
      child: GraphQLOperation(
        operation: GPostScreen_QueryReq(
          (b) => b..vars.permalink = permalink,
        ),
        builder: (context, client, data) {
          return WebView(
            path: '/_webview/tiptap-renderer',
            onJsMessage: (message, reply) async {
              if (message['type'] == 'ready') {
                await reply({
                  'type': 'content',
                  'content': data.post.publishedRevision!.content.value
                });
              }
            },
          );
        },
      ),
    );
  }
}
