<script lang="ts">
  import * as EmojiMart from 'emoji-mart';
  import { onMount } from 'svelte';
  import IconMoodPlus from '~icons/tabler/mood-plus';
  import { afterNavigate } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, LoginRequireAlert } from '$lib/components';
  import { createFloatingActions } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import i18n from './i18n.json';
  import { emojiData as data } from './index';
  import type { Emoji } from '@emoji-mart/data';
  import type { EmojiPicker_query } from '$glitch';
  import type { SystemStyleObject } from '$styled-system/types';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let picker: any;
  let open = false;
  let loginRequireOpen = false;

  let pickerEl: HTMLDivElement;

  let _query: EmojiPicker_query;
  export { _query as $query };

  export let variant: 'post' | 'toolbar' = 'post';
  export let disabled = false;
  export let style: SystemStyleObject | undefined = undefined;

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
        reactionCount

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

<button
  class={css(
    {
      display: 'flex',
      alignItems: 'center',
      size: '24px',
      _hover: { backgroundColor: 'gray.50' },
      _disabled: { borderColor: 'gray.300', color: 'gray.400', cursor: 'not-allowed' },
    },
    style,
  )}
  {disabled}
  type="button"
  on:click|stopPropagation={() => (open = true)}
  use:anchor
>
  <Icon icon={IconMoodPlus} size={24} />

  <slot />
</button>

<div bind:this={pickerEl} class={css({ height: '400px', zIndex: '50' }, !open && { display: 'none' })} use:floating />

<LoginRequireAlert bind:open={loginRequireOpen} />

<style>
  :global(em-emoji-picker) {
    height: 400px;
  }
</style>
