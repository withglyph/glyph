import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/Img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/graphql/fragments/__generated__/thumbnail_post_card_post.data.gql.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';

class ThumbnailPostCard extends ConsumerWidget {
  const ThumbnailPostCard(
    this.post, {
    required this.padding,
    super.key,
  });

  final GThumbnailPostCard_post post;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Pressable(
      child: Padding(
        padding: padding,
        child: SizedBox(
          width: 160,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Img(post.thumbnail, height: 100, aspectRatio: 16 / 10),
              const Gap(8),
              Text(
                post.publishedRevision!.title ?? '(제목 없음)',
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (post.publishedRevision!.subtitle != null &&
                  post.publishedRevision!.previewText.isNotEmpty) ...[
                const Gap(2),
                Row(
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
                        post.publishedRevision!.previewText.isNotEmpty) ...[
                      const Gap(4),
                      Container(
                        width: 1,
                        height: 12,
                        color: const Color(0xFFD9D9D9),
                      ),
                      const Gap(4),
                    ],
                    if (post.publishedRevision!.previewText.isNotEmpty)
                      Flexible(
                        child: Text(
                          post.publishedRevision!.previewText,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13,
                            color: BrandColors.gray_400,
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
      onPressed: () async {
        await context.router.push(PostRoute(permalink: post.permalink));
      },
    );
  }
}
