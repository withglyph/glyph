import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/post_card.dart';
import 'package:glyph/components/pull_to_refresh.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/archive_recents_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class ArchiveRecentsScreen extends ConsumerWidget {
  ArchiveRecentsScreen({super.key});

  final operation = GArchiveRecentsScreen_QueryReq();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GraphQLOperation(
      operation: operation,
      builder: (context, client, data) {
        final posts = data.me!.recentlyViewedPosts;

        return PullToRefresh.listView(
          itemCount: posts.length,
          itemBuilder: (context, index) {
            return PostCard(
              posts[index],
              padding: const Pad(horizontal: 20, vertical: 18),
              dots: false,
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
            icon: TablerBold.book_off,
            title: '아직 둘러본 포스트가 없어요',
            description: '마음에 드는 포스트를 둘러보세요.\n최근 둘러본 포스트를 여기서 다시 확인할 수 있어요.',
          ),
        );
      },
    );
  }
}
