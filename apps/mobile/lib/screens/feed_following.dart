import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/thumbnail_post_card.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/feed_following_screen_query.req.gql.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class FeedFollowingScreen extends StatefulWidget {
  const FeedFollowingScreen({super.key});

  @override
  createState() => _FeedFollowingScreenState();
}

class _FeedFollowingScreenState extends State<FeedFollowingScreen> {
  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: GFeedFollowingScreen_QueryReq(),
      builder: (context, client, data) {
        final posts = data.followingFeed;

        return ListView.separated(
          physics: const AlwaysScrollableScrollPhysics(
            parent: BouncingScrollPhysics(),
          ),
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
        );
      },
    );
  }
}
