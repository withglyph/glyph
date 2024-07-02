import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/tag.dart';
import 'package:glyph/context/bottom_menu.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/graphql/__generated__/thumbnail_post_card_bookmark_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/thumbnail_post_card_follow_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/thumbnail_post_card_mute_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/thumbnail_post_card_unbookmark_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/thumbnail_post_card_unfollow_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/thumbnail_post_card_unmute_space_mutation.req.gql.dart';
import 'package:glyph/graphql/fragments/__generated__/thumbnail_post_card_post.data.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:jiffy/jiffy.dart';
import 'package:share_plus/share_plus.dart';

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
    return Padding(
      padding: padding,
      child: Column(
        children: [
          Pressable(
            child: Row(
              children: [
                Pressable(
                  child: Row(
                    children: [
                      Img(
                        post.space?.icon,
                        width: 20,
                        height: 20,
                        aspectRatio: 1 / 1,
                      ),
                      const Gap(4),
                      Text(
                        post.space!.name,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  onPressed: () async {
                    await context.router.push(SpaceRoute(slug: post.space!.slug));
                  },
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
                const Spacer(),
                Pressable(
                  child: const Icon(
                    Tabler.dots_vertical,
                    size: 16,
                    color: BrandColors.gray_500,
                  ),
                  onPressed: () async {
                    await context.showBottomMenu(
                      title: '포스트',
                      items: [
                        BottomMenuItem(
                          icon: post.space!.followed ? Tabler.minus : Tabler.plus,
                          iconColor: BrandColors.gray_600,
                          title: post.space!.followed ? '스페이스 구독 해제' : '스페이스 구독',
                          color: BrandColors.gray_600,
                          onTap: () async {
                            final client = ref.read(ferryProvider);
                            if (post.space!.followed) {
                              final req = GThumbnailPostCard_UnfollowSpace_MutationReq(
                                (b) => b..vars.input.spaceId = post.space!.id,
                              );
                              await client.req(req);
                            } else {
                              final req = GThumbnailPostCard_FollowSpace_MutationReq(
                                (b) => b..vars.input.spaceId = post.space!.id,
                              );
                              await client.req(req);
                            }
                          },
                        ),
                        BottomMenuItem(
                          icon: Tabler.volume_3,
                          title: post.space!.muted ? '스페이스 뮤트 해제' : '스페이스 뮤트',
                          color: BrandColors.red_600,
                          onTap: () async {
                            final client = ref.read(ferryProvider);
                            if (post.space!.muted) {
                              final req = GThumbnailPostCard_UnmuteSpace_MutationReq(
                                (b) => b..vars.input.spaceId = post.space!.id,
                              );
                              await client.req(req);

                              if (context.mounted) {
                                context.toast.show('${post.space!.name} 스페이스 뮤트를 해제했어요');
                              }
                            } else {
                              final req = GThumbnailPostCard_MuteSpace_MutationReq(
                                (b) => b..vars.input.spaceId = post.space!.id,
                              );
                              await client.req(req);

                              if (context.mounted) {
                                context.toast.show('${post.space!.name} 스페이스를 뮤트했어요', type: ToastType.error);
                              }
                            }
                          },
                        ),
                      ],
                    );
                  },
                ),
              ],
            ),
          ),
          const Gap(8),
          Pressable(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  post.publishedRevision!.title ?? '(제목 없음)',
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const Gap(4),
                if (post.publishedRevision!.subtitle != null)
                  Text(
                    post.publishedRevision!.subtitle!,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: BrandColors.gray_800,
                    ),
                  ),
                if (post.publishedRevision!.previewText != '')
                  Text(
                    post.publishedRevision!.previewText,
                    overflow: TextOverflow.ellipsis,
                    maxLines: post.publishedRevision?.subtitle == null ? 2 : 1,
                    style: const TextStyle(
                      fontSize: 13,
                      color: BrandColors.gray_500,
                    ),
                  ),
                if (post.thumbnail != null) ...[
                  const Gap(12),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      return Img(
                        post.thumbnail,
                        width: constraints.maxWidth,
                        aspectRatio: 16 / 10,
                        borderRadius: 4,
                      );
                    },
                  ),
                ],
                if (post.tags.isNotEmpty) ...[
                  const Gap(8),
                  UnconstrainedBox(
                    clipBehavior: Clip.hardEdge,
                    alignment: Alignment.centerLeft,
                    child: Row(
                      children: post.tags.map((tag) => Tag(tag.tag)).intersperse(const Gap(4)).toList(),
                    ),
                  ),
                ],
                const Gap(16),
                Row(
                  children: [
                    const Padding(
                      padding: EdgeInsets.only(top: 1),
                      child: Icon(
                        Tabler.clock,
                        size: 14,
                        color: BrandColors.gray_400,
                      ),
                    ),
                    const Gap(3),
                    Text(
                      '읽는 시간 ${(post.publishedRevision!.readingTime / 60).ceil()}분',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: BrandColors.gray_400,
                      ),
                    ),
                    const Spacer(),
                    Pressable(
                      child: const Icon(
                        Tabler.share_2,
                        size: 20,
                        color: BrandColors.gray_500,
                      ),
                      onPressed: () async {
                        await Share.shareUri(
                          Uri.parse(
                            'https://glph.to/${post.shortlink}',
                          ),
                        );
                      },
                    ),
                    const Gap(20),
                    Pressable(
                      child: Icon(
                        post.bookmarkGroups.isEmpty ? Tabler.bookmark : Tabler.bookmark_filled,
                        size: 20,
                        color: post.bookmarkGroups.isEmpty ? BrandColors.gray_500 : BrandColors.gray_900,
                      ),
                      onPressed: () async {
                        final client = ref.read(ferryProvider);
                        if (post.bookmarkGroups.isEmpty) {
                          final req = GThumbnailPostCard_BookmarkPost_MutationReq(
                            (b) => b..vars.input.postId = post.id,
                          );
                          await client.req(req);
                        } else {
                          final req = GThumbnailPostCard_UnbookmarkPost_MutationReq(
                            (b) => b
                              ..vars.input.postId = post.id
                              ..vars.input.bookmarkGroupId = post.bookmarkGroups.first.id,
                          );
                          await client.req(req);
                        }
                      },
                    ),
                  ],
                ),
              ],
            ),
            onPressed: () async {
              await context.router.push(PostRoute(permalink: post.permalink));
            },
          ),
        ],
      ),
    );
  }
}
