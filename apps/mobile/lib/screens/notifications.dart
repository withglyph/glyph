import 'package:assorted_layout_widgets/assorted_layout_widgets.dart';
import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:gap/gap.dart';
import 'package:glyph/components/empty_state.dart';
import 'package:glyph/components/horizontal_divider.dart';
import 'package:glyph/components/img.dart';
import 'package:glyph/components/pressable.dart';
import 'package:glyph/components/pull_to_refresh.dart';
import 'package:glyph/context/toast.dart';
import 'package:glyph/emojis/data.dart';
import 'package:glyph/emojis/emoji.dart';
import 'package:glyph/ferry/extension.dart';
import 'package:glyph/ferry/widget.dart';
import 'package:glyph/graphql/__generated__/notification_screen_mark_all_notification_as_read_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/notification_screen_mark_notification_as_read_mutation.req.gql.dart';
import 'package:glyph/graphql/__generated__/notification_screen_query.data.gql.dart';
import 'package:glyph/graphql/__generated__/notification_screen_query.req.gql.dart';
import 'package:glyph/graphql/__generated__/schema.schema.gql.dart';
import 'package:glyph/icons/tabler.dart';
import 'package:glyph/icons/tabler_bold.dart';
import 'package:glyph/routers/app.gr.dart';
import 'package:glyph/shells/default.dart';
import 'package:glyph/themes/colors.dart';
import 'package:jiffy/jiffy.dart';

