<script lang="ts">
  import IconX from '~icons/tabler/x';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon } from '$lib/components';

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
    class="relative bg-primary p-0.5 square-6 rounded-lg text-center border border-secondary [&>em-emoji]:hover:opacity-30 [&>i]:hover:opacity-100"
    type="button"
    on:click={async () => {
      await deletePostReaction({
        postId,
        emoji,
      });
      mixpanel.track('post:reaction:delete', { postId, emoji });
    }}
  >
    <em-emoji id={emoji} class="square-4.5 text-center" set="twitter" />
    <Icon
      class="square-5 absolute top-50% -translate-y-50% left-50% -translate-x-50% opacity-0 transition select-none"
      icon={IconX}
    />
  </button>
{:else}
  <em-emoji id={emoji} class="square-4.5 text-center" set="twitter" />
{/if}
