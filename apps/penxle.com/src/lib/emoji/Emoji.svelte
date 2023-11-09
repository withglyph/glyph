<script lang="ts">
  import { graphql } from '$glitch';

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
    }}
  >
    <em-emoji id={emoji} class="square-4.5 text-center" set="twitter" />
    <i
      class="i-lc-x square-5 absolute top-50% -translate-y-50% left-50% -translate-x-50% opacity-0 transition select-none"
    />
  </button>
{:else}
  <em-emoji id={emoji} class="square-4.5 text-center" set="twitter" />
{/if}
