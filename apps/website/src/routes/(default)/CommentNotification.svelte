<script lang="ts">
  import dayjs from 'dayjs';
  import ky from 'ky';
  import IconMessageCircle from '~icons/tabler/message-circle';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$bifrost';
  import { mixpanel } from '$lib/analytics';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import type { CommentNotification_commentNotification } from '$bifrost';

  let _commentNotification: CommentNotification_commentNotification;
  export { _commentNotification as $commentNotification };

  $: commentNotification = fragment(
    _commentNotification,
    graphql(`
      fragment CommentNotification_commentNotification on CommentNotification {
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
    mutation CommentNotification_MarkNotificationAsRead_Mutation($input: MarkNotificationAsReadInput!) {
      markNotificationAsRead(input: $input) {
        id
        state
      }
    }
  `);

  const redirect = async (notification: typeof $commentNotification) => {
    if (notification.state === 'UNREAD') {
      await markNotificationAsRead({ notificationId: notification.id });
      mixpanel.track('user:notification-state:read');
    }

    const resp = await ky.get(`/api/notification/${notification.id}`);
    await goto(`${resp.url}#comment`);
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
    $commentNotification.state === 'UNREAD' && { backgroundColor: 'gray.50' },
  )}
  type="button"
  on:click={() => redirect($commentNotification)}
>
  <Icon style={css.raw({ marginTop: '3px' })} icon={IconMessageCircle} size={12} />

  <div class={css({ flexGrow: '1', textAlign: 'left' })}>
    <div class={css({ fontSize: '13px', color: 'gray.500' })}>댓글</div>
    <div class={css({ fontSize: '14px', fontWeight: 'medium' })}>
      {$commentNotification.actor?.name}님이
      {$commentNotification.post.publishedRevision?.title &&
      $commentNotification.post.publishedRevision?.title.length > 10
        ? `${$commentNotification.post.publishedRevision?.title.slice(0, 10)}...`
        : $commentNotification.post.publishedRevision?.title ?? '(제목 없음)'}에 댓글을 달았어요
    </div>
    <time
      class={css({
        display: 'inline-block',
        width: 'full',
        fontSize: '11px',
        textAlign: 'right',
        color: 'gray.400',
      })}
      datetime={$commentNotification.createdAt}
    >
      {dayjs($commentNotification.createdAt).fromNow()}
    </time>
  </div>
</button>
