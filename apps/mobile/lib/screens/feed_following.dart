import 'dart:async';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/thumbnail_post_card.dart';
import 'package:glyph/const.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/feed_following_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class FeedFollowingScreen extends StatefulWidget {
  const FeedFollowingScreen({super.key});

  @override
  createState() => _FeedFollowingScreenState();
}

class _FeedFollowingScreenState extends State<FeedFollowingScreen> {
  int _page = 1;
  bool _fetching = false;
  bool _eol = false;

  final req = GFeedFollowingScreen_QueryReq(
    (b) => b
      ..requestId = 'FeedFollowingScreen_Query'
      ..vars.page = 1
      ..vars.take = kPaginationSize,
  );

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: req,
      builder: (context, client, data) {
        final posts = data.followingFeed;

        return NotificationListener<ScrollUpdateNotification>(
          onNotification: (notification) {
            if (notification.metrics.extentAfter <= 200) {
              if (!_fetching && !_eol) {
                _fetching = true;
                final newReq = req.rebuild(
                  (b) => b
                    ..vars.page = ++_page
                    ..updateResult = (previous, result) =>
                        previous?.rebuild((b) => b..followingFeed.addAll(result?.followingFeed ?? [])),
                );

                unawaited(
                  client.req(newReq).then((value) {
                    _fetching = false;
                    if (value.followingFeed.isEmpty) {
                      _eol = true;
                    }
                  }),
                );
              }
            }

            return false;
          },
          child: posts.isEmpty
              ? const EmptyState(
                  icon: TablerBold.planet_off,
                  title: '아직 구독한 피드가 없어요',
                  description: '마음에 드는 스페이스나 태그를 구독하면 여기에 나타나요',
                )
              : ListView.separated(
                  physics: const AlwaysScrollableScrollPhysics(
                    parent: BouncingScrollPhysics(),
                  ),
                  itemCount: posts.length,
                  itemBuilder: (context, index) {
                    return ThumbnailPostCard(
                      posts[index],
                      padding: const Pad(all: 20),
                    );
                  },
                  separatorBuilder: (context, index) {
                    return const Padding(
                      padding: Pad(horizontal: 20),
                      child: HorizontalDivider(color: BrandColors.gray_50),
                    );
                  },
                ),
        );
      },
    );
  }
}
