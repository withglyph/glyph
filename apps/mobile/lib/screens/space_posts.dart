import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/thumbnail_post_card.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/space_posts_screen_query.req.gql.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class SpacePostsScreen extends ConsumerWidget {
  const SpacePostsScreen({required this.slug, super.key});

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GraphQLOperation(
      operation: GSpacePostsScreen_QueryReq((b) => b..vars.slug = slug),
      builder: (context, client, data) {
        final posts = data.space.posts;

        return ListView.separated(
          itemCount: posts.length,
          shrinkWrap: true,
          physics: const AlwaysScrollableScrollPhysics(
            parent: BouncingScrollPhysics(),
          ),
          itemBuilder: (context, index) {
            final post = posts[index];

            return ThumbnailPostCard(
              post,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
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
