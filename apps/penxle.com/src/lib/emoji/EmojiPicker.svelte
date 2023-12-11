<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import clsx from 'clsx';
  import { init, Picker } from 'emoji-mart';
  import { onMount, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
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
  export let variant: 'post' | 'toolbar' = 'post';
  export let disabled = false;

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
  $: exceptEmojis = $query.post.reactions.filter(({ mine }) => mine).map(({ emoji }) => emoji);

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

  onMount(() => {
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

        mixpanel.track('post:reaction:create', { postId: $query.post.id, emoji: emoji.id, via: variant });
      },
      exceptEmojis,
      perLine: 8,
      maxFrequentRows: 3,
      onClickOutside: () => (open = false),
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

{#if variant === 'post'}
  <button
    bind:this={targetEl}
    class="square-6 rounded-lg border border-secondary hover:border-primary flex center p-0.5 disabled:(text-disabled border-gray-30 cursor-not-allowed)"
    {disabled}
    type="button"
    on:click={(e) => {
      e.stopPropagation();
      open = true;
    }}
  >
    <i class="i-lc-smile-plus square-3.5" />
  </button>
{:else}
  <button
    bind:this={targetEl}
    class="square-5 hover:border-primary flex center p-0.5 disabled:(text-disabled border-gray-30 cursor-not-allowed)"
    {disabled}
    type="button"
    on:click={(e) => {
      e.stopPropagation();
      open = true;
    }}
  >
    <i class="i-px-happy bg-[#5C5755] square-4" />
  </button>
{/if}

<div bind:this={pickerEl} class={clsx('z-50 absolute h-100', !open && 'hidden')} />

<LoginRequireModal bind:open={loginRequireOpen} />

<style>
  :global(em-emoji-picker) {
    --uno: h-100;
  }
</style>
