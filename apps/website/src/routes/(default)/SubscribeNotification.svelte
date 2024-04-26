<script lang="ts">
  import dayjs from 'dayjs';
  import ky from 'ky';
  import IconCheck from '~icons/tabler/check';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import type { SubscribeNotification_subscribeNotification } from '$glitch';

  let _subscribeNotification: SubscribeNotification_subscribeNotification;
  export { _subscribeNotification as $subscribeNotification };

  $: subscribeNotification = fragment(
    _subscribeNotification,
    graphql(`
      fragment SubscribeNotification_subscribeNotification on SubscribeNotification {
        id
        category
        state
        createdAt

        actor {
          id
          name
        }

        space {
          id
          name
        }
      }
    `),
  );

  const markNotificationAsRead = graphql(`
    mutation SubscribeNotification_MarkNotificationAsRead_Mutation($input: MarkNotificationAsReadInput!) {
      markNotificationAsRead(input: $input) {
        id
        state
      }
    }
  `);

  const redirect = async (notification: typeof $subscribeNotification) => {
    if (notification.state === 'UNREAD') {
      await markNotificationAsRead({ notificationId: notification.id });
      mixpanel.track('user:notification-state:read');
    }

    const resp = await ky.get(`/api/notification/${notification.id}`);
    await goto(resp.url);
  };
</script>

<button
  class={css(
    {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '4px',
      borderBottomWidth: '1px',
      borderBottomColor: 'gray.100',
      paddingX: '16px',
      paddingY: '20px',
      width: 'full',
      transition: 'common',
      _hover: { backgroundColor: 'gray.100' },
    },
    $subscribeNotification.state === 'UNREAD' && { backgroundColor: 'gray.50' },
  )}
  type="button"
  on:click={() => redirect($subscribeNotification)}
>
  <Icon style={css.raw({ marginTop: '3px' })} icon={IconCheck} size={12} />

  <div class={css({ flexGrow: '1', textAlign: 'left' })}>
    <div class={css({ fontSize: '13px', color: 'gray.500' })}>스페이스 구독</div>
    <div class={css({ fontSize: '14px', fontWeight: 'medium' })}>
      {$subscribeNotification.actor?.name}님이 {$subscribeNotification.space.name.length > 10
        ? `${$subscribeNotification.space.name.slice(0, 10)}...`
        : $subscribeNotification.space.name} 스페이스를 구독했어요
    </div>
    <time
      class={css({
        display: 'inline-block',
        width: 'full',
        fontSize: '11px',
        textAlign: 'right',
        color: 'gray.400',
      })}
      datetime={$subscribeNotification.createdAt}
    >
      {dayjs($subscribeNotification.createdAt).fromNow()}
    </time>
  </div>
</button>
