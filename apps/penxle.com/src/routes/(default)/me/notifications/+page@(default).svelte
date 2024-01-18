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

{#if $query.me.notifications.length > 0}
  <div class="flex justify-end w-full max-w-200 mt-7 <sm:px-2">
    <Button size="lg" on:click={async () => await readAllNotifications()}>모두 읽음</Button>
  </div>
{/if}

<ul class="space-y-3 min-h-30 my-7 w-full max-w-200 <sm:px-2">
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
        <svg class="rounded-lg square-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect fill="#0c0a091a" height="24" width="24" />
          <path
            d="M7.36 3.86c2.3 5.04.42 10.01-.1 11.36-.08.23-.13.36-.11.36a15.7 15.7 0 0 1 9.45 4.6l-1.58-2.74L13 14.07a1.1 1.1 0 1 1 .53-.35l3.53 6.11c-1.4-4.68.63-10.12.63-10.12-6.15-.67-10.33-5.85-10.33-5.85Z"
            fill="#FAFAF9"
          />
        </svg>

        <div class="space-y-1">
          <div>
            {#if notification.__typename === 'SubscribeNotification'}
              <p class="body-15-b">{notification.space.name}에 새로운 구독자가 생겼어요!</p>
              <p class="body-14-m text-secondary">{notification.actor.name}님을 환영해요!</p>
            {:else if notification.category === 'TREND'}
              <p class="body-15-b">포스트 조회수가 급상승하고 있어요!</p>
            {:else if notification.__typename === 'PurchaseNotification'}
              <p class="body-15-b">{notification.post.publishedRevision?.title} 포스트를 구매했어요!</p>
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
