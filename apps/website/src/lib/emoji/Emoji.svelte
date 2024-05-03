<script lang="ts">
  import IconX from '~icons/tabler/x';
  import { graphql } from '$bifrost';
  import { mixpanel } from '$lib/analytics';
  import { Icon } from '$lib/components';
  import { cx } from '$styled-system/css';
  import { center } from '$styled-system/patterns';

  export let postId: string;
  export let emoji: string;
  export let mine: boolean;

  const deletePostReaction = graphql(`
    mutation Emoji_DeletePostReaction_Mutation($input: DeletePostReactionInput!) {
      deletePostReaction(input: $input) {
        id
        reactionCount

        reactions {
          id
          emoji
          mine
        }
      }
    }
  `);
</script>

{#if mine}
  <button
    class={cx(
      'group',
      center({
        position: 'relative',
        size: '24px',
        textAlign: 'center',
        backgroundColor: 'gray.100',
      }),
    )}
    type="button"
    on:click={async () => {
      await deletePostReaction({
        postId,
        emoji,
      });
      mixpanel.track('post:reaction:delete', { postId, emoji });
    }}
  >
    <em-emoji
      id={emoji}
      class={center({ 'size': '18px', '& img': { display: '[block!]' }, '_groupHover': { opacity: '30' } })}
      set="twitter"
    />
    <div
      class={center({
        position: 'absolute',
        top: '1/2',
        left: '1/2',
        translate: 'auto',
        translateX: '-1/2',
        translateY: '-1/2',
        color: 'gray.5',
        backgroundColor: 'gray.900/40',
        size: '24px',
        transition: 'common',
        userSelect: 'none',
        opacity: '0',
        _groupHover: { opacity: '100' },
      })}
    >
      <Icon icon={IconX} size={20} />
    </div>
  </button>
{:else}
  <div class={center({ size: '24px' })}>
    <em-emoji id={emoji} class={center({ 'size': '18px', '& img': { display: '[block!]' } })} set="twitter" />
  </div>
{/if}
