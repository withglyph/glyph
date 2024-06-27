import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/tag.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/graphql/fragments/__generated__/post_card_post.data.gql.dart';
// import 'package:glyph/icons/tabler.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:jiffy/jiffy.dart';

class PostCard extends ConsumerWidget {
  const PostCard(
    this.post, {
    required this.padding,
    this.onPressed,
    super.key,
  });

  final GPostCard_post post;
  final EdgeInsetsGeometry padding;
  final Function()? onPressed;

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
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    if (post.publishedRevision!.subtitle == null)
                      Expanded(
                        child: SizedBox(
                          height: 17,
                          child: Text(
                            post.publishedRevision!.previewText,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 13,
                              color: BrandColors.gray_500,
                            ),
                          ),
                        ),
                      )
                    else
                      Flexible(
                        child: SizedBox(
                          height: 17,
                          child: Text(
                            post.publishedRevision!.subtitle!,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 13,
                              color: BrandColors.gray_800,
                            ),
                          ),
                        ),
                      ),
                    const Gap(8),
                    SizedBox(
                      height: 20,
                      child: UnconstrainedBox(
                        clipBehavior: Clip.hardEdge,
                        alignment: Alignment.centerLeft,
                        child: Row(
                          children: post.tags
                              .map((tag) => Tag(tag.tag))
                              .intersperse(const Gap(4))
                              .toList(),
                        ),
                      ),
                    ),
                    const Gap(10),
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
                              color: BrandColors.gray_600,
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
                          Jiffy.parse(post.publishedAt!.value)
                              .format(pattern: 'yyyy.MM.dd'),
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
              const Gap(14),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // ignore: use_decorated_box
                  Container(
                    decoration: BoxDecoration(
                      border: Border.all(
                        width: 0.8,
                        color: BrandColors.gray_50,
                      ),
                      borderRadius: BorderRadius.circular(2),
                    ),
                    child: Img(
                      post.thumbnail,
                      width: 78,
                      aspectRatio: 16 / 10,
                    ),
                  ),
                  // const Spacer(),
                  // Pressable(
                  //   child: const Icon(
                  //     Tabler.dots_vertical,
                  //     size: 20,
                  //     color: BrandColors.gray_400,
                  //   ),
                  //   onPressed: () {},
                  // ),
                ],
              ),
            ],
          ),
        ),
      ),
      onPressed: () async {
        if (onPressed != null) {
          onPressed!();
          return;
        }

        await context.router.push(PostRoute(permalink: post.permalink));
      },
    );
  }
}
