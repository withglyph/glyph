<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import clsx from 'clsx';
  import { init, Picker } from 'emoji-mart';
  import { onMount, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { portal } from '$lib/svelte/actions';
  import LoginRequireModal from '../../routes/(default)/LoginRequireModal.svelte';
  import i18n from './i18n.json';
  import { emojiData as data } from './index';
  import type { Emoji } from '@emoji-mart/data';
  import type { EmojiPicker_query } from '$glitch';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let picker: any;
  let open = false;
  let loginRequireOpen = false;

  let targetEl: HTMLButtonElement;
  let pickerEl: HTMLDivElement;

  let _query: EmojiPicker_query;
  export { _query as $query };

  $: query = fragment(
    _query,
    graphql(`
      fragment EmojiPicker_query on Query {
        me {
          id
        }

        post(permalink: $permalink) {
          id

          reactions {
            id
            emoji
            mine
          }
        }
      }
    `),
  );

  let exceptEmojis: (string | undefined)[] = [];
  $: exceptEmojis = $query.post.reactions.filter((reaction) => reaction.mine).map((reaction) => reaction.emoji);

  const createPostReaction = graphql(`
    mutation EmojiPicker_CreatePostReaction_Mutation($input: CreatePostReactionInput!) {
      createPostReaction(input: $input) {
        id

        reactions {
          id
          emoji
          mine
        }
      }
    }
  `);

  const update = async () => {
    await tick();

    const position = await computePosition(targetEl, pickerEl, {
      placement: 'top-start',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    });

    Object.assign(pickerEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });
  };

  $: if (open) {
    void update();
  }

  afterNavigate(() => {
    open = false;
  });

  onMount(async () => {
    picker = new Picker({
      autoFocus: true,
      data,
      previewPosition: 'none',
      skinTonePosition: 'none',
      locale: 'kr',
      i18n,
      set: 'twitter',
      onEmojiSelect: async (emoji: Emoji) => {
        if (!$query.me) {
          loginRequireOpen = true;
          return;
        }
        open = false;

        await createPostReaction({
          postId: $query.post.id,
          emoji: emoji.id,
        });
      },
      exceptEmojis,
      perLine: 8,
      maxFrequentRows: 3,
    });

    pickerEl.append(picker);
  });

  $: if (picker) {
    init({ data, i18n, exceptEmojis });
  }

  afterNavigate(() => {
    open = false;
  });
</script>

<button
  bind:this={targetEl}
  class="square-6 rounded-lg border border-secondary hover:border-primary flex center p-0.5"
  type="button"
  on:click={() => (open = true)}
>
  <i class="i-lc-plus square-3.5" />
</button>

{#if open}
  <div
    class="fixed inset-0 z-49"
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />
{/if}

<div bind:this={pickerEl} class={clsx('z-50 absolute h-100', !open && 'hidden')} />

<LoginRequireModal bind:open={loginRequireOpen} />

<style>
  :global(em-emoji-picker) {
    --uno: h-100;
  }
</style>
