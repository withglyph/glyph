import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/post_card.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/archive_purchases_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/themes/colors.dart';

@RoutePage()
class ArchivePurchasesScreen extends ConsumerWidget {
  const ArchivePurchasesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GraphQLOperation(
      operation: GArchivePurchasesScreen_QueryReq(),
      builder: (context, client, data) {
        final posts = data.me!.purchasedPosts;

        return posts.isEmpty
            ? const EmptyState(
                icon: TablerBold.gift_off,
                title: '아직 구매한 포스트가 없어요',
                description: '마음에 드는 포스트를 구매해보세요.\n구매한 포스트는 영구 소장이 가능해요.',
              )
            : ListView.separated(
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                itemCount: posts.length,
                itemBuilder: (context, index) {
                  return PostCard(
                    posts[index],
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                  );
                },
                separatorBuilder: (context, index) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    child: HorizontalDivider(color: BrandColors.gray_50),
                  );
                },
              );
      },
    );
  }
}
