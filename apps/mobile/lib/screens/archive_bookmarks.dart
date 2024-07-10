import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/post_card.dart';
import 'package:glyph/components/pull_to_refresh.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/archive_bookmarks_screen_query.data.gql.dart';
import 'package:glyph/graphql/__generated__/archive_bookmarks_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class ArchiveBookmarksScreen extends ConsumerWidget {
  ArchiveBookmarksScreen({super.key});

  final operation = GArchiveBookmarksScreen_QueryReq();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GraphQLOperation(
      operation: operation,
      builder: (context, client, data) {
        final posts = data.me!.bookmarkGroups.isNotEmpty
            ? data.me!.bookmarkGroups[0].posts.toList()
            : <GArchiveBookmarksScreen_QueryData_me_bookmarkGroups_posts>[];

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
            icon: TablerBold.bookmark_off,
            title: '아직 북마크한 포스트가 없어요',
            description: '마음에 드는 포스트를 북마크해보세요.\n포스트를 북마크하면 여기서 확인할 수 있어요.',
          ),
        );
      },
    );
  }
}
