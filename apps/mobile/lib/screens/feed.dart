import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/pull_to_refresh.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/feed_screen_query.req.gql.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class FeedScreen extends ConsumerWidget {
  const FeedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          '피드',
          style: TextStyle(
            fontSize: 30,
            fontWeight: FontWeight.w800,
          ),
        ),
        centerTitle: false,
        automaticallyImplyLeading: false,
        backgroundColor: BrandColors.gray_0,
        scrolledUnderElevation: 0,
      ),
      body: GraphQLOperation(
        operation: GFeedScreen_QueryReq(),
        builder: (context, client, data) {
          final posts = data.followingFeed;

          return PullToRefresh.listView(
            onRefresh: () async {
              await client.req(GFeedScreen_QueryReq());
            },
            itemCount: posts.length,
            itemBuilder: (context, index) {
              final post = posts[index];
              return ListTile(
                title: Text(post.publishedRevision!.title ?? '(제목 없음)'),
                subtitle: post.publishedRevision!.subtitle == null
                    ? null
                    : Text(post.publishedRevision!.subtitle!),
                onTap: () {
                  context.router.push(PostRoute(permalink: post.permalink));
                },
              );
            },
            emptyText: '피드가 없습니다.',
          );
        },
      ),
    );
  }
}
