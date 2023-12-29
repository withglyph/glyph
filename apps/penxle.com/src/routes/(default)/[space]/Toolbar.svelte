<script lang="ts">
  import clsx from 'clsx';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Tooltip } from '$lib/components';
  import EmojiPicker from '$lib/emoji/EmojiPicker.svelte';
  import { toast } from '$lib/notification';
  import LoginRequireModal from '../LoginRequireModal.svelte';
  import type { Toolbar_query } from '$glitch';

  let targetEl: HTMLDivElement;
  let prevScrollpos = 0;
  let focusMode = false;
  let loginRequireOpen = false;
  let likeAnimate = false;
  let bookmarkAnimate = false;

  let _query: Toolbar_query;
  export { _query as $query };
  export let handleShare: () => void;

  $: query = fragment(
    _query,
    graphql(`
      fragment Toolbar_query on Query {
        me {
          id

          bookmarks {
            id
          }
        }

        post(permalink: $permalink) {
          id
          likeCount
          liked
          receiveFeedback

          bookmarkGroups {
            id
          }

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

  const bookmarkPost = graphql(`
    mutation Toolbar_BookmarkPost_Mutation($input: BookmarkPostInput!) {
      bookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);

  const unbookmarkPost = graphql(`
    mutation Toolbar_UnbookmarkPost_Mutation($input: UnbookmarkPostInput!) {
      unbookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);

  const toggleLike = async () => {
    if (!$query.me) {
      loginRequireOpen = true;
      return;
    }

    likeAnimate = !$query.post.liked;

    if ($query.post.liked) {
      await unlikePost({ postId: $query.post.id });
      mixpanel.track('post:unlike', { postId: $query.post.id, via: 'toolbar' });
    } else {
      await likePost({ postId: $query.post.id });
      mixpanel.track('post:like', { postId: $query.post.id, via: 'toolbar' });
    }
  };

  const toggleBookmark = async () => {
    if (!$query.me) {
      loginRequireOpen = true;
      return;
    }

    bookmarkAnimate = $query.post.bookmarkGroups.length <= 0;

    if ($query.post.bookmarkGroups.length > 0) {
      unbookmarkPost({ bookmarkId: $query.post.bookmarkGroups[0].id, postId: $query.post.id });
      mixpanel.track('post:unbookmark', { postId: $query.post.id, via: 'toolbar' });
      toast.success('북마크에서 삭제했어요');
    } else {
      bookmarkPost({ postId: $query.post.id });
      mixpanel.track('post:bookmark', { postId: $query.post.id, via: 'toolbar' });
      toast.success('북마크에 저장되었어요');
    }
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
    'py-2 px-6 w-full max-w-107 bg-gray-80 rounded-2xl shadow-[0_4px_16px_0_rgba(0,0,0,0.15)] fixed bottom-4 z-1 transition-bottom',
    focusMode && 'sm:(p-0! square-12! rounded-r-none)',
  )}
>
  <!-- <button
      class={clsx(
        "before:(content-[''] flex center h-6 w-1 mx-4 bg-gray-50 rounded-full) h-full w-full <sm:hidden",
        !focusMode && 'hidden',
      )}
      type="button"
      on:click={() => (focusMode = false)}
    /> -->

  <div class={clsx('h-8 flex items-center justify-between', focusMode && 'sm:hidden!')}>
    <button class="flex center" type="button" on:click={handleShare}>
      <i class="i-lc-share square-5 bg-[#5C5755]" />
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

      <Tooltip enabled={!$query.post.receiveFeedback} message="피드백 받기를 설정하지 않은 포스트예요" placement="top">
        <EmojiPicker {$query} disabled={!$query.post.receiveFeedback} variant="toolbar" />
      </Tooltip>
    </div>

    <button
      class="relative flex center"
      aria-pressed={$query.post.bookmarkGroups.length > 0}
      data-animate={bookmarkAnimate}
      type="button"
      on:click={toggleBookmark}
    >
      <i class="bg-[#5C5755] bookmarkLinearGradient i-px-bookmark-fill square-5" />
      <i
        class="bookmarkLinearGradient bookmarkAnimation1 absolute -top-0.25 left-4.5 hidden i-px-star rotate-45 square-2"
      />
      <i class="bookmarkLinearGradient bookmarkAnimation2 absolute -top-1.25 -left-1 hidden i-px-star square-2" />
    </button>

    <button
      class="relative flex center group"
      aria-pressed={$query.post.liked}
      data-animate={likeAnimate}
      type="button"
      on:click={toggleLike}
    >
      <i class="bg-[#5C5755] likeLinearGradient i-px-heart-fill square-5" />
      <i class="heartAnimation1 absolute top-0 left-0 hidden i-px-heart-fill square-2.5 bg-red-50" />
      <i class="heartAnimation2 absolute top-0 left-0 hidden i-px-heart-fill square-2.5 bg-red-50" />
    </button>

    <!-- <button
        class={clsx(
          'flex center px-2 h-8 gap-1 rounded-xl text-disabled border border-alphawhite-15',
          focusMode && 'border-green-50! bg-green-50 bg-opacity-10 text-green-50',
        )}
        type="button"
        on:click={() => (focusMode = !focusMode)}
      >
        <i class="i-lc-file-text square-5" />
        <span class="caption-12-b">집중모드</span>
      </button> -->
  </div>
</div>

<LoginRequireModal bind:open={loginRequireOpen} />

<style>
  button[aria-pressed='true'] {
    & .bookmarkLinearGradient {
      background: #fcd242;
      background: linear-gradient(30deg, #fcd242 50%, #ffffff 100%);
      -webkit-text-fill-color: transparent;
    }

    & .likeLinearGradient {
      background: #f66062;
      background: linear-gradient(30deg, #f66062 30%, #f87a7c 66%, #fa9e9f 78%, #fbb7b8 85%, #ffffff 100%);
      -webkit-text-fill-color: transparent;
    }
  }

  button[data-animate='true'][aria-pressed='true'] .bookmarkLinearGradient {
    animation: heartPulse 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    border-color: currentColor;
    filter: grayscale(0);
  }

  button[data-animate='true'][aria-pressed='true'] .likeLinearGradient {
    animation: heartPulse 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    border-color: currentColor;
    filter: grayscale(0);
  }

  button[data-animate='true'][aria-pressed='true'] .heartAnimation1 {
    display: block;
    animation: heartFloat1 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  }

  button[data-animate='true'][aria-pressed='true'] .heartAnimation2 {
    display: block;
    animation: heartFloat2 800ms 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  }

  button[data-animate='true'][aria-pressed='true'] .bookmarkAnimation1 {
    display: block;
    animation: starFloat 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  }

  button[data-animate='true'][aria-pressed='true'] .bookmarkAnimation2 {
    display: block;
    animation: starFloat 800ms 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
  }
  @keyframes heartPulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  @keyframes heartFloat1 {
    0% {
      visibility: hidden;
      transform: translate(0) rotate(0);
    }
    50% {
      visibility: visible;
      transform: translate(1px, -14px) rotate(-15deg);
    }
    100% {
      visibility: hidden;
      transform: translate(0) rotate(0);
    }
  }

  @keyframes heartFloat2 {
    0% {
      visibility: hidden;
      transform: translate(0) rotate(0) scale(0);
    }
    50% {
      visibility: visible;
      transform: translate(3px, -22px) rotate(15deg) scale(1);
    }
    100% {
      visibility: hidden;
      transform: translate(0) rotate(0) scale(0);
    }
  }

  @keyframes starFloat {
    0% {
      visibility: hidden;
    }
    50% {
      visibility: visible;
    }
    100% {
      visibility: hidden;
    }
  }
</style>
