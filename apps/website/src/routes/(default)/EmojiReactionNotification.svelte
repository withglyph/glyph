<script lang="ts">
  import dayjs from 'dayjs';
  import * as EmojiMart from 'emoji-mart';
  import ky from 'ky';
  import { onMount } from 'svelte';
  import IconMoodHeart from '~icons/tabler/mood-heart';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$bifrost';
  import { mixpanel } from '$lib/analytics';
  import { Icon } from '$lib/components';
  import { emojiData } from '$lib/emoji';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type { EmojiReactionNotification_emojiReactionNotification } from '$bifrost';

  let _emojiReactionNotification: EmojiReactionNotification_emojiReactionNotification;
  export { _emojiReactionNotification as $emojiReactionNotification };

  export let via: 'menu' | 'page' = 'page';

  $: emojiReactionNotification = fragment(
    _emojiReactionNotification,
    graphql(`
      fragment EmojiReactionNotification_emojiReactionNotification on EmojiReactionNotification {
        id
        category
        state
        createdAt
        emoji

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
    mutation emojiReactionNotification_MarkNotificationAsRead_Mutation($input: MarkNotificationAsReadInput!) {
      markNotificationAsRead(input: $input) {
        id
        state
      }
    }
  `);

  const redirect = async (notification: typeof $emojiReactionNotification) => {
    if (notification.state === 'UNREAD') {
      await markNotificationAsRead({ notificationId: notification.id });
      mixpanel.track('user:notification-state:read');
    }

    const resp = await ky.get(`/api/notification/${notification.id}`);
    await goto(resp.url);
  };

  onMount(() => {
    EmojiMart.init({ data: emojiData });
  });
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
    $emojiReactionNotification.state === 'UNREAD' && { backgroundColor: 'gray.50' },
  )}
  type="button"
  on:click={() => redirect($emojiReactionNotification)}
>
  <Icon style={css.raw({ marginTop: '3px' })} icon={IconMoodHeart} size={12} />

  <div class={css({ flexGrow: '1', textAlign: 'left' })}>
    <div class={css({ fontSize: '13px', color: 'gray.500' })}>이모지</div>
    <div
      class={flex({ align: 'center', wrap: 'wrap', fontSize: '14px', fontWeight: 'medium', wordBreak: 'break-all' })}
    >
      {$emojiReactionNotification.actor?.name}님이
      {$emojiReactionNotification.post.publishedRevision?.title &&
      $emojiReactionNotification.post.publishedRevision?.title.length > 10
        ? `${$emojiReactionNotification.post.publishedRevision?.title.slice(0, 10)}...`
        : $emojiReactionNotification.post.publishedRevision?.title ?? '(제목 없음)'}에

      {#if via === 'menu'}
        이모지를
      {:else}
        <em-emoji
          id={$emojiReactionNotification.emoji}
          class={center({
            'marginLeft': '4px',
            'marginBottom': '2px',
            'size': '14px',
            '& > span': { display: 'block', size: '14px' },
          })}
          set="twitter"
        />
        을
      {/if}
      남겼어요
    </div>
    <time
      class={css({
        display: 'inline-block',
        width: 'full',
        fontSize: '11px',
        textAlign: 'right',
        color: 'gray.400',
      })}
      datetime={$emojiReactionNotification.createdAt}
    >
      {dayjs($emojiReactionNotification.createdAt).fromNow()}
    </time>
  </div>
</button>
