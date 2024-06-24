import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/pull_to_refresh.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/notification_screen_mark_all_notification_as_read_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/notification_screen_mark_notification_as_read_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/notification_screen_query.data.gql.dart';
import 'package:glyph/graphql/__generated__/notification_screen_query.req.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/providers/ferry.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:jiffy/jiffy.dart';

@RoutePage()
class NotificationScreen extends ConsumerWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultShell(
      title: '알림',
      actions: [
        Pressable(
          child: const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              '모두 읽기',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
          ),
          onPressed: () async {
            final client = ref.read(ferryProvider);
            final req =
                GNotificationScreen_MarkAllNotificationsAsRead_MutationReq();
            await client.req(req);

            if (context.mounted) {
              context.toast.show('모든 알림을 읽었어요');
            }
          },
        ),
      ],
      child: GraphQLOperation(
        operation: GNotificationScreen_QueryReq(),
        builder: (context, client, data) {
          final notifications = data.me!.notifications;

          return PullToRefresh.listView(
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final notification = notifications.elementAtOrNull(index);
              if (notification == null) {
                return null;
              }

              return Pressable(
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
                  child: Row(
                    children: [
                      Img(
                        notification.actor!.avatar,
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                      ),
                      const Gap(16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(
                                  Tabler.home,
                                  size: 14,
                                  color: BrandColors.gray_500,
                                ),
                                const Gap(4),
                                Text(
                                  notification.when(
                                    commentNotification: (_) => '댓글',
                                    subscribeNotification: (_) => '스페이스 구독',
                                    purchaseNotification: (_) => '구매',
                                    emojiReactionNotification: (_) => '이모지',
                                    orElse: () => '알 수 없음',
                                  ),
                                  style: const TextStyle(
                                    fontSize: 14,
                                    color: BrandColors.gray_500,
                                  ),
                                ),
                              ],
                            ),
                            const Gap(4),
                            Text(
                              notification.when(
                                commentNotification: (notification) =>
                                    '${notification.actor!.name}님이 ${_truncate(notification.post.publishedRevision!.title ?? '(제목 없음)')} 포스트에 댓글을 남겼어요',
                                subscribeNotification: (notification) =>
                                    '${notification.actor!.name}님이 ${_truncate(notification.space.name)} 스페이스를 구독했어요',
                                purchaseNotification: (notification) =>
                                    '${notification.actor!.name}님이 ${_truncate(notification.post.publishedRevision!.title ?? '(제목 없음)')} 포스트를 구매했어요',
                                emojiReactionNotification: (notification) =>
                                    '${notification.actor!.name}님이 ${_truncate(notification.post.publishedRevision!.title ?? '(제목 없음)')} 포스트에 ${notification.emoji}를 남겼어요',
                                orElse: () => '(알 수 없음)',
                              ),
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const Gap(4),
                            Text(
                              Jiffy.parse(notification.createdAt.value)
                                  .fromNow(),
                              style:
                                  const TextStyle(color: BrandColors.gray_400),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                onPressed: () async {
                  final req =
                      GNotificationScreen_MarkNotificationAsRead_MutationReq(
                    (b) => b..vars.input.notificationId = notification.id,
                  );
                  await client.req(req);

                  final route = notification.when(
                    commentNotification: (notification) =>
                        PostRoute(permalink: notification.post.permalink),
                    subscribeNotification: (notification) => null,
                    purchaseNotification: (notification) =>
                        PostRoute(permalink: notification.post.permalink),
                    emojiReactionNotification: (notification) =>
                        PostRoute(permalink: notification.post.permalink),
                    orElse: () => null,
                  );

                  if (context.mounted && route != null) {
                    await context.router.push(route);
                  }
                },
              );
            },
            onRefresh: () async {
              await client.req(GNotificationScreen_QueryReq());
            },
            emptyText: '아직 받은 알림이 없어요',
          );
        },
      ),
    );
  }

  String _truncate(String text) {
    return text.runes.length > 10 ? '${text.substring(0, 10)}...' : text;
  }
}
