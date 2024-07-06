import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/thumbnail_post_card.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/graphql/__generated__/space_posts_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class SpacePostsScreen extends ConsumerWidget {
  const SpacePostsScreen({
    @PathParam.inherit() required this.slug,
    super.key,
  });

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GraphQLOperation(
      operation: GSpacePostsScreen_QueryReq(
        (b) => b..vars.slug = slug,
      ),
      builder: (context, client, data) {
        final posts = data.space.posts;

        return data.space.visibility == GSpaceVisibility.PRIVATE && data.space.meAsMember == null
            ? const EmptyState(
                icon: TablerBold.planet_off,
                title: '비공개 스페이스에요',
                description: '이 스페이스는 작성자에 의해 비공개 설정되었어요',
              )
            : posts.isEmpty
                ? EmptyState(
                    icon: TablerBold.notes_off,
                    title: '아직 포스트가 없어요',
                    description:
                        data.space.meAsMember == null ? '스페이스를 구독하면 새로운 포스트가\n올라올 때 알림을 받을 수 있어요' : '원하는 포스트를 작성해보세요',
                  )
                : CustomScrollView(
                    key: const PageStorageKey<String>('space-posts'),
                    physics: const AlwaysScrollableScrollPhysics(
                      parent: BouncingScrollPhysics(),
                    ),
                    slivers: [
                      SliverList.separated(
                        itemCount: posts.length,
                        itemBuilder: (context, index) {
                          final post = posts[index];

                          return ThumbnailPostCard(
                            post,
                            padding: const Pad(horizontal: 20, vertical: 18),
                          );
                        },
                        separatorBuilder: (context, index) {
                          return const Padding(
                            padding: Pad(horizontal: 20),
                            child: HorizontalDivider(color: BrandColors.gray_50),
                          );
                        },
                      ),
                      const SliverGap(120),
                    ],
                  );
      },
    );
  }
}
