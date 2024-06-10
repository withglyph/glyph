import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/Img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/tag.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/graphql/fragments/__generated__/post_card_post.data.gql.dart';
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
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        if (post.publishedRevision!.subtitle != null)
                          Flexible(
                            child: Text(
                              post.publishedRevision!.subtitle!,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 13,
                                color: BrandColors.gray_500,
                              ),
                            ),
                          ),
                        if (post.publishedRevision!.subtitle != null &&
                            post.publishedRevision!.previewText != '') ...{
                          const Gap(4),
                          Container(
                            width: 1,
                            height: 9,
                            color: const Color(0xFFD9D9D9),
                          ),
                          const Gap(6),
                        },
                        if (post.publishedRevision!.previewText != '')
                          Expanded(
                            child: Text(
                              post.publishedRevision!.previewText,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 13,
                                color: BrandColors.gray_500,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const Gap(6),
                    const Spacer(),
                    UnconstrainedBox(
                      clipBehavior: Clip.hardEdge,
                      alignment: Alignment.centerLeft,
                      child: Row(
                        children: post.tags
                            .map((tag) => Tag(tag.tag))
                            .intersperse(const Gap(6))
                            .toList(),
                      ),
                    ),
                    const Gap(12),
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
              const Gap(28),
              Img(post.thumbnail, width: 108, aspectRatio: 16 / 10),
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
