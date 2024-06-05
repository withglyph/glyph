import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/Img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/svg_icon.dart';
import 'package:glyph/components/tag.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/post_card_bookmark_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_card_unbookmark_post_mutation.req.gql.dart';
import 'package:glyph/graphql/fragments/__generated__/post_card_post.data.gql.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:jiffy/jiffy.dart';

class PostCard extends ConsumerWidget {
  const PostCard(
    this.post, {
    super.key,
    required this.padding,
  });

  final GPostCard_post post;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Pressable(
      child: Padding(
        padding: padding,
        child: SizedBox(
          height: 120,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      post.publishedRevision!.title ?? '(제목 없음)',
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (post.publishedRevision!.subtitle != null)
                      Text(
                        post.publishedRevision!.subtitle!,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13,
                          color: BrandColors.gray_500,
                        ),
                      ),
                    const Gap(6),
                    const Spacer(),
                    UnconstrainedBox(
                      clipBehavior: Clip.hardEdge,
                      alignment: Alignment.centerLeft,
                      child: Row(
                        children: post.tags
                            .map((tag) => Tag(tag.tag))
                            .intersperse(const Gap(4))
                            .toList(),
                      ),
                    ),
                    const Gap(14),
                    Row(
                      children: [
                        Img(post.space!.icon, width: 18, height: 18),
                        const Gap(4),
                        Flexible(
                          child: Text(
                            post.space!.name,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12,
                              color: BrandColors.gray_400,
                            ),
                          ),
                        ),
                        const Gap(6),
                        Container(
                          width: 2,
                          height: 2,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: BrandColors.gray_400,
                          ),
                        ),
                        const Gap(6),
                        Text(
                          Jiffy.parse(post.publishedAt!.value).fromNow(),
                          style: const TextStyle(
                            fontSize: 12,
                            color: BrandColors.gray_400,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Gap(14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Img(post.thumbnail, width: 108, aspectRatio: 16 / 10),
                  const Spacer(),
                  Pressable(
                    child: post.bookmarkGroups.isEmpty
                        ? const SvgIcon('bookmark', color: BrandColors.gray_400)
                        : const SvgIcon('bookmark-filled'),
                    onPressed: () async {
                      final client = ref.read(ferryProvider);

                      if (post.bookmarkGroups.isEmpty) {
                        final req = GPostCard_BookmarkPost_MutationReq(
                          (b) => b..vars.input.postId = post.id,
                        );
                        await client.req(req);
                      } else {
                        final req = GPostCard_UnbookmarkPost_MutationReq(
                          (b) => b
                            ..vars.input.postId = post.id
                            ..vars.input.bookmarkGroupId =
                                post.bookmarkGroups.first.id,
                        );
                        await client.req(req);
                      }
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      onPressed: () {
        context.router.push(PostRoute(permalink: post.permalink));
      },
    );
  }
}
