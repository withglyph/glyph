<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { isTextSelection } from '@tiptap/core';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, Button, Image, Tag } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import Modal from '$lib/components/Modal.svelte';
  import { EmojiPicker } from '$lib/emoji';
  import Emoji from '$lib/emoji/Emoji.svelte';
  import { FormValidationError } from '$lib/errors';
  import { toast } from '$lib/notification';
  import { TiptapBubbleMenu, TiptapRenderer } from '$lib/tiptap/components';
  import { createTiptapDocument, humanizeNumber } from '$lib/utils';
  import LoginRequireModal from '../../LoginRequireModal.svelte';
  import ShareContent from './ShareContent/ShareContent.svelte';
  import Toolbar from './Toolbar.svelte';
  import type { Editor, JSONContent } from '@tiptap/core';
  import type { Fragment } from '@tiptap/pm/model';
  import type { ContentFilterCategory } from '$glitch';

  let editor: Editor | undefined;
  let loginRequireOpen = false;
  let emojiOpen = false;
  let password = '';

  let share: { open: boolean; content: JSONContent | null } = {
    open: false,
    content: null,
  };

  function openShareContentModal(content: JSONContent) {
    share.open = true;
    share.content = content;
  }

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
        contentFilters
        blurred

        option {
          id
          hasPassword
        }

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
          slug
          name
          description
          muted
          followed

          icon {
            id
            ...Image_image
          }

          meAsMember {
            id
            role
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

  const followSpace = graphql(`
    mutation SpacePostPage_FollowSpace_Mutation($input: FollowSpaceInput!) {
      followSpace(input: $input) {
        id
        followed
      }
    }
  `);

  const deletePost = graphql(`
    mutation SpacePostPage_DeletePost_Mutation($input: DeletePostInput!) {
      deletePost(input: $input) {
        id
      }
    }
  `);

  let openDeletePostWarning = false;

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

  function fragmentToContent(fragment: Fragment) {
    const content = fragment.toJSON() as JSONContent[];
    return content;
  }
</script>

<Helmet title={$query.post.revision.title} />

<article class="w-full bg-cardprimary py-7.5 px-4 grow sm:py-17">
  <div class="w-full max-w-187.5 mx-auto space-y-6">
    <header>
      <hgroup class="space-y-4">
        <h1 class="title-24-eb break-all sm:title-32-eb">{$query.post.revision.title}</h1>
        {#if $query.post.revision.subtitle}
          <p class="body-16-sb text-secondary break-all sm:subtitle-18-sb">{$query.post.revision.subtitle}</p>
        {/if}
      </hgroup>

      <div class="border-b border-secondary w-full flex flex-col mt-4.75 sm:mt-6">
        <div class="flex items-start pt-4 pb-5 gap-3">
          <a class="relative" href={`/${$query.post.space.slug}`}>
            <Image class="square-10.5 rounded-3.5" $image={$query.post.space.icon} />
            <Avatar
              class="square-6 absolute border border-bg-primary -right-1 -bottom-1"
              $profile={$query.post.member.profile}
            />
          </a>
          <div class="grow-1">
            <a class="body-15-b break-all" href={`/${$query.post.space.slug}`}>
              {$query.post.space.name} · {$query.post.member.profile.name}
            </a>
            <div class="flex items-center flex-wrap body-13-m text-secondary">
              <span class="mr-3.5">{dayjs($query.post.revision.createdAt).formatAsDate()}</span>
              <div class="flex items-center gap-3.5 body-13-m text-secondary">
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
          </div>

          <button class="i-lc-bookmark square-6" type="button" />
          <button class="i-lc-share square-6" type="button" on:click={handleShare} />

          <Menu>
            <button slot="value" class="i-lc-more-vertical square-6 text-icon-secondary" type="button" />

            {#if !$query.post.space.meAsMember}
              {#if $query.post.space.muted}
                <MenuItem
                  on:click={async () => {
                    await unmuteSpace({ spaceId: $query.post.space.id });
                    toast.success('스페이스 숨기기를 해제했어요');
                  }}
                >
                  스페이스 숨기기 해제
                </MenuItem>
              {:else}
                <MenuItem
                  on:click={async () => {
                    if (!$query.me) {
                      loginRequireOpen = true;
                      return;
                    }

                    await muteSpace({ spaceId: $query.post.space.id });
                    toast.success('스페이스를 숨겼어요');
                  }}
                >
                  스페이스 숨기기
                </MenuItem>
              {/if}
              <MenuItem>포스트 신고하기</MenuItem>
            {:else if $query.post.member.id === $query.me?.id || $query.post.space.meAsMember?.role === 'ADMIN'}
              <MenuItem href={`/publish/${$query.post.permalink}`} type="link">수정하기</MenuItem>
              <MenuItem
                on:click={() => {
                  openDeletePostWarning = true;
                }}
              >
                삭제하기
              </MenuItem>
            {/if}
          </Menu>
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
          <TiptapBubbleMenu
            class="bg-gray-90 text-sm text-gray-30 rounded-lg p-2
							after:(absolute content-[''] bg-transparent top-110% left-50% translate--50% border-transparent border-t-color-gray-90 border-width-[0.5rem_0.5rem_0])"
            {editor}
            when={(view) => isTextSelection(view.state.selection)}
          >
            <button
              type="button"
              on:click={() => {
                if (!editor) throw new Error('editor is not initialized');

                const { state } = editor.view;
                const { from, to } = state.selection;

                const slice = state.doc.slice(from, to);

                const content = fragmentToContent(slice.content);

                content.filter((node) => node.type === 'text' || node.type === 'paragraph');
                const tiptapDocument = createTiptapDocument(content);

                openShareContentModal(tiptapDocument);
              }}
            >
              공유
            </button>
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
          if (!$query.me) {
            loginRequireOpen = true;
            return;
          }

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
        {#if !$query.post.space.meAsMember}
          {#if $query.post.space.followed}
            <Button class="rounded-12!" color="tertiary" size="md" variant="outlined">
              <i class="i-lc-bell square-5" />
              <span class="mx-2">알림받는중</span>
              <i class="i-lc-chevron-down square-5" />
            </Button>
          {:else}
            <Button
              class="rounded-12!"
              size="md"
              on:click={async () => {
                if (!$query.me) {
                  loginRequireOpen = true;
                  return;
                }

                await followSpace({ spaceId: $query.post.space.id });
                toast.success('관심 스페이스로 등록되었어요');
              }}
            >
              + 관심
            </Button>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</article>

<LoginRequireModal bind:open={loginRequireOpen} />
<Toolbar {$query} {handleShare} />
<ShareContent
  spaceIcon={$query.post.space.icon}
  spaceName={$query.post.space.name}
  title={$query.post.revision.title}
  bind:open={share.open}
  bind:content={share.content}
/>

<Modal size="sm" bind:open={openDeletePostWarning}>
  <svelte:fragment slot="title">정말 포스트를 삭제하시겠어요?</svelte:fragment>

  <div slot="action" class="flex gap-2 w-full [&>button]:grow">
    <Button color="secondary" size="md" on:click={() => (openDeletePostWarning = false)}>취소</Button>
    <Button
      size="md"
      on:click={async () => {
        await deletePost({ postId: $query.post.id });
        await goto(`/${$query.post.space.slug}`);
        toast.success('포스트를 삭제했어요');
      }}
    >
      삭제
    </Button>
  </div>
</Modal>
