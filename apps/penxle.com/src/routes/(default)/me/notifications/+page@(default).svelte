<script lang="ts">
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import ky from 'ky';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button } from '$lib/components';

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

<div class="bg-cardprimary w-full flex flex-col grow">
  {#if $query.me.notifications.length > 0}
    <div class="flex justify-end w-full max-w-200 mt-7 mx-auto <sm:px-2">
      <Button size="lg" on:click={async () => await readAllNotifications()}>모두 읽음</Button>
    </div>
  {/if}

  <ul class="space-y-3 min-h-30 my-7 w-full max-w-200 mx-auto <sm:px-2">
    {#each $query.me.notifications as notification (notification.id)}
      <li>
        <button
          class={clsx(
            'border border-secondary rounded-2xl bg-primary p-4 w-full flex gap-3 items-start hover:bg-surface-primary transition',
            notification.state === 'UNREAD' && 'border-yellow-30! bg-yellow-10! hover:bg-yellow-20!',
          )}
          type="button"
          on:click={() => redirect(notification)}
        >
          <div class="space-y-1">
            <div>
              {#if notification.__typename === 'SubscribeNotification'}
                <p class="body-15-b">
                  {notification.actor.name}님이 {notification.space.name.length > 10
                    ? `${notification.space.name.slice(0, 10)}...`
                    : notification.space.name} 스페이스를 구독했어요
                </p>
              {:else if notification.category === 'TREND'}
                <p class="body-15-b">포스트 조회수가 급상승하고 있어요</p>
              {:else if notification.__typename === 'PurchaseNotification'}
                <p class="body-15-b">
                  {notification.actor.name}님이 {notification.post.publishedRevision?.title ?? '(제목 없음)'} 포스트를 구매했어요
                </p>
              {/if}
            </div>
            <time class="body-13-m text-disabled">{dayjs(notification.createdAt).formatAsDateTime()}</time>
          </div>
        </button>
      </li>
    {:else}
      <p class="text-center text-secondary body-14-b">알림이 없어요</p>
    {/each}
  </ul>
</div>
