import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/thumbnail_post_card.dart';
import 'package:glyph/context/bottom_menu.dart';
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
  bool _showBottomBorder = false;
  _FeedType _selectedFeedType = _FeedType.recommended;

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      appBar: Heading(
        bottomBorder: _showBottomBorder,
        leading: Pressable(
          child: Row(
            children: [
              Text(
                switch (_selectedFeedType) {
                  _FeedType.recommended => '추천',
                  _FeedType.following => '구독',
                  _FeedType.challenge => '챌린지'
                },
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const Gap(4),
              const Icon(Tabler.chevron_down, size: 16),
            ],
          ),
          onPressed: () async {
            await context.showBottomSelectMenu(
              title: '피드',
              value: _selectedFeedType,
              items: [
                BottomSelectMenuItem(label: '추천', value: _FeedType.recommended),
                BottomSelectMenuItem(label: '구독', value: _FeedType.following),
                BottomSelectMenuItem(label: '챌린지', value: _FeedType.challenge),
              ],
              onSelected: (value) {
                setState(() {
                  _selectedFeedType = value;
                });
              },
            );
          },
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
          final posts = switch (_selectedFeedType) {
            _FeedType.recommended => data.recommendFeed,
            _FeedType.following => data.followingFeed,
            _FeedType.challenge => data.challengeFeed,
          };

          return NotificationListener<ScrollUpdateNotification>(
            onNotification: (notification) {
              final showBottomBorder = notification.metrics.pixels > 0;
              if (showBottomBorder != _showBottomBorder) {
                setState(() {
                  _showBottomBorder = showBottomBorder;
                });
              }

              return false;
            },
            child: ListView.separated(
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
            ),
          );
        },
      ),
    );
  }
}

enum _FeedType {
  recommended,
  following,
  challenge,
}
