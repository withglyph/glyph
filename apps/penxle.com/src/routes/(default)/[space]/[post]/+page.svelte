<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { isTextSelection } from '@tiptap/core';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { onMount, tick } from 'svelte';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, Button, Image, Tag } from '$lib/components';
  import { EmojiPicker } from '$lib/emoji';
  import Emoji from '$lib/emoji/Emoji.svelte';
  import { FormValidationError } from '$lib/errors';
  import { toast } from '$lib/notification';
  import { portal } from '$lib/svelte/actions';
  import { TiptapBubbleMenu, TiptapRenderer } from '$lib/tiptap/components';
  import { humanizeNumber } from '$lib/utils';
  import LoginRequireModal from '../../LoginRequireModal.svelte';
  import Toolbar from './Toolbar.svelte';
  import type { Editor } from '@tiptap/core';
  import type { ContentFilterCategory } from '$glitch';

  let open = false;
  let editor: Editor;
  let targetEl: HTMLButtonElement;
  let menuEl: HTMLUListElement;
  let loginRequireOpen = false;
  let emojiOpen = false;
  let password = '';

  $: query = graphql(`
    query SpacePostPage_Query($permalink: String!) {
      me {
        id
      }

      post(permalink: $permalink) {
        id
        permalink
        shortlink
        likeCount
        liked
        viewCount
        unlocked

        option {
          id
          hasPassword
        }

        contentFilters
        blurred

        tags {
          id
          pinned

          tag {
            id
            name
          }
        }

        reactions {
          id
          emoji
          mine
        }

        space {
          id
          name
          description
          muted

          icon {
            id
            ...Image_image
          }

          meAsMember {
            id
          }
        }

        member {
          id

          profile {
            id
            name
            ...Avatar_profile
          }
        }

        revision {
          id
          title
          subtitle
          content
          createdAt
        }
      }

      ...EmojiPicker_query
      ...Toolbar_query
    }
  `);

  const update = async () => {
    await tick();

    const position = await computePosition(targetEl, menuEl, {
      placement: 'right',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    });

    Object.assign(menuEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });
  };

  $: if (open) {
    void update();
  }

  const updatePostView = graphql(`
    mutation SpacePostPage_UpdatePostView_Mutation($input: UpdatePostViewInput!) {
      updatePostView(input: $input)
    }
  `);

  const likePost = graphql(`
    mutation SpacePostPage_LikePost_Mutation($input: LikePostInput!) {
      likePost(input: $input) {
        id
        liked
        likeCount
      }
    }
  `);

  const unlikePost = graphql(`
    mutation SpacePostPage_UnlikePost_Mutation($input: UnlikePostInput!) {
      unlikePost(input: $input) {
        id
        liked
        likeCount
      }
    }
  `);

  const muteSpace = graphql(`
    mutation SpacePostPage_MuteSpace_Mutation($input: MuteSpaceInput!) {
      muteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  const unmuteSpace = graphql(`
    mutation SpacePostPage_UnmuteSpace_Mutation($input: UnmuteSpaceInput!) {
      unmuteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  const unlockPasswordedPost = graphql(`
    mutation SpacePostPage_UnlockPasswordedPost_Mutation($input: UnlockPasswordedPostInput!) {
      unlockPasswordedPost(input: $input) {
        id
        unlocked

        revision {
          id
          content
        }
      }
    }
  `);

  onMount(async () => {
    mixpanel.track('post:view', { postId: $query.post.id });
    await updatePostView({ postId: $query.post.id });
  });

  const handleShare = () => {
    const shortLink = `https://pnxl.me/${$query.post.shortlink}`;
    if (navigator.share) {
      navigator.share({
        title: $query.post.revision.title,
        url: shortLink,
      });
    } else {
      navigator.clipboard.writeText(shortLink);
      toast.success('링크가 복사되었어요');
    }
  };

  const filterToLocaleString: Record<ContentFilterCategory, string> = {
    ADULT: '😳 18세 이상 성인이 관람 가능한 포스트에요',
    CRIME: '🧪 약물/범죄 에 관련된 내용',
    CRUELTY: '🔪 다소 잔인한 내용',
    GAMBLING: '🤑 사행성 등 도박에 관련이 있는 내용',
    GROSSNESS: '벌래/징그러운 내용',
    HORROR: '☠️ 공포성 내용',
    INSULT: '🤬 부적절한 언어',
    OTHER: '🤔 기타 내용',
    PHOBIA: '😱 정신질환/공포증에 해당하는 내용',
    TRAUMA: '👻 PTSD/트라우마를 일으킬 수 있는 내용',
    VIOLENCE: '🔫 폭력성에 해당하는 내용',
  };

  let blurContent = true;

  $: blurContent = $query.post.blurred;

  const blurContentBoxHeight = 'min-h-11rem';
</script>

<article class="w-full bg-cardprimary py-7.5 px-4 sm:py-17">
  <div class="w-full max-w-187.5 mx-auto space-y-6">
    <header>
      <hgroup class="space-y-4">
        <h1 class="title-24-eb break-all sm:title-32-eb">{$query.post.revision.title}</h1>
        {#if $query.post.revision.subtitle}
          <p class="body-16-sb text-secondary break-all sm:subtitle-18-sb">{$query.post.revision.subtitle}</p>
        {/if}
      </hgroup>

      <div class="border-b border-secondary w-full flex flex-col mt-4.75 sm:mt-6">
        <div class="flex items-center pt-4 pb-5 gap-3">
          <div class="relative">
            <Image class="square-10.5 rounded-3.5" $image={$query.post.space.icon} />
            <Avatar
              class="square-6 absolute border border-bg-primary -right-1 -bottom-1"
              $profile={$query.post.member.profile}
            />
          </div>
          <div class="grow-1">
            <p class="body-15-b">{$query.post.space.name} · {$query.post.member.profile.name}</p>
            <div class="flex items-center gap-3.5 body-13-m text-secondary">
              <span>{dayjs($query.post.revision.createdAt).formatAsDate()}</span>
              <span class="flex items-center gap-1">
                <i class="i-lc-eye square-3.75" />
                {humanizeNumber($query.post.viewCount)}
              </span>
              <span class="flex items-center gap-1">
                <i class="i-px-heart square-3.75" />
                {humanizeNumber($query.post.likeCount)}
              </span>
              <span class="flex items-center gap-1">
                <i class="i-lc-alarm-clock square-3.75" />
                1분
              </span>
            </div>
          </div>

          <button class="i-lc-bookmark square-6" type="button" />
          <button class="i-lc-share square-6" type="button" on:click={handleShare} />
          <button
            bind:this={targetEl}
            class="i-lc-more-vertical square-6 text-icon-secondary"
            type="button"
            on:click={() => (open = true)}
          />

          {#if open}
            <div
              class="fixed inset-0 z-49"
              role="button"
              tabindex="-1"
              on:click={() => (open = false)}
              on:keypress={null}
              use:portal
            />

            <ul
              bind:this={menuEl}
              class="absolute z-50 w-64 flex flex-col border rounded bg-white p-2 shadow space-y-1"
              use:portal
            >
              {#if !$query.post.space.meAsMember}
                {#if $query.post.space.muted}
                  <li>
                    <button
                      class="w-full px-4 py-3 rounded-lg body-14-m text-disabled hover:(body-14-sb text-primary bg-primary)"
                      type="button"
                      on:click={async () => {
                        await unmuteSpace({ spaceId: $query.post.space.id });
                        toast.success('스페이스 숨기기를 해제했어요');
                        open = false;
                      }}
                    >
                      스페이스 숨기기 해제
                    </button>
                  </li>
                {:else}
                  <li>
                    <button
                      class="w-full px-4 py-3 rounded-lg body-14-m text-disabled hover:(body-14-sb text-primary bg-primary)"
                      type="button"
                      on:click={async () => {
                        if (!$query.me) {
                          loginRequireOpen = true;
                          return;
                        }

                        await muteSpace({ spaceId: $query.post.space.id });
                        toast.success('스페이스를 숨겼어요');
                        open = false;
                      }}
                    >
                      스페이스 숨기기
                    </button>
                  </li>
                {/if}
              {/if}
            </ul>
          {/if}
        </div>
      </div>
    </header>

    {#if $query.post.contentFilters.length > 0}
      <div class="p-4 rounded-3 border-(0.08333333rem solid border-secondary)" role="alert">
        <div class="mb-xs inline-flex items-center gap-1 body-14-b">
          <i class="i-px-alert-triangle square-4" />
          <span>포스트에 민감한 내용이 포함되어 있어요 감상에 유의해주세요</span>
        </div>
        <ul class="body-14-m">
          {#each $query.post.contentFilters as filter (filter)}
            <li class="mb-xs last:mb-none">{filterToLocaleString[filter]}</li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if !$query.post.option.hasPassword || $query.post.space.meAsMember || $query.post.unlocked}
      <div class="relative">
        <article
          class={clsx(blurContent && 'filter-blur-4px bg-#f9f9f8 opacity-50 select-none', blurContentBoxHeight)}
          aria-hidden={blurContent}
        >
          <TiptapRenderer class="bodylong-16-m" content={$query.post.revision.content} bind:editor />
        </article>

        {#if editor}
          <TiptapBubbleMenu {editor} when={(view) => isTextSelection(view.state.selection)}>
            <div class="bg-gray-90 text-sm text-gray-30 rounded-lg p-2">
              <button type="button">공유</button>
            </div>
          </TiptapBubbleMenu>
        {/if}

        {#if blurContent}
          <header
            class="p-4 rounded-3 absolute top-6 w-full left-auto right-auto flex flex-col items-center"
            role="alert"
          >
            <i class="i-px-alert-triangle square-6 block mb-2 color-text-secondary" />
            <h2 class="body-16-eb">포스트에 민감한 내용이 포함되어 있어요</h2>
            <p class="body-13-m m-0.62rem text-secondary">트리거 워닝 or 성인물 내용이 포함되어 있어요.</p>
            <Button
              size="sm"
              on:click={() => {
                blurContent = false;
              }}
            >
              내용 표시하기
            </Button>
          </header>
        {/if}
      </div>
    {:else}
      <form
        class="space-y-4 w-full flex flex-col center"
        on:submit={async () => {
          try {
            await unlockPasswordedPost({
              postId: $query.post.id,
              password,
            });
          } catch (err) {
            if (err instanceof FormValidationError) toast.error(err.message);
          }
        }}
      >
        <p class="body-16-eb">비밀번호를 입력해야하는 포스트에요</p>
        <input
          class="body-15-m bg-primary rounded-2.5 h-11.5 w-full max-w-83 px-3.5 py-2"
          placeholder="포스트 비밀번호 입력"
          type="password"
          bind:value={password}
        />
        <div class="w-full max-w-42">
          <Button class="w-full" size="lg" type="submit">포스트 보기</Button>
          <Button class="w-full text-secondary mt-2.5" size="xs" variant="text">피드로 돌아가기</Button>
        </div>
      </form>
    {/if}

    <div class="flex gap-2 flex-wrap">
      {#each $query.post.tags as { tag } (tag.id)}
        <Tag size="sm">
          #{tag.name}
        </Tag>
      {/each}
      <Button class="rounded-12! px-4!" color="tertiary" size="sm" variant="outlined">
        <i class="i-lc-plus square-4" />
      </Button>
    </div>
    <div class="flex items-center gap-2.5 flex-wrap mt-4!">
      <EmojiPicker {$query} />

      {#each $query.post.reactions.slice(0, 30) as reaction (reaction.id)}
        <Emoji emoji={reaction.emoji} mine={reaction.mine} postId={$query.post.id} />
      {/each}
      {#if $query.post.reactions.length > 30}
        {#if !emojiOpen}
          <button
            class="caption-12-m text-secondary rounded-3xl p-1 bg-primary transition hover:bg-surface-secondary"
            type="button"
            on:click={() => (emojiOpen = true)}
          >
            + {$query.post.reactions.length - 30}
          </button>
        {:else}
          {#each $query.post.reactions.slice(30) as reaction (reaction.id)}
            <Emoji emoji={reaction.emoji} mine={reaction.mine} postId={$query.post.id} />
          {/each}
        {/if}
      {/if}
    </div>

    <hr class="w-full border-color-alphagray-10" />

    <div class="mt-2! flex items-center justify-between py-2">
      <Button
        class="rounded-12! px-3! h-6!"
        color="tertiary"
        size="sm"
        variant="outlined"
        on:click={async () => {
          await ($query.post.liked ? unlikePost({ postId: $query.post.id }) : likePost({ postId: $query.post.id }));
        }}
      >
        {#if $query.post.liked}
          <i class="i-px-heart-fill square-4 mr-1 text-red-50" />
        {:else}
          <i class="i-px-heart square-4 mr-1" />
        {/if}
        <span class="body-15-b">{$query.post.likeCount}</span>
      </Button>

      <div>
        <button class="i-lc-bookmark square-6 mr-3" type="button" />
        <button class="i-lc-share square-6" type="button" on:click={handleShare} />
      </div>
    </div>

    <div class="bg-primary rounded-3xl">
      <div class="flex flex-col w-full center px-4 pb-4 mt-9">
        <Image class="square-15 rounded-2xl -mt-7.5" $image={$query.post.space.icon} />
        <p class="subtitle-18-eb mt-4 truncate w-full text-center">
          {$query.post.space.name}
        </p>
        <p class="body-15-sb text-secondary my-2 truncate text-center w-full">
          {$query.post.space.description ?? '아직 소개가 없어요'}
        </p>
        <Button class="rounded-12!" color="tertiary" size="md" variant="outlined">
          <i class="i-lc-bell square-5" />
          <span class="mx-2">알림받는중</span>
          <i class="i-lc-chevron-down square-5" />
        </Button>
      </div>
    </div>
  </div>
</article>

<LoginRequireModal bind:open={loginRequireOpen} />
<Toolbar {$query} {handleShare} />
