import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/btn.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/curation_screen_query.req.gql.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class CurationScreen extends ConsumerStatefulWidget {
  const CurationScreen({super.key});

  @override
  createState() => _CurationScreenState();
}

class _CurationScreenState extends ConsumerState<CurationScreen> {
  Set<String> selectedTagIds = {};

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
        operation: GCurationScreen_QueryReq(),
        builder: (context, client, data) {
          return Stack(
            children: [
              Padding(
                padding: const Pad(horizontal: 20),
                child: CustomScrollView(
                  slivers: [
                    const SliverGap(16),
                    const SliverToBoxAdapter(
                      child: Text(
                        '취향에 맞는 콘텐츠를 만나보세요!',
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
                      ),
                    ),
                    const SliverGap(4),
                    const SliverToBoxAdapter(
                      child: Text(
                        '관심 있는 작품 태그를 3개 이상 선택하면\n취향에 맞는 콘텐츠를 볼 수 있어요',
                        style: TextStyle(fontSize: 14, color: BrandColors.gray_500),
                      ),
                    ),
                    const SliverGap(32),
                    SliverGrid.builder(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        childAspectRatio: 1.4,
                        mainAxisSpacing: 10,
                        crossAxisSpacing: 10,
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
                              color: BrandColors.gray_100,
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
                                if (selectedTagIds.contains(tag.id))
                                  Positioned.fill(
                                    child: ColoredBox(color: BrandColors.gray_900.withOpacity(0.85)),
                                  )
                                else
                                  Positioned.fill(
                                    child: DecoratedBox(
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          begin: Alignment.topCenter,
                                          end: Alignment.bottomCenter,
                                          colors: [
                                            BrandColors.gray_900.withOpacity(0),
                                            BrandColors.gray_900.withOpacity(0.7),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                Positioned(
                                  left: 10,
                                  right: 14,
                                  bottom: 8,
                                  child: Text(
                                    '#${tag.name}',
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      color: BrandColors.gray_0,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          onPressed: () {
                            setState(() {
                              if (selectedTagIds.contains(tag.id)) {
                                selectedTagIds.remove(tag.id);
                              } else {
                                selectedTagIds.add(tag.id);
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
                child: Container(
                  decoration: BoxDecoration(
                    color: BrandColors.gray_0,
                    boxShadow: [
                      BoxShadow(
                        offset: const Offset(2, 3),
                        blurRadius: 20,
                        color: BrandColors.gray_900.withOpacity(0.2),
                      ),
                    ],
                  ),
                  padding: const Pad(horizontal: 20, vertical: 16),
                  child: SafeArea(
                    child: Btn(
                      '다음',
                      enabled: selectedTagIds.length >= 3,
                      size: BtnSize.large,
                      onPressed: () async {
                        await context.router.navigate(const MainRouter());
                      },
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
