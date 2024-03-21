<script lang="ts">
  import IconX from '~icons/tabler/x';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon } from '$lib/components';
  import { css, cx } from '$styled-system/css';
  import { center } from '$styled-system/patterns';

  export let postId: string;
  export let emoji: string;
  export let mine: boolean;

  const deletePostReaction = graphql(`
    mutation Emoji_DeletePostReaction_Mutation($input: DeletePostReactionInput!) {
      deletePostReaction(input: $input) {
        id

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
      css({
        position: 'relative',
        borderWidth: '1px',
        borderColor: 'gray.200',
        borderRadius: '8px',
        padding: '2px',
        size: '24px',
        textAlign: 'center',
        backgroundColor: 'gray.50',
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
    <Icon
      style={css.raw({
        position: 'absolute',
        top: '1/2',
        left: '1/2',
        translate: 'auto',
        translateX: '-1/2',
        translateY: '-1/2',
        transition: 'common',
        userSelect: 'none',
        opacity: '0',
        _groupHover: { opacity: '100' },
      })}
      icon={IconX}
      size={20}
    />
  </button>
{:else}
  <em-emoji id={emoji} class={center({ 'size': '18px', '& img': { display: '[block!]' } })} set="twitter" />
{/if}
