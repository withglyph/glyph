import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/space_collections_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class SpaceCollectionsScreen extends ConsumerWidget {
  const SpaceCollectionsScreen({required this.slug, super.key});

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GraphQLOperation(
      operation: GSpaceCollectionsScreen_QueryReq(
        (b) => b..vars.slug = slug,
      ),
      builder: (context, client, data) {
        final collections = data.space.collections;

        return collections.isEmpty
            ? EmptyState(
                icon: TablerBold.books_off,
                title: '아직 컬렉션이 없어요',
                description: data.space.meAsMember == null
                    ? '스페이스를 구독하면 새로운 포스트가\n올라올 때 알림을 받을 수 있어요'
                    : '스페이스 관리에서 컬렉션을 만들 수 있어요',
              )
            : CustomScrollView(
                key: const PageStorageKey<String>('space-collections'),
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                slivers: [
                  SliverList.separated(
                    itemCount: collections.length,
                    itemBuilder: (context, index) {
                      final collection = collections[index];

                      return Pressable(
                        child: Padding(
                          padding: const Pad(all: 20),
                          child: IntrinsicHeight(
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Img(
                                  collection.thumbnail,
                                  width: 70,
                                  aspectRatio: 3 / 4,
                                  borderWidth: 1,
                                  borderRadius: 4,
                                ),
                                const Gap(14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        collection.name,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                        ),
                                      ),
                                      const Gap(2),
                                      Text(
                                        collection.description ?? '',
                                        overflow: TextOverflow.ellipsis,
                                        maxLines: 2,
                                        style: const TextStyle(
                                          fontSize: 13,
                                          color: BrandColors.gray_400,
                                        ),
                                      ),
                                      const Spacer(),
                                      Text(
                                        '총 ${collection.count}개의 포스트',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: BrandColors.gray_500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        onPressed: () async {},
                      );
                    },
                    separatorBuilder: (context, index) {
                      return const Padding(
                        padding: Pad(horizontal: 20),
                        child: HorizontalDivider(color: BrandColors.gray_50),
                      );
                    },
                  ),
                ],
              );
      },
    );
  }
}
