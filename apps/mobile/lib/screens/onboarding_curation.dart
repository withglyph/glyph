import 'dart:async';
import 'dart:math';

import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_randomcolor/flutter_randomcolor.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/extensions/color.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/onboarding_curation_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class OnboardingCurationScreen extends ConsumerStatefulWidget {
  const OnboardingCurationScreen({super.key});

  @override
  createState() => _OnboardingCurationScreenState();
}

class _OnboardingCurationScreenState extends ConsumerState<OnboardingCurationScreen> {
  final Set<String> _selectedTagIds = {};
  bool get _isValid => _selectedTagIds.length >= 2;

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
      bottomBorder: false,
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
            await context.router.navigate(const MainRouter());
          },
        ),
      ],
      child: GraphQLOperation(
        operation: req,
        builder: (context, client, data) {
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
                    client.req(newReq).then((value) {
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
                                  if (_selectedTagIds.contains(tag.id)) ...[
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
                            onPressed: () {
                              setState(() {
                                if (_selectedTagIds.contains(tag.id)) {
                                  _selectedTagIds.remove(tag.id);
                                } else {
                                  _selectedTagIds.add(tag.id);
                                }
                              });
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
                  child: Box(
                    color: _isValid ? BrandColors.gray_900 : BrandColors.gray_150,
                    child: SafeArea(
                      child: Stack(
                        children: [
                          Box(
                            alignment: Alignment.center,
                            padding: const Pad(vertical: 15),
                            child: Text(
                              '다음',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: _isValid ? BrandColors.gray_0 : BrandColors.gray_400,
                              ),
                            ),
                          ),
                          if (_selectedTagIds.isNotEmpty)
                            Positioned(
                              top: 15,
                              left: 20,
                              child: Container(
                                width: 24,
                                height: 24,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: _isValid ? BrandColors.gray_0 : BrandColors.gray_400,
                                ),
                                child: Text(
                                  '${_selectedTagIds.length}',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w900,
                                    color: _isValid ? BrandColors.gray_900 : BrandColors.gray_0,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
