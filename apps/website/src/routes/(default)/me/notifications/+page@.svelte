<script lang="ts">
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconSettings from '~icons/tabler/settings';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Helmet, Icon } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import CommentNotification from '../../CommentNotification.svelte';
  import EmojiReactionNotification from '../../EmojiReactionNotification.svelte';
  import PurchaseNotification from '../../PurchaseNotification.svelte';
  import SubscribeNotification from '../../SubscribeNotification.svelte';

  $: query = graphql(`
    query MeNotificationsPage_Query {
      me @_required {
        id

        notifications {
          __typename
          id
          state

          ...CommentNotification_commentNotification
          ...SubscribeNotification_subscribeNotification
          ...PurchaseNotification_purchaseNotification
          ...EmojiReactionNotification_emojiReactionNotification
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
</script>

<Helmet description="받은 알림 목록을 둘러보세요" title="알림" />

<header>
  <div
    class={flex({
      align: 'center',
      justify: 'space-between',
      position: 'relative',
      borderBottomWidth: '1px',
      borderColor: 'gray.100',
      paddingX: '20px',
      paddingY: '14px',
      height: '55px',
    })}
  >
    <button type="button" on:click={() => history.back()}>
      <Icon icon={IconChevronLeft} size={24} />
    </button>

    <h1 class={css({ position: 'absolute', left: '1/2', translateX: '-1/2', fontWeight: 'semibold' })}>알림</h1>

    <a href="/me/settings/notifications">
      <Icon icon={IconSettings} size={20} />
    </a>
  </div>

  <div
    class={flex({
      align: 'center',
      justify: 'space-between',
      borderBottomWidth: '1px',
      borderColor: 'gray.100',
      paddingX: '20px',
      paddingY: '14px',
      height: '55px',
    })}
  >
    <p>
      <span class={css({ fontWeight: 'medium' })}>새소식</span>
      {unreadNotifications.length}
    </p>

    <Button size="sm" variant="gray-outline" on:click={async () => await readAllNotifications()}>모두 읽기</Button>
  </div>
</header>

<div class={flex({ flexDirection: 'column', flexGrow: '1', width: 'full' })}>
  <ul class={css({ marginX: 'auto', marginBottom: '28px', minHeight: '120px', width: 'full', maxWidth: '800px' })}>
    {#each $query.me.notifications as notification (notification.id)}
      <li>
        {#if notification.__typename === 'CommentNotification'}
          <CommentNotification $commentNotification={notification} />
        {:else if notification.__typename === 'SubscribeNotification'}
          <SubscribeNotification $subscribeNotification={notification} />
        {:else if notification.__typename === 'PurchaseNotification'}
          <PurchaseNotification $purchaseNotification={notification} />
        {:else if notification.__typename === 'EmojiReactionNotification'}
          <EmojiReactionNotification $emojiReactionNotification={notification} />
        {/if}
      </li>
    {:else}
      <p class={css({ fontSize: '15px', color: 'gray.400', textAlign: 'center' })}>알림이 없어요</p>
    {/each}
  </ul>
</div>
