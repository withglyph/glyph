import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/post_card.dart';
import 'package:glyph/components/pull_to_refresh.dart';
import 'package:glyph/emojis/data.dart';
import 'package:glyph/emojis/emoji.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/archive_emojis_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class ArchiveEmojisScreen extends ConsumerWidget {
  ArchiveEmojisScreen({super.key});

  final operation = GArchiveEmojisScreen_QueryReq();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GraphQLOperation(
      operation: operation,
      builder: (context, client, data) {
        final posts = data.me!.emojiReactedPosts;

        return PullToRefresh.listView(
          itemCount: posts.length,
          itemBuilder: (context, index) {
            final post = posts[index];

            return Padding(
              padding: const Pad(top: 16, bottom: 18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const Pad(horizontal: 20),
                    child: UnconstrainedBox(
                      clipBehavior: Clip.hardEdge,
                      alignment: Alignment.centerLeft,
                      child: Row(
                        children: [
                          ...(post.reactions.length > 10 ? post.reactions.sublist(0, 10) : post.reactions)
                              .expand((b) => [if (b.mine) Emoji(Emojis.fromShortCode(b.emoji))])
                              .intersperse(const Gap(2)),
                          if (post.reactions.length > 10)
                            Text(
                              '...+${post.reactions.length - 10}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                                color: BrandColors.gray_500,
                              ),
                            ),
                          const Text(
                            ' 남김',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: BrandColors.gray_500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Gap(4),
                  PostCard(
                    post,
                    padding: const Pad(horizontal: 20),
                    dots: false,
                  ),
                ],
              ),
            );
          },
          separatorBuilder: (context, index) {
            return const Padding(
              padding: Pad(horizontal: 20),
              child: HorizontalDivider(color: BrandColors.gray_50),
            );
          },
          onRefresh: () async {
            await client.request(operation);
          },
          emptyWidget: const EmptyState(
            icon: TablerBold.mood_off,
            title: '아직 이모지를 남긴 포스트가 없어요',
            description: '마음에 드는 포스트에 이모지 반응을 남겨보세요.\n다양한 반응은 창작자에게 큰 힘이 됩니다.',
          ),
        );
      },
    );
  }
}
