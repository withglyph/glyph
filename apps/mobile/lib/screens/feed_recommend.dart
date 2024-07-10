import 'dart:async';
import 'dart:math';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/pull_to_refresh.dart';
import 'package:glyph/components/thumbnail_post_card.dart';
import 'package:glyph/const.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/feed_recommend_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class FeedRecommendScreen extends StatefulWidget {
  const FeedRecommendScreen({super.key});

  @override
  createState() => _FeedRecommendScreenState();
}

class _FeedRecommendScreenState extends State<FeedRecommendScreen> {
  int _page = 1;
  bool _fetching = false;
  bool _eol = false;

  final operation = GFeedRecommendScreen_QueryReq(
    (b) => b
      ..requestId = 'FeedRecommendScreen_Query'
      ..vars.page = 1
      ..vars.take = kPaginationSize
      ..vars.seed = Random().nextInt(1000),
  );

  @override
  Widget build(BuildContext context) {
    return GraphQLOperation(
      operation: operation,
      builder: (context, client, data) {
        final posts = data.recommendFeed;

        return NotificationListener<ScrollUpdateNotification>(
          onNotification: (notification) {
            if (notification.metrics.extentAfter <= 200) {
              if (!_fetching && !_eol) {
                _fetching = true;
                final newReq = operation.rebuild(
                  (b) => b
                    ..vars.page = ++_page
                    ..updateResult = (previous, result) =>
                        previous?.rebuild((b) => b..recommendFeed.addAll(result?.recommendFeed ?? [])),
                );

                unawaited(
                  client.request(newReq).then((value) {
                    _fetching = false;
                    if (posts.length == value.recommendFeed.length) {
                      _eol = true;
                    }
                  }),
                );
              }
            }

            return false;
          },
          child: PullToRefresh.listView(
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
            onRefresh: () async {
              final newReq = operation.rebuild((b) => b..vars.seed = Random().nextInt(1000));
              await client.request(newReq);
              _page = 1;
              _eol = false;
            },
            emptyWidget: const EmptyState(
              icon: TablerBold.notes_off,
              title: '아직 추천 피드가 없어요',
              description: '마음에 드는 스페이스나 태그를 구독해보세요',
            ),
          ),
        );
      },
    );
  }
}
