<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import ky from 'ky';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button } from '$lib/components/v2';

  $: query = graphql(`
    query MeNotificationsPage_Query {
      me @_required {
        id

        notifications {
          __typename
          id
          category
          createdAt
          data
          state

          actor {
            id
            name
          }

          ... on SubscribeNotification {
            id

            space {
              id
              name
            }
          }

          ... on PurchaseNotification {
            id

            post {
              id

              publishedRevision {
                id
                title
              }
            }
          }

          ... on CommentNotification {
            id

            post {
              id

              publishedRevision {
                id
                title
              }
            }
          }
        }
      }
    }
  `);

  const markNotificationAsRead = graphql(`
    mutation MeNotificationsPage_MarkNotificationAsRead_Mutation($input: MarkNotificationAsReadInput!) {
      markNotificationAsRead(input: $input) {
        id
        state
      }
    }
  `);

  $: unreadNotifications = $query.me.notifications.filter((notification) => notification.state === 'UNREAD');

  const readAllNotifications = () => {
    mixpanel.track('user:notification-state:read', { via: 'notifications' });
    return Promise.all(unreadNotifications.map(({ id }) => markNotificationAsRead({ notificationId: id })));
  };

  const redirect = async (notification: (typeof $query.me.notifications)[0]) => {
    if (notification.state === 'UNREAD') {
      await markNotificationAsRead({ notificationId: notification.id });
      mixpanel.track('user:notification-state:read', { via: 'notification-popup' });
    }

    const resp = await ky.get(`/api/notification/${notification.id}`);
    await goto(resp.url);
  };
</script>

<Helmet description="받은 알림 목록을 둘러보세요" title="알림" />

<header>
  <div class="px-5 py-3.5 flex items-center justify-between relative border-b border-gray-100 h-55px">
    <button class="i-tb-chevron-left square-6" type="button" on:click={() => history.back()} />

    <h1 class="text-16-sb absolute left-50% -translate-x-50%">알림</h1>

    <a href="/me/settings/notifications">
      <i class="i-tb-settings square-5" />
    </a>
  </div>

  <div class="px-5 py-3.5 flex items-center justify-between border-b border-gray-100 h-55px">
    <p>
      새소식 <mark class="text-16-r text-teal-500">{unreadNotifications.length}</mark>
    </p>
    <Button size="xs" variant="outline" on:click={async () => await readAllNotifications()}>모두 읽기</Button>
  </div>
</header>

<div class="w-full flex flex-col grow">
  <ul class="min-h-30 mb-7 w-full max-w-200 mx-auto">
    {#each $query.me.notifications as notification (notification.id)}
      <li>
        <button
          class={clsx(
            'border-b border-gray-100 px-4 py-5 w-full hover:bg-gray-100 transition',
            notification.state === 'UNREAD' && 'bg-teal-50',
          )}
          type="button"
          on:click={() => redirect(notification)}
        >
          <div
            class={clsx(
              'text-13-r flex items-center gap-1 text-gray-500',
              notification.state === 'UNREAD' && 'text-teal-500',
            )}
          >
            {#if notification.__typename === 'SubscribeNotification'}
              <i class="i-tb-check square-3 block" />
              스페이스 구독
            {:else if notification.__typename === 'PurchaseNotification'}
              <i class="i-tb-coin square-3" />
              구매
            {:else if notification.__typename === 'CommentNotification'}
              <i class="i-tb-message-circle square-3 block" />
              댓글
            {/if}
          </div>
          <div class="text-14-m px-3">
            {#if notification.__typename === 'SubscribeNotification'}
              {notification.actor.name}님이 {notification.space.name.length > 10
                ? `${notification.space.name.slice(0, 10)}...`
                : notification.space.name} 스페이스를 구독했어요
            {:else if notification.category === 'TREND'}
              포스트 조회수가 급상승하고 있어요
            {:else if notification.__typename === 'PurchaseNotification'}
              {notification.actor.name}님이 {notification.post.publishedRevision?.title ?? '(제목 없음)'} 포스트를 구매했어요
            {:else if notification.__typename === 'CommentNotification'}
              {notification.actor.name}님이 {notification.post.publishedRevision?.title ?? '(제목 없음)'}에 댓글을
              달았어요
            {/if}
          </div>
          <time class="text-10-l text-gray-400 text-right w-full inline-block">
            {dayjs(notification.createdAt).formatAsDateTime()}
          </time>
        </button>
      </li>
    {:else}
      <p class="text-center text-secondary body-14-b">알림이 없어요</p>
    {/each}
  </ul>
</div>
