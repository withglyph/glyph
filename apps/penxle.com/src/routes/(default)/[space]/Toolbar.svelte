<script lang="ts">
  import clsx from 'clsx';
  import { fragment, graphql } from '$glitch';
  import { Tooltip } from '$lib/components';
  import EmojiPicker from '$lib/emoji/EmojiPicker.svelte';
  import LoginRequireModal from '../LoginRequireModal.svelte';
  import type { Toolbar_query } from '$glitch';

  let targetEl: HTMLDivElement;
  let prevScrollpos = 0;
  let focusMode = false;
  let loginRequireOpen = false;

  let _query: Toolbar_query;
  export { _query as $query };
  export let handleShare: () => void;

  $: query = fragment(
    _query,
    graphql(`
      fragment Toolbar_query on Query {
        me {
          id
        }

        post(permalink: $permalink) {
          id
          likeCount
          liked
          receiveFeedback

          reactions {
            id
            emoji
            mine
          }
        }

        ...EmojiPicker_query
      }
    `),
  );

  const likePost = graphql(`
    mutation Toolbar_LikePost_Mutation($input: LikePostInput!) {
      likePost(input: $input) {
        id
        liked
        likeCount
      }
    }
  `);

  const unlikePost = graphql(`
    mutation Toolbar_UnlikePost_Mutation($input: UnlikePostInput!) {
      unlikePost(input: $input) {
        id
        liked
        likeCount
      }
    }
  `);

  let likeTargetEl: HTMLButtonElement;
  let timeoutId: NodeJS.Timeout;

  const handleLikeClick = async () => {
    if (!$query.me) {
      loginRequireOpen = true;
      return;
    }

    await likePost({ postId: $query.post.id });

    for (const child of likeTargetEl.children) {
      child.classList.add('like');
    }

    timeoutId = setTimeout(() => {
      for (const child of likeTargetEl.children) {
        child.classList.remove('like');
      }
    }, 600);
  };

  const handleUnlikeClick = async () => {
    await clearTimeout(timeoutId);
    await unlikePost({ postId: $query.post.id });
  };
</script>

<svelte:window
  on:scroll={(e) => {
    if (e.currentTarget.innerWidth <= 800) {
      var currentScrollPos = e.currentTarget.scrollY;

      targetEl.style.bottom = prevScrollpos > currentScrollPos ? '1rem' : '-50px';
      prevScrollpos = currentScrollPos;
    }
  }}
/>

<div
  bind:this={targetEl}
  class={clsx(
    'fixed z-1 bottom-4 w-full flex center px-4 mr-0 transition-bottom',
    focusMode && 'sm:(justify-end! px-0!)',
  )}
>
  <div
    class={clsx(
      'py-2 px-6 w-full max-w-107 bg-gray-80 rounded-2xl shadow-[0_4px_16px_0_rgba(0,0,0,0.15)]',
      focusMode && 'sm:(p-0! square-12! rounded-r-none)',
    )}
  >
    <button
      class={clsx(
        "before:(content-[''] flex center h-6 w-1 mx-4 bg-gray-50 rounded-full) h-full w-full <sm:hidden",
        !focusMode && 'hidden',
      )}
      type="button"
      on:click={() => (focusMode = false)}
    />

    <div class={clsx('flex items-center justify-between', focusMode && 'sm:hidden!')}>
      <button class="flex center" type="button" on:click={handleShare}>
        <i class="i-lc-share square-5 text-icon-tertiary" />
      </button>

      <div class="flex gap-2 items-center justify-between h-8 px-2 border border-alphawhite-15 rounded-xl <sm:hidden">
        {#if $query.post.reactions.length > 0}
          <ul class="flex center relative w-11">
            {#each $query.post.reactions.slice(0, 4) as reaction, idx (reaction.id)}
              <em-emoji
                id={reaction.emoji}
                style:left={`${idx * 10}px`}
                class="square-4.5 text-center absolute top-50% -translate-y-50%"
                set="twitter"
              />
            {/each}
          </ul>
        {/if}

        <Tooltip
          enabled={!$query.post.receiveFeedback}
          message="피드백 받기를 설정하지 않은 포스트에요"
          placement="top"
        >
          <EmojiPicker {$query} disabled={!$query.post.receiveFeedback} variant="toolbar" />
        </Tooltip>
      </div>

      <button class="flex center" type="button">
        <i class="i-lc-bookmark square-5 text-icon-tertiary" />
      </button>
      {#if $query.post.liked}
        <button bind:this={likeTargetEl} class="relative flex center" type="button" on:click={handleUnlikeClick}>
          <i class="linearGradient i-px-heart-fill square-5 bg-red-50" />
          <i class="heartAnimation1 absolute top-0 left-0 hidden i-px-heart-fill square-2.5 bg-red-50" />
          <i class="heartAnimation2 absolute top-0 left-0 hidden i-px-heart-fill square-2.5 bg-red-50" />
        </button>
      {:else}
        <button class="flex center relative" type="button" on:click={handleLikeClick}>
          <i class="i-px-heart square-5 text-icon-tertiary" />
        </button>
      {/if}
      <button
        class={clsx(
          'flex center px-2 h-8 gap-1 rounded-xl text-icon-tertiary border border-primary',
          focusMode && 'border-green-50! bg-green-50 bg-opacity-10 text-green-50',
        )}
        type="button"
        on:click={() => (focusMode = !focusMode)}
      >
        <i class="i-lc-file-text square-5" />
        <span class="caption-12-b">집중모드</span>
      </button>
    </div>
  </div>
</div>

<LoginRequireModal bind:open={loginRequireOpen} />

<style>
  .linearGradient {
    background: #f66062;
    background: linear-gradient(30deg, #f66062 30%, #f87a7c 66%, #fa9e9f 78%, #fbb7b8 85%, #ffffff 100%);
    -webkit-text-fill-color: transparent;
  }

  .linearGradient.like {
    animation: heartPulse 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    border-color: currentColor;
    filter: grayscale(0);
  }

  .heartAnimation1.like {
    display: block;
    animation: heartFloatMain-1 100ms cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  }

  .heartAnimation2.like {
    display: block;
    animation: heartFloatMain-2 200ms 100ms cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  }

  @keyframes heartPulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  @keyframes heartFloatMain-1 {
    0% {
      visibility: hidden;
      transform: translate(0) rotate(0);
    }
    100% {
      visibility: visible;
      transform: translate(-10px, -9px) rotate(-55deg);
    }
  }

  @keyframes heartFloatMain-2 {
    0% {
      opacity: 0;
      transform: translate(0) rotate(0) scale(0);
    }
    100% {
      opacity: 0.9;
      transform: translate(-3px, -22px) rotate(25deg) scale(1);
    }
  }
</style>
