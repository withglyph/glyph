import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:get_it/get_it.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/rectangle_chip.dart';
import 'package:glyph/components/tag.dart';
import 'package:glyph/context/bottom_menu.dart';
import 'package:glyph/context/dialog.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/extensions/iterable.dart';
import 'package:glyph/graphql/__generated__/post_card_delete_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_card_follow_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_card_mute_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_card_report_post_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_card_unfollow_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/post_card_unmute_space_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/graphql/fragments/__generated__/post_card_post.data.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:jiffy/jiffy.dart';
import 'package:mixpanel_flutter/mixpanel_flutter.dart';

class PostCard extends ConsumerWidget {
  PostCard(
    this.post, {
    required this.padding,
    this.onPressed,
    super.key,
    this.dots = true,
  });

  final _mixpanel = GetIt.I<Mixpanel>();

  final GPostCard_post post;
  final EdgeInsetsGeometry padding;
  final Function()? onPressed;
  final bool dots;

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
                    Row(
                      children: [
                        if (post.ageRating == GPostAgeRating.R15) ...[
                          const RectangleChip('15세'),
                          const Gap(4),
                        ],
                        if (post.ageRating == GPostAgeRating.R19) ...[
                          const RectangleChip('성인', theme: RectangleChipTheme.pink),
                          const Gap(4),
                        ],
                        if (post.hasPassword) ...[
                          const RectangleChip('비밀글', theme: RectangleChipTheme.purple),
                          const Gap(4),
                        ],
                        if (post.publishedRevision?.price != null && post.publishedRevision!.price! > 0) ...[
                          const RectangleChip('유료', theme: RectangleChipTheme.blue),
                          const Gap(4),
                        ],
                        Flexible(
                          child: Text(
                            post.publishedRevision!.title ?? '(제목 없음)',
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
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
                              fontWeight: FontWeight.w500,
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
                          children: post.tags.map((tag) => Tag(tag.tag)).intersperse(const Gap(4)).toList(),
                        ),
                      ),
                    ),
                    const Gap(10),
                    Row(
                      children: [
                        Img(
                          post.space!.icon,
                          width: 18,
                          height: 18,
                          borderWidth: 1,
                        ),
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
                        const Box(width: 1, height: 12, color: BrandColors.gray_100),
                        const Gap(6),
                        Text(
                          Jiffy.parse(post.publishedAt!.value, isUtc: true).format(pattern: 'yyyy.MM.dd'),
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
                  Img(
                    post.thumbnail,
                    width: 78,
                    aspectRatio: 16 / 10,
                    borderWidth: 1,
                  ),
                  if (dots) ...[
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
                            ...(post.space!.meAsMember == null
                                ? [
                                    BottomMenuItem(
                                      icon: post.space!.followed ? Tabler.minus : Tabler.plus,
                                      iconColor: BrandColors.gray_600,
                                      title: post.space!.followed ? '스페이스 구독 해제' : '스페이스 구독',
                                      color: BrandColors.gray_600,
                                      onTap: () async {
                                        final client = ref.read(ferryProvider.notifier);
                                        if (post.space!.followed) {
                                          _mixpanel.track(
                                            'space:unfollow',
                                            properties: {
                                              'spaceId': post.space!.id,
                                              'via': 'post-card',
                                            },
                                          );

                                          final req = GPostCard_UnfollowSpace_MutationReq(
                                            (b) => b..vars.input.spaceId = post.space!.id,
                                          );
                                          await client.request(req);

                                          if (context.mounted) {
                                            context.toast
                                                .show('${post.space!.name} 스페이스 구독을 해제했어요', type: ToastType.error);
                                          }
                                        } else {
                                          _mixpanel.track(
                                            'space:follow',
                                            properties: {
                                              'spaceId': post.space!.id,
                                              'via': 'post-card',
                                            },
                                          );

                                          final req = GPostCard_FollowSpace_MutationReq(
                                            (b) => b..vars.input.spaceId = post.space!.id,
                                          );
                                          await client.request(req);

                                          if (context.mounted) {
                                            context.toast.show('${post.space!.name} 스페이스를 구독했어요');
                                          }
                                        }
                                      },
                                    ),
                                    BottomMenuItem(
                                      icon: Tabler.volume_3,
                                      title: post.space!.muted ? '스페이스 뮤트 해제' : '스페이스 뮤트',
                                      color: BrandColors.gray_600,
                                      onTap: () async {
                                        final client = ref.read(ferryProvider.notifier);
                                        if (post.space!.muted) {
                                          _mixpanel.track(
                                            'space:unmute',
                                            properties: {
                                              'spaceId': post.space!.id,
                                              'via': 'post-card',
                                            },
                                          );

                                          final req = GPostCard_UnmuteSpace_MutationReq(
                                            (b) => b..vars.input.spaceId = post.space!.id,
                                          );
                                          await client.request(req);

                                          if (context.mounted) {
                                            context.toast.show('${post.space!.name} 스페이스 뮤트를 해지했어요');
                                          }
                                        } else {
                                          _mixpanel.track(
                                            'space:mute',
                                            properties: {
                                              'spaceId': post.space!.id,
                                              'via': 'post-card',
                                            },
                                          );

                                          final req = GPostCard_MuteSpace_MutationReq(
                                            (b) => b..vars.input.spaceId = post.space!.id,
                                          );
                                          await client.request(req);

                                          if (context.mounted) {
                                            context.toast
                                                .show('${post.space!.name} 스페이스를 뮤트했어요', type: ToastType.error);
                                          }
                                        }
                                      },
                                    ),
                                    BottomMenuItem(
                                      icon: Tabler.flag_3,
                                      title: '포스트 신고',
                                      color: BrandColors.red_600,
                                      onTap: () {
                                        context.showDialog(
                                          title: '신고하시겠어요?',
                                          confirmText: '신고하기',
                                          onConfirmed: () async {
                                            final client = ref.read(ferryProvider.notifier);

                                            _mixpanel.track(
                                              'post:report',
                                              properties: {
                                                'postId': post.id,
                                                'via': 'post-card',
                                              },
                                            );

                                            final req =
                                                GPostCard_ReportPost_MutationReq((b) => b..vars.postId = post.id);
                                            await client.request(req);

                                            if (context.mounted) {
                                              context.toast.show('신고가 성공적으로 접수되었어요');
                                            }
                                          },
                                        );
                                      },
                                    ),
                                  ]
                                : [
                                    BottomMenuItem(
                                      icon: Tabler.pencil,
                                      title: '수정',
                                      color: BrandColors.gray_600,
                                      onTap: () async {
                                        if (context.mounted) {
                                          await context.router.push(
                                            EditorRoute(permalink: post.permalink),
                                          );
                                        }
                                      },
                                    ),
                                    BottomMenuItem(
                                      icon: Tabler.x,
                                      title: '삭제',
                                      color: BrandColors.red_600,
                                      onTap: () {
                                        context.showDialog(
                                          title: '포스트를 삭제하시겠어요?',
                                          content: '삭제된 글은 복구할 수 없어요',
                                          confirmText: '삭제',
                                          onConfirmed: () async {
                                            final client = ref.read(ferryProvider.notifier);

                                            _mixpanel.track(
                                              'post:delete',
                                              properties: {
                                                'postId': post.id,
                                                'via': 'post-card',
                                              },
                                            );

                                            final req = GPostCard_DeletePost_MutationReq(
                                              (b) => b..vars.input.postId = post.id,
                                            );
                                            await client.request(req);

                                            if (context.mounted) {
                                              context.toast.show('포스트가 삭제되었어요', type: ToastType.error);
                                            }
                                          },
                                        );
                                      },
                                    ),
                                  ]),
                          ],
                        );
                      },
                    ),
                  ],
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
