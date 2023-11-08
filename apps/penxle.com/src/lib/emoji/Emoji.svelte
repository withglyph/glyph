<script lang="ts">
  import { graphql } from '$glitch';
  import { emojiData } from '.';

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
    class="bg-primary"
    type="button"
    on:click={async () => {
      await deletePostReaction({
        postId,
        emoji,
      });
    }}
  >
    {emojiData.emojis[emoji].skins[0].native}
  </button>
{:else}
  <span>{emojiData.emojis[emoji].skins[0].native}</span>
{/if}
