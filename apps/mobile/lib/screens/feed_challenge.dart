import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/thumbnail_post_card.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/feed_challenge_screen_query.req.gql.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class FeedChallengeScreen extends StatefulWidget {
  const FeedChallengeScreen({super.key});

  @override
  createState() => _FeedChallengeScreenState();
}

class _FeedChallengeScreenState extends State<FeedChallengeScreen> {
  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: GFeedChallengeScreen_QueryReq(),
      builder: (context, client, data) {
        final posts = data.challengeFeed;

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
