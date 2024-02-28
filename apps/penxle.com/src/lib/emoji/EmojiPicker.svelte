<script lang="ts">
  import clsx from 'clsx';
  import * as EmojiMart from 'emoji-mart';
  import { onMount } from 'svelte';
  import IconMoodPlus from '~icons/tabler/mood-plus';
  import { afterNavigate } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon } from '$lib/components';
  import { createFloatingActions } from '$lib/svelte/actions';
  import LoginRequireModal from '../../routes/(default)/LoginRequireModal.svelte';
  import i18n from './i18n.json';
  import { emojiData as data } from './index';
  import type { Emoji } from '@emoji-mart/data';
  import type { EmojiPicker_query } from '$glitch';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let picker: any;
  let open = false;
  let loginRequireOpen = false;

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

  const { anchor, floating } = createFloatingActions({
    placement: 'bottom-start',
    offset: 4,
  });

  onMount(() => {
    picker = new EmojiMart.Picker({
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
    EmojiMart.init({ data, i18n, exceptEmojis });
  }

  afterNavigate(() => {
    open = false;
  });
</script>

{#if variant === 'post'}
  <button
    class="square-6 rounded hover:bg-gray-50 flex center disabled:(text-disabled border-gray-30 cursor-not-allowed)"
    {disabled}
    type="button"
    on:click={(e) => {
      e.stopPropagation();
      open = true;
    }}
    use:anchor
  >
    <Icon class="square-5" icon={IconMoodPlus} />
  </button>
{:else}
  <button
    class="square-6 flex center rounded hover:bg-gray-50 disabled:(text-disabled border-gray-30 cursor-not-allowed)"
    {disabled}
    type="button"
    on:click={(e) => {
      e.stopPropagation();
      open = true;
    }}
    use:anchor
  >
    <Icon class="text-gray-700 square-5 block" icon={IconMoodPlus} />
  </button>
{/if}

<div bind:this={pickerEl} class={clsx('z-50 h-100', !open && 'hidden')} use:floating />

<LoginRequireModal bind:open={loginRequireOpen} />

<style>
  :global(em-emoji-picker) {
    --uno: h-100;
  }
</style>