@RoutePage()
class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultShell(
      bottomBorder: false,
      title: '알림',
      actions: [
        Pressable(
          child: const Icon(Tabler.settings),
          onPressed: () async {
            await context.router.push(
              WebViewRoute(
                title: '알림 설정',
                path: '/me/settings/notifications',
              ),
            );
          },
        ),
      ],
      child: GraphQLOperation(
        operation: GNotificationScreen_QueryReq(),
        builder: (context, client, data) {
          final notifications = data.me!.notifications;
          final unreadNotifications = notifications.where((n) => n.state == GUserNotificationState.UNREAD);

          return Column(
            children: [
              Container(
                constraints: BoxConstraints.tight(const Size.fromHeight(46)),
                decoration: const BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: BrandColors.gray_100,
                    ),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Padding(
                      padding: const Pad(horizontal: 20),
                      child: Row(
                        children: [
                          const Text(
                            '새소식',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const Gap(4),
                          Text(
                            '${unreadNotifications.length}',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: BrandColors.brand_400,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Pressable(
                      child: Padding(
                        padding: const Pad(
                          horizontal: 20,
                          vertical: 10,
                        ),
                        child: Text(
                          '모두 읽기',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: unreadNotifications.isNotEmpty ? BrandColors.brand_600 : BrandColors.gray_300,
                          ),
                        ),
                      ),
                      onPressed: () async {
                        if (unreadNotifications.isEmpty) {
                          return;
                        }

                        final req = GNotificationScreen_MarkAllNotificationsAsRead_MutationReq();
                        await client.req(req);

                        if (context.mounted) {
                          context.toast.show('모든 알림을 읽었어요');
                        }
                      },
                    ),
                  ],
                ),
              ),
              Expanded(
                child: PullToRefresh.listView(
                  itemCount: notifications.length,
                  itemBuilder: (context, index) {
                    final notification = notifications[index];

                    return Pressable(
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          color: notification.state == GUserNotificationState.UNREAD
                              ? BrandColors.gray_50
                              : BrandColors.gray_0,
                        ),
                        child: Padding(
                          padding: const Pad(horizontal: 20, vertical: 18),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Stack(
                                children: [
                                  SizedBox(
                                    height: 36,
                                    width: 36,
                                    child: DecoratedBox(
                                      decoration: BoxDecoration(
                                        color: notification.when(
                                          commentNotification: (_) => const Color(0xFF3196DE),
                                          subscribeNotification: (_) => const Color(0xFF3EBBAC),
                                          purchaseNotification: (_) => BrandColors.brand_400,
                                          emojiReactionNotification: (_) => const Color(0xFFFF7FA5),
                                          orElse: () => BrandColors.gray_50,
                                        ),
                                        borderRadius: BorderRadius.circular(18),
                                      ),
                                      child: Icon(
                                        notification.when(
                                          commentNotification: (_) => Tabler.message_circle_filled,
                                          subscribeNotification: (_) => Tabler.rosette_discount_check_filled,
                                          purchaseNotification: (_) => Tabler.coin_filled,
                                          emojiReactionNotification: (_) => Tabler.mood_smile_filled,
                                          orElse: () => Tabler.bell_filled,
                                        ),
                                        size: 20,
                                        color: BrandColors.gray_0,
                                      ),
                                    ),
                                  ),
                                  Positioned(
                                    bottom: 0,
                                    right: 0,
                                    child: Transform.translate(
                                      offset: const Offset(4, 4),
                                      child: Img(
                                        notification.when(
                                          commentNotification: (notification) => notification.post.space?.icon,
                                          subscribeNotification: (notification) => notification.space.icon,
                                          purchaseNotification: (notification) => notification.post.space?.icon,
                                          emojiReactionNotification: (notification) => notification.post.space?.icon,
                                          orElse: () => notification.actor?.avatar,
                                        ),
                                        width: 18,
                                        height: 18,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const Gap(16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      notification.when(
                                        commentNotification: (_) => '댓글',
                                        subscribeNotification: (_) => '구독',
                                        purchaseNotification: (_) => '구매',
                                        emojiReactionNotification: (_) => '이모지',
                                        orElse: () => '알 수 없음',
                                      ),
                                      style: const TextStyle(
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                        color: BrandColors.gray_500,
                                      ),
                                    ),
                                    const Gap(2),
                                    DefaultTextStyle.merge(
                                      style: const TextStyle(fontSize: 14),
                                      child: Builder(
                                        builder: (context) {
                                          return notification.when(
                                            commentNotification: (notification) => Text(
                                              '${notification.actor!.name}님이 ${notification.post.publishedRevision!.title ?? '(제목 없음)'}에 댓글을 남겼어요',
                                            ),
                                            subscribeNotification: (notification) => Text(
                                              '${notification.actor!.name}님이 ${notification.space.name} 스페이스를 구독했어요',
                                            ),
                                            purchaseNotification: (notification) => Text(
                                              '${notification.actor!.name}님이 ${notification.post.publishedRevision!.title ?? '(제목 없음)'} 포스트를 구매했어요',
                                            ),
                                            emojiReactionNotification: (notification) => RichText(
                                              text: TextSpan(
                                                style: DefaultTextStyle.of(context).style,
                                                children: [
                                                  TextSpan(
                                                    text:
                                                        '${notification.actor!.name}님이 ${notification.post.publishedRevision!.title ?? '(제목 없음)'}에 ',
                                                  ),
                                                  WidgetSpan(
                                                    alignment: PlaceholderAlignment.middle,
                                                    child: Emoji(Emojis.fromShortCode(notification.emoji), size: 14),
                                                  ),
                                                  const TextSpan(text: '를 달았어요'),
                                                ],
                                              ),
                                            ),
                                            orElse: () => const Text('(알 수 없음)'),
                                          );
                                        },
                                      ),
                                    ),
                                    const Gap(4),
                                    Text(
                                      Jiffy.parse(notification.createdAt.value, isUtc: true).fromNow(),
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: BrandColors.gray_400,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      onPressed: () async {
                        final req = GNotificationScreen_MarkNotificationAsRead_MutationReq(
                          (b) => b..vars.input.notificationId = notification.id,
                        );
                        await client.req(req);

                        final dynamic route = notification.when(
                          commentNotification: (notification) => PostRoute(permalink: notification.post.permalink),
                          subscribeNotification: (notification) => SpaceRoute(slug: notification.space.slug),
                          purchaseNotification: (notification) => PostRoute(permalink: notification.post.permalink),
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
                  separatorBuilder: (context, index) {
                    return const Padding(
                      padding: Pad(horizontal: 20),
                      child: HorizontalDivider(color: BrandColors.gray_50),
                    );
                  },
                  onRefresh: () async {
                    await client.req(GNotificationScreen_QueryReq());
                  },
                  emptyText: const EmptyState(
                    icon: TablerBold.bell_x,
                    title: '아직 알림이 없어요',
                    description: '스페이스를 구독하거나 댓글을 남겨보세요',
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
