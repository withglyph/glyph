import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/archive_comments_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/themes/colors.dart';
import 'package:jiffy/jiffy.dart';

@RoutePage()
class ArchiveCommentsScreen extends ConsumerWidget {
  const ArchiveCommentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GraphQLOperation(
      operation: GArchiveCommentsScreen_QueryReq(),
      builder: (context, client, data) {
        final comments = data.me!.comments;

        return comments.isEmpty
            ? const EmptyState(
                icon: TablerBold.message_circle_off,
                title: '아직 댓글을 남긴 포스트가 없어요',
                description: '마음에 드는 포스트에 댓글을 남겨보세요.\n애정이 담긴 댓글은 창작자에게 큰 힘이 됩니다.',
              )
            : ListView.separated(
                physics: const AlwaysScrollableScrollPhysics(
                  parent: BouncingScrollPhysics(),
                ),
                itemCount: comments.length,
                itemBuilder: (context, index) {
                  final comment = comments[index];

                  return Pressable(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 18),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '${Jiffy.parse(comment.createdAt.value).format(pattern: 'yyyy.MM.dd hh:mm')}에 작성',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: BrandColors.gray_500,
                            ),
                          ),
                          const Gap(4),
                          Text(
                            comment.content,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const Gap(10),
                          Row(
                            children: [
                              Img(
                                comment.post?.thumbnail,
                                width: 50,
                                aspectRatio: 16 / 10,
                              ),
                              const Gap(8),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      comment.post != null
                                          ? comment.post?.publishedRevision?.title ?? '(제목 없음)'
                                          : '삭제된 포스트',
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w500,
                                        color: comment.post != null ? BrandColors.gray_500 : BrandColors.gray_400,
                                      ),
                                    ),
                                    const Gap(3),
                                    Row(
                                      children: [
                                        Img(
                                          comment.post?.space?.icon,
                                          width: 18,
                                          aspectRatio: 1 / 1,
                                        ),
                                        const Gap(4),
                                        Text(
                                          comment.post?.space?.name ?? '스페이스',
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: comment.post != null ? BrandColors.gray_500 : BrandColors.gray_400,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const Gap(3),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    onPressed: () async {
                      if (comment.post != null) {
                        await context.pushRoute(PostRoute(permalink: comment.post!.permalink));
                      }
                    },
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
