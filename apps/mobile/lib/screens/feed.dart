import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/pull_to_refresh.dart';
import 'package:glyph/components/thumbnail_post_card.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/feed_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class FeedScreen extends StatefulWidget {
  const FeedScreen({super.key});

  @override
  createState() => _FeedScreenState();
}

class _FeedScreenState extends State<FeedScreen> {
  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      appBar: Heading(
        leading: const Row(
          children: [
            Text(
              '추천',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
            ),
            Gap(4),
            Icon(Tabler.chevron_down, size: 16),
          ],
        ),
        actions: [
          Pressable(
            child: const Icon(Tabler.bell),
            onPressed: () async {
              await context.router.push(
                const NotificationRoute(),
              );
            },
          ),
        ],
      ),
      child: GraphQLOperation(
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
                return ThumbnailPostCard(
                  posts[index],
                  padding: const EdgeInsets.all(20),
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
