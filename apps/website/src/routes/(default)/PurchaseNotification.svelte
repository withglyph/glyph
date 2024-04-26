<script lang="ts">
  import dayjs from 'dayjs';
  import ky from 'ky';
  import IconCoin from '~icons/tabler/coin';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import type { PurchaseNotification_purchaseNotification } from '$glitch';

  let _purchaseNotification: PurchaseNotification_purchaseNotification;
  export { _purchaseNotification as $purchaseNotification };

  $: purchaseNotification = fragment(
    _purchaseNotification,
    graphql(`
      fragment PurchaseNotification_purchaseNotification on PurchaseNotification {
        id
        category
        state
        createdAt

        actor {
          id
          name
        }

        post {
          id

          publishedRevision {
            id
            title
          }
        }
      }
    `),
  );

  const markNotificationAsRead = graphql(`
    mutation PurchaseNotification_MarkNotificationAsRead_Mutation($input: MarkNotificationAsReadInput!) {
      markNotificationAsRead(input: $input) {
        id
        state
      }
    }
  `);

  const redirect = async (notification: typeof $purchaseNotification) => {
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
    $purchaseNotification.state === 'UNREAD' && { backgroundColor: 'gray.50' },
  )}
  type="button"
  on:click={() => redirect($purchaseNotification)}
>
  <Icon style={css.raw({ marginTop: '3px' })} icon={IconCoin} size={12} />

  <div class={css({ flexGrow: '1', textAlign: 'left' })}>
    <div class={css({ fontSize: '13px', color: 'gray.500' })}>구매</div>
    <div class={css({ fontSize: '14px', fontWeight: 'medium' })}>
      {$purchaseNotification.actor?.name}님이 {$purchaseNotification.post.publishedRevision?.title ?? '(제목 없음)'} 포스트를
      구매했어요
    </div>
    <time
      class={css({
        display: 'inline-block',
        width: 'full',
        fontSize: '11px',
        textAlign: 'right',
        color: 'gray.400',
      })}
      datetime={$purchaseNotification.createdAt}
    >
      {dayjs($purchaseNotification.createdAt).fromNow()}
    </time>
  </div>
</button>
