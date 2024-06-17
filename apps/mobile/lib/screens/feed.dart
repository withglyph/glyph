import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/post_card.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/pull_to_refresh.dart';
import 'package:glyph/components/svg_icon.dart';
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
      appBar: Heading(
        title: const Text(
          '구독',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
        ),
        actions: [
          Pressable(
            child: const SvgIcon('settings'),
            onPressed: () async {
              await context.router.push(
                WebViewRoute(
                  title: '구독 관리',
                  path: '/me/subscribes',
                ),
              );
            },
          ),
        ],
      ),
      body: GraphQLOperation(
        operation: GFeedScreen_QueryReq(),
        builder: (context, client, data) {
          final posts = data.followingFeed;

          return PullToRefresh(
            onRefresh: () async {
              await client.req(GFeedScreen_QueryReq());
            },
            child: ListView.separated(
              itemCount: posts.length,
              itemBuilder: (context, index) {
                return PostCard(
                  posts[index],
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 18,
                  ),
                );
              },
              separatorBuilder: (context, index) {
                return const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20),
                  child: HorizontalDivider(color: BrandColors.gray_50),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
