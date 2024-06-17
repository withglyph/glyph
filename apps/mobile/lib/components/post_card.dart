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
        child: IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      post.publishedRevision!.title ?? '(제목 없음)',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const Gap(2),
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
                                fontWeight: FontWeight.w500,
                                color: BrandColors.gray_800,
                              ),
                            ),
                          ),
                        if (post.publishedRevision!.subtitle != null &&
                            post.publishedRevision!.previewText != '') ...[
                          const Gap(4),
                          Container(
                            width: 1,
                            height: 12,
                            color: BrandColors.gray_100,
                          ),
                          const Gap(4),
                        ],
                        if (post.publishedRevision!.previewText != '')
                          Expanded(
                            child: Text(
                              post.publishedRevision!.previewText,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontSize: 13,
                                color: BrandColors.gray_600,
                              ),
                            ),
                          ),
                      ],
                    ),
                    const Gap(10),
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
                    const Gap(16),
                    Row(
                      children: [
                        Img(post.space!.icon, width: 18, height: 18),
                        const Gap(6),
                        Flexible(
                          child: Text(
                            post.space!.name,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12,
                              color: BrandColors.gray_500,
                            ),
                          ),
                        ),
                        const Gap(6),
                        Container(
                          width: 1,
                          height: 12,
                          color: BrandColors.gray_100,
                        ),
                        const Gap(6),
                        Text(
                          Jiffy.parse(post.publishedAt!.value).fromNow(),
                          style: const TextStyle(
                            fontSize: 12,
                            color: BrandColors.gray_500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Gap(24),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Img(
                    post.thumbnail,
                    width: 104,
                    aspectRatio: 16 / 10,
                    borderRadius: 0,
                  ),
                  const Spacer(),
                  const SvgIcon(
                    'dots-vertical',
                    size: 20,
                    color: BrandColors.gray_400,
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
