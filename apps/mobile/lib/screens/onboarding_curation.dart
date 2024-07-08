import 'dart:async';
import 'dart:math';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_randomcolor/flutter_randomcolor.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/heading.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/const.dart';
import 'package:glyph/extensions/color.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/feed_recommend_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/onboarding_curation_screen_complete_onboarding_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/onboarding_curation_screen_follow_tag_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/onboarding_curation_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/onboarding_curation_screen_unfollow_tag_mutation.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:mixpanel_flutter/mixpanel_flutter.dart';

@RoutePage()
class OnboardingCurationScreen extends ConsumerStatefulWidget {
  const OnboardingCurationScreen({super.key});

  @override
  createState() => _OnboardingCurationScreenState();
}

class _OnboardingCurationScreenState extends ConsumerState<OnboardingCurationScreen> {
  final _mixpanel = GetIt.I<Mixpanel>();

  int _page = 1;
  bool _fetching = false;
  bool _eol = false;

  final _randomColors = RandomColor.getColor(
    Options(
      count: 100,
      format: Format.hex,
      luminosity: Luminosity.light,
    ),
  );

  final req = GOnboardingCurationScreen_QueryReq(
    (b) => b
      ..requestId = 'OnboardingCurationScreen_Query'
      ..vars.page = 1
      ..vars.take = 20
      ..vars.seed = Random().nextInt(1000),
  );

  @override
  Widget build(BuildContext context) {
    return DefaultShell(
      appBar: Heading(
        bottomBorder: false,
        leading: const SizedBox.shrink(),
        actions: [
          Pressable(
            child: const Text(
              'SKIP',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: BrandColors.gray_500,
              ),
            ),
            onPressed: () async {
              await _completeOnboarding();
            },
          ),
        ],
      ),
      child: GraphQLOperation(
        operation: req,
        builder: (context, client, data) {
          final followedCount = data.recommendedTags.where((tag) => tag.followed).length;

          return NotificationListener<ScrollUpdateNotification>(
            onNotification: (notification) {
              if (notification.metrics.extentAfter <= 400) {
                if (!_fetching && !_eol) {
                  _fetching = true;
                  final newReq = req.rebuild(
                    (b) => b
                      ..vars.page = ++_page
                      ..updateResult = (previous, result) =>
                          previous?.rebuild((b) => b..recommendedTags.addAll(result?.recommendedTags ?? [])),
                  );

                  unawaited(
                    client.request(newReq).then((value) {
                      _fetching = false;
                      if (data.recommendedTags.length == value.recommendedTags.length) {
                        _eol = true;
                      }
                    }),
                  );
                }
              }

              return false;
            },
            child: Stack(
              children: [
                Padding(
                  padding: const Pad(horizontal: 20),
                  child: CustomScrollView(
                    physics: const AlwaysScrollableScrollPhysics(
                      parent: BouncingScrollPhysics(),
                    ),
                    slivers: [
                      const SliverGap(16),
                      const SliverToBoxAdapter(
                        child: Text(
                          '취향에 맞는 콘텐츠를 만나보세요!',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
                        ),
                      ),
                      const SliverGap(6),
                      const SliverToBoxAdapter(
                        child: Text(
                          '관심 있는 작품 태그를 2개 이상\n선택하면 취향에 맞는 콘텐츠를 볼 수 있어요',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 14, color: BrandColors.gray_500),
                        ),
                      ),
                      const SliverGap(32),
                      SliverGrid.builder(
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 4 / 5,
                          mainAxisSpacing: 9,
                          crossAxisSpacing: 9,
                        ),
                        itemBuilder: (context, index) {
                          final tag = data.recommendedTags.elementAtOrNull(index);
                          if (tag == null) {
                            return null;
                          }

                          return Pressable(
                            child: Container(
                              clipBehavior: Clip.antiAlias,
                              decoration: BoxDecoration(
                                color: HexColor.fromHex(_randomColors[index % _randomColors.length]),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Stack(
                                children: [
                                  if (tag.thumbnail != null)
                                    LayoutBuilder(
                                      builder: (context, constraints) {
                                        return Img(
                                          tag.thumbnail,
                                          width: constraints.maxWidth,
                                          height: constraints.maxHeight,
                                        );
                                      },
                                    ),
                                  if (tag.followed) ...[
                                    Positioned.fill(
                                      child: ColoredBox(color: BrandColors.gray_900.withOpacity(0.8)),
                                    ),
                                    const Positioned(
                                      top: 12,
                                      left: 12,
                                      child: Icon(Tabler.heart_filled, size: 28, color: BrandColors.gray_0),
                                    ),
                                  ] else
                                    Positioned.fill(child: ColoredBox(color: BrandColors.gray_900.withOpacity(0.15))),
                                  Positioned(
                                    top: 0,
                                    bottom: 0,
                                    left: 20,
                                    right: 20,
                                    child: Center(
                                      child: Text(
                                        '#${tag.name}',
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w700,
                                          color: BrandColors.gray_0,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            onPressed: () async {
                              if (tag.followed) {
                                _mixpanel.track('tag:unfollow', properties: {'via': 'onboarding-curation-screen'});

                                final req = GOnboardingCurationScreen_UnfollowTag_MutationReq(
                                  (b) => b..vars.input.tagId = tag.id,
                                );
                                await client.request(req);
                              } else {
                                _mixpanel.track('tag:follow', properties: {'via': 'onboarding-curation-screen'});

                                final req = GOnboardingCurationScreen_FollowTag_MutationReq(
                                  (b) => b..vars.input.tagId = tag.id,
                                );
                                await client.request(req);
                              }
                            },
                          );
                        },
                      ),
                      const SliverGap(150),
                    ],
                  ),
                ),
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: Pressable(
                    child: Box(
                      color: followedCount > 0 ? BrandColors.gray_900 : BrandColors.gray_150,
                      child: SafeArea(
                        child: Stack(
                          children: [
                            Box(
                              alignment: Alignment.center,
                              padding: const Pad(vertical: 15),
                              child: Text(
                                '완료',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: followedCount > 0 ? BrandColors.gray_0 : BrandColors.gray_400,
                                ),
                              ),
                            ),
                            if (followedCount > 0)
                              Positioned(
                                top: 15,
                                left: 20,
                                child: Container(
                                  width: 24,
                                  height: 24,
                                  alignment: Alignment.center,
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: followedCount > 0 ? BrandColors.gray_0 : BrandColors.gray_400,
                                  ),
                                  child: Text(
                                    '$followedCount',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w900,
                                      color: followedCount > 0 ? BrandColors.gray_900 : BrandColors.gray_0,
                                    ),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                    onPressed: () async {
                      if (followedCount == 0) {
                        return;
                      }

                      await _completeOnboarding();
                    },
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _completeOnboarding() async {
    final client = ref.read(ferryProvider.notifier);

    _mixpanel.track('onboarding:complete');

    final req = GOnboardingCurationScreen_CompleteOnboarding_MutationReq();
    await client.request(req);

    final req2 = GFeedRecommendScreen_QueryReq(
      (b) => b
        ..requestId = 'FeedRecommendScreen_Query'
        ..vars.page = 1
        ..vars.take = kPaginationSize
        ..vars.seed = Random().nextInt(1000),
    );
    await client.request(req2);

    if (mounted) {
      await context.router.maybePop();
    }
  }
}
