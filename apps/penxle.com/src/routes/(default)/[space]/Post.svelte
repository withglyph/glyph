<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { afterNavigate, goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, Button, Image, Tag, Tooltip } from '$lib/components';
  // import Feed from '$lib/components/Feed.svelte';
  import { Menu, MenuItem } from '$lib/components/menu';
  import Modal from '$lib/components/Modal.svelte';
  import { EmojiPicker } from '$lib/emoji';
  import Emoji from '$lib/emoji/Emoji.svelte';
  import { FormValidationError } from '$lib/errors';
  import { toast } from '$lib/notification';
  import { TiptapRenderer } from '$lib/tiptap/components';
  import { calcurateReadingTime, createTiptapDocument, humanizeNumber } from '$lib/utils';
  import LoginRequireModal from '../LoginRequireModal.svelte';
  import GalleryPost from './GalleryPost.svelte';
  import SelectionBubbleMenu from './SelectionBubbleMenu.svelte';
  import ShareContent from './ShareContent/ShareContent.svelte';
  import Toolbar from './Toolbar.svelte';
  import type { Editor, JSONContent } from '@tiptap/core';
  import type { Fragment } from '@tiptap/pm/model';
  import type { ContentFilterCategory, Post_postRevision, Post_query } from '$glitch';

  let editor: Editor | undefined;
  let loginRequireOpen = false;
  let emojiOpen = false;
  let password = '';
  let openDeletePostWarning = false;
  let blurContent = true;
  let element: 'a' | 'div';
  let adultOpen = false;

  $: element = preview ? 'div' : 'a';

  export let preview = false;
  export let mode: 'desktop' | 'mobile' | null = null;

  let _class: string | undefined = undefined;
  export { _class as class };

  let _query: Post_query;
  export { _query as $query };

  let _postRevision: Post_postRevision;
  export { _postRevision as $postRevision };

  $: query = fragment(
    _query,
    graphql(`
      fragment Post_query on Query {
        me {
          id
          isAdulthood

          personalIdentity {
            id
          }

          bookmarks {
            id
          }
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
          hasPassword
          receiveFeedback
          discloseStats
          protectContent
          publishedAt

          collection {
            id
            name
            count

            thumbnail {
              id
              ...Image_image
            }
          }

          previousPost {
            id
            permalink

            publishedRevision @_required {
              id
              title
            }
          }

          nextPost {
            id
            permalink

            publishedRevision @_required {
              id
              title
            }
          }

          bookmarkGroups {
            id
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
        }

        ...EmojiPicker_query
        ...Toolbar_query
        ...SpacePostPage_GalleryPost_query
      }
    `),
  );

  $: postRevision = fragment(
    _postRevision,
    graphql(`
      fragment Post_postRevision on PostRevision @_required {
        id
        title
        subtitle
        content
        characterCount
        createdAt
        contentKind
        previewText
        autoIndent

        croppedThumbnail {
          id
          url
        }

        tags {
          id
          name
        }
      }
    `),
  );

  $: if (blurContent) {
    blurContent = $query.post.blurred;
  }

  afterNavigate(() => {
    blurContent = $query.post.blurred;
  });

  $: if ($query.post.contentFilters.includes('ADULT') && (!$query.me?.personalIdentity || !$query.me?.isAdulthood)) {
    adultOpen = true;
  }

  let share: { open: boolean; content: JSONContent | null } = {
    open: false,
    content: null,
  };

  function openShareContentModal(content: JSONContent) {
    share.open = true;
    share.content = content;
  }

  const likePost = graphql(`
    mutation Post_LikePost_Mutation($input: LikePostInput!) {
      likePost(input: $input) {
        id
        liked
        likeCount
      }
    }
  `);

  const unlikePost = graphql(`
    mutation Post_UnlikePost_Mutation($input: UnlikePostInput!) {
      unlikePost(input: $input) {
        id
        liked
        likeCount
      }
    }
  `);

  const muteSpace = graphql(`
    mutation Post_MuteSpace_Mutation($input: MuteSpaceInput!) {
      muteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  const unmuteSpace = graphql(`
    mutation Post_UnmuteSpace_Mutation($input: UnmuteSpaceInput!) {
      unmuteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  const unlockPasswordedPost = graphql(`
    mutation Post_UnlockPasswordedPost_Mutation($input: UnlockPasswordedPostInput!) {
      unlockPasswordedPost(input: $input) {
        id
        unlocked

        publishedRevision {
          id
          content
        }
      }
    }
  `);

  const followSpace = graphql(`
    mutation Post_FollowSpace_Mutation($input: FollowSpaceInput!) {
      followSpace(input: $input) {
        id
        followed
      }
    }
  `);

  const unfollowSpace = graphql(`
    mutation Post_UnfollowSpace_Mutation($input: UnfollowSpaceInput!) {
      unfollowSpace(input: $input) {
        id
        followed
      }
    }
  `);

  const deletePost = graphql(`
    mutation Post_DeletePost_Mutation($input: DeletePostInput!) {
      deletePost(input: $input) {
        id

        space {
          id
          slug
        }
      }
    }
  `);

  const bookmarkPost = graphql(`
    mutation Post_BookmarkPost_Mutation($input: BookmarkPostInput!) {
      bookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);

  const unbookmarkPost = graphql(`
    mutation Post_UnbookmarkPost_Mutation($input: UnbookmarkPostInput!) {
      unbookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);

  const handleShare = () => {
    const shortLink = `https://pnxl.me/${$query.post.shortlink}`;
    if (navigator.share) {
      navigator.share({
        title: $postRevision.title,
        url: shortLink,
      });
    } else {
      navigator.clipboard.writeText(shortLink);
      toast.success('링크가 복사되었어요');
    }
  };

  const filterToLocaleString: Record<ContentFilterCategory, { short: string; long: string }> = {
    ADULT: { short: '😳 선정성', long: '😳 18세 이상 성인이 관람 가능한 포스트예요' },
    CRIME: { short: '🧪 약물/범죄', long: '🧪 약물/범죄에 관련된 내용' },
    CRUELTY: { short: '🔪 다소 잔인함', long: '🔪 다소 잔인한 내용' },
    GAMBLING: { short: '🤑 사행성', long: '🤑 사행성 등 도박에 관련이 있는 내용' },
    GROSSNESS: {
      short: '🕷 벌레/징그러움 등으로 인한 혐오감',
      long: '🕷 벌레/징그러움 등 혐오감을 일으키는 내용',
    },
    HORROR: { short: '☠️ 공포성 내용', long: '☠️ 공포성 내용' },
    INSULT: { short: '🤬 부적절한 언어', long: '🤬 부적절한 언어' },
    OTHER: { short: '❗ 기타 내용으로 주의가 필요함', long: '❗ 열람에 주의가 필요한 기타 내용' },
    PHOBIA: { short: '😱 정신질환/공포증', long: '😱 정신질환/공포증에 해당하는 내용' },
    TRAUMA: { short: '👻 PTSD/트라우마', long: '👻 PTSD/트라우마를 일으킬 수 있는 내용' },
    VIOLENCE: { short: '🔫 폭력성', long: '🔫 폭력성에 해당하는 내용' },
  };

  function fragmentToContent(fragment: Fragment) {
    const content = fragment.toJSON() as JSONContent[];
    return content;
  }

  const handleContentProtection = (e: Event) => {
    if ($query.post.protectContent) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
</script>

<Helmet
  description={$postRevision.previewText}
  image={$postRevision.croppedThumbnail?.url ?? 'https://pnxl.net/assets/opengraph/default-cover.png'}
  title={$postRevision.title}
/>

<article class={clsx('w-full bg-cardprimary py-7.5 px-4 grow sm:py-17', _class)}>
  <div class="w-full max-w-187.5 mx-auto space-y-6">
    <header>
      <hgroup class="space-y-4">
        <h1 class="title-24-eb break-all sm:title-32-eb">{$postRevision.title}</h1>
        {#if $postRevision.subtitle}
          <p class="body-16-sb text-secondary break-all sm:subtitle-18-sb">{$postRevision.subtitle}</p>
        {/if}
      </hgroup>

      <div class="border-b border-secondary w-full flex flex-col mt-4.75 sm:mt-6">
        <div class="flex items-start pt-4 pb-5 gap-3">
          <svelte:element this={element} class="relative" href={preview ? undefined : `/${$query.post.space.slug}`}>
            <Image class="square-10.5 rounded-3.5 border border-secondary" $image={$query.post.space.icon} />
            <Avatar
              class="square-6 absolute border border-bg-primary -right-1 -bottom-1"
              $profile={$query.post.member.profile}
            />
          </svelte:element>

          <div class="grow-1">
            <svelte:element
              this={element}
              class="body-15-b break-all"
              href={preview ? undefined : `/${$query.post.space.slug}`}
            >
              {$query.post.space.name} · {$query.post.member.profile.name}
            </svelte:element>
            <div class="flex items-center flex-wrap body-13-m text-secondary">
              <span class="mr-3.5">{dayjs($query.post.publishedAt).formatAsDate()}</span>
              <div class="flex items-center gap-3.5 body-13-m text-secondary">
                {#if $query.post.discloseStats}
                  <span class="flex items-center gap-1">
                    <i class="i-lc-eye square-3.75" />
                    {humanizeNumber($query.post.viewCount)}
                  </span>
                  <span class="flex items-center gap-1">
                    <i class="i-px-heart square-3.75" />
                    {humanizeNumber($query.post.likeCount)}
                  </span>
                {/if}
                {#if $postRevision.contentKind === 'ARTICLE'}
                  <span class="flex items-center gap-1">
                    <i class="i-lc-alarm-clock square-3.75" />
                    {calcurateReadingTime($postRevision.characterCount)}분
                  </span>
                {/if}
              </div>
            </div>
          </div>

          {#if $query.post.bookmarkGroups.length}
            <button
              class="i-px-bookmark-fill square-6 bg-yellow-50"
              type="button"
              on:click={async () => {
                await unbookmarkPost({ bookmarkId: $query.post.bookmarkGroups[0].id, postId: $query.post.id });
                mixpanel.track('post:unbookmark', { postId: $query.post.id, via: 'post' });
                toast.success('북마크에서 삭제했어요');
              }}
            />
          {:else}
            <button
              class="i-px-bookmark-outline square-6"
              disabled={preview}
              type="button"
              on:click={async () => {
                if (!$query.me) {
                  loginRequireOpen = true;
                  return;
                }

                await bookmarkPost({ postId: $query.post.id });
                mixpanel.track('post:bookmark', { postId: $query.post.id, via: 'post' });
                toast.success('북마크에 저장되었어요');
              }}
            />
          {/if}

          <button class="i-lc-share square-6" disabled={preview} type="button" on:click={handleShare} />

          <Menu disabled={preview}>
            <i slot="value" class="i-lc-more-vertical square-6 text-icon-primary" />
            {#if !$query.post.space.meAsMember}
              {#if $query.post.space.muted}
                <MenuItem
                  on:click={async () => {
                    await unmuteSpace({ spaceId: $query.post.space.id });
                    mixpanel.track('space:unmute', { spaceId: $query.post.space.id, via: 'post' });
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
                    mixpanel.track('space:mute', { spaceId: $query.post.space.id, via: 'post' });
                    toast.success('스페이스를 숨겼어요');
                  }}
                >
                  스페이스 숨기기
                </MenuItem>
              {/if}
              <MenuItem>포스트 신고하기</MenuItem>
            {:else}
              {@const myPost = $query.post.member.id === $query.post.space.meAsMember.id}
              {#if myPost}
                <MenuItem href={`/editor/${$query.post.permalink}`} type="link">수정하기</MenuItem>
              {/if}
              {#if myPost || $query.post.space.meAsMember.role === 'ADMIN'}
                <MenuItem
                  on:click={() => {
                    openDeletePostWarning = true;
                  }}
                >
                  삭제하기
                </MenuItem>
              {/if}
            {/if}
          </Menu>
        </div>
      </div>
    </header>

    {#if $query.post.contentFilters.length > 0 && !blurContent}
      <div class="p-4 rounded-3 border-(0.08333333rem solid border-secondary)" role="alert">
        <div class="mb-xs inline-flex items-center gap-1 body-14-b">
          <i class="i-px-alert-triangle square-4" />
          <span>포스트에 민감한 내용이 포함되어 있어요</span>
        </div>
        <ul class="body-14-m">
          {#each $query.post.contentFilters as filter (filter)}
            <li class="mb-xs last:mb-none">{filterToLocaleString[filter].long}</li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if !$query.post.hasPassword || $query.post.space.meAsMember || $query.post.unlocked}
      <div class="relative">
        {#if $query.me?.personalIdentity || !$query.me?.isAdulthood}
          {#if $postRevision.contentKind === 'ARTICLE'}
            {#if blurContent}
              <header
                class="py-6 px-3 rounded-3 w-full flex flex-col gap-0.625rem items-center bg-primary"
                role="alert"
              >
                <div class="flex flex-col gap-2 items-center">
                  <i class="i-px-alert-triangle square-6 color-text-secondary" />
                  <h2 class="body-16-eb text-center break-keep">포스트에 민감한 내용이 포함되어 있어요</h2>
                </div>
                <ul class="flex gap-0.625rem flex-wrap justify-center max-w-26rem">
                  {#each $query.post.contentFilters as filter (filter)}
                    <Tag as="div" size="sm">{filterToLocaleString[filter].short}</Tag>
                  {/each}
                </ul>
                <Button
                  class="rounded-xl m-t-3"
                  size="sm"
                  on:click={() => {
                    blurContent = false;
                  }}
                >
                  내용 표시하기
                </Button>
              </header>
            {:else}
              <article
                on:copy|capture={handleContentProtection}
                on:cut|capture={handleContentProtection}
                on:contextmenu|capture={handleContentProtection}
              >
                <TiptapRenderer
                  class="bodylong-16-m"
                  autoIndent={$postRevision.autoIndent}
                  content={$postRevision.content}
                  bind:editor
                />
              </article>
            {/if}
          {:else}
            <GalleryPost {$query} {mode} revision={$postRevision} />
          {/if}
        {/if}

        {#if editor && !preview}
          <SelectionBubbleMenu class="flex" {editor}>
            <button
              class="shrink-0"
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
          </SelectionBubbleMenu>
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
            mixpanel.track('post:unlock', { postId: $query.post.id });
          } catch (err) {
            if (err instanceof FormValidationError) toast.error(err.message);
          }
        }}
      >
        <p class="body-16-eb">비밀번호를 입력해야하는 포스트예요</p>
        <input
          class="body-15-m bg-primary rounded-2.5 h-11.5 w-full max-w-83 px-3.5 py-2"
          placeholder="포스트 비밀번호 입력"
          type="password"
          bind:value={password}
        />
        <div class="w-full max-w-42">
          <Button class="w-full" size="lg" type="submit">포스트 보기</Button>
          <Button class="w-full text-secondary mt-2.5" href="/" size="xs" type="link" variant="text">
            피드로 돌아가기
          </Button>
        </div>
      </form>
    {/if}

    <hr class="w-full border-color-alphagray-10" />

    <div class="flex gap-2 flex-wrap">
      {#each $postRevision.tags as tag (tag.id)}
        <Tag href={preview ? undefined : `/tag/${tag.name}`} size="sm">
          #{tag.name}
        </Tag>
      {/each}
      <!-- <Button class="rounded-12! px-4!" color="tertiary" size="sm" variant="outlined">
        <i class="i-lc-plus square-4" />
      </Button> -->
    </div>
    <div class="flex items-center gap-2.5 flex-wrap mt-4!">
      {#if preview}
        <button
          class="square-6 rounded-lg border border-secondary hover:border-primary flex center p-0.5"
          type="button"
        >
          <i class="i-lc-smile-plus square-3.5" />
        </button>
      {:else}
        <Tooltip
          enabled={!$query.post.receiveFeedback}
          message="피드백 받기를 설정하지 않은 포스트예요"
          placement="top"
        >
          <EmojiPicker {$query} disabled={!$query.post.receiveFeedback} />
        </Tooltip>
      {/if}

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

    <div class="flex items-center justify-between py-2">
      <Button
        class="rounded-12! px-3.75! h-8! py-1.25! w-16"
        color="tertiary"
        disabled={preview}
        size="sm"
        variant="outlined"
        on:click={async () => {
          if (!$query.me) {
            loginRequireOpen = true;
            return;
          }

          if ($query.post.liked) {
            await unlikePost({ postId: $query.post.id });
            mixpanel.track('post:unlike', { postId: $query.post.id, via: 'post' });
          } else {
            await likePost({ postId: $query.post.id });
            mixpanel.track('post:like', { postId: $query.post.id, via: 'post' });
          }
        }}
      >
        {#if $query.post.liked}
          <i class="i-px-heart-fill square-4 text-red-50" />
        {:else}
          <i class="i-px-heart square-4" />
        {/if}
        {#if $query.post.discloseStats}
          <span class="body-15-b ml-1">{$query.post.likeCount}</span>
        {/if}
      </Button>

      <div>
        {#if $query.post.bookmarkGroups.length}
          <button
            class="i-px-bookmark-fill square-6 mr-3 bg-yellow-50"
            type="button"
            on:click={async () => {
              await unbookmarkPost({ bookmarkId: $query.post.bookmarkGroups[0].id, postId: $query.post.id });
              mixpanel.track('post:unbookmark', { postId: $query.post.id, via: 'post' });
              toast.success('북마크에서 삭제했어요');
            }}
          />
        {:else}
          <button
            class="i-px-bookmark-outline square-6 mr-3"
            disabled={preview}
            type="button"
            on:click={async () => {
              if (!$query.me) {
                loginRequireOpen = true;
                return;
              }

              await bookmarkPost({ postId: $query.post.id });
              mixpanel.track('post:bookmark', { postId: $query.post.id, via: 'post' });
              toast.success('북마크에 저장되었어요');
            }}
          />
        {/if}
        <button class="i-lc-share square-6" type="button" on:click={handleShare} />
      </div>
    </div>

    <div class="bg-primary rounded-2xl flex py-4 px-6 items-center gap-4">
      <svelte:element this={element} href={preview ? undefined : `/${$query.post.space.slug}`}>
        <Image class="square-16 rounded-2xl border border-secondary" $image={$query.post.space.icon} />
      </svelte:element>

      <div class="grow truncate">
        <svelte:element
          this={element}
          class="truncate w-full"
          href={preview ? undefined : `/${$query.post.space.slug}`}
        >
          <p class="body-15-b truncate w-full">
            {$query.post.space.name}
          </p>
        </svelte:element>
        <svelte:element
          this={element}
          class="w-full whitespace-pre-wrap"
          href={preview ? undefined : `/${$query.post.space.slug}`}
        >
          <p class="body-14-m text-secondary mt-2 break-all w-full">
            {$query.post.space.description ?? '아직 소개가 없어요'}
          </p>
        </svelte:element>
      </div>

      {#if !$query.post.space.meAsMember}
        {#if $query.post.space.followed}
          <!-- <Button class="rounded-12!" color="tertiary" size="md" variant="outlined">
                <i class="i-lc-bell square-5" />
                <span class="mx-2">알림받는중</span>
                <i class="i-lc-chevron-down square-5" />
              </Button> -->
          <Button
            color="tertiary"
            size="md"
            variant="outlined"
            on:click={async () => {
              await unfollowSpace({ spaceId: $query.post.space.id });
              mixpanel.track('space:unfollow', { spaceId: $query.post.space.id, via: 'post' });
              toast.success('관심 스페이스 해제되었어요');
            }}
          >
            관심 해제
          </Button>
        {:else}
          <Button
            size="md"
            on:click={async () => {
              if (!$query.me) {
                loginRequireOpen = true;
                return;
              }

              await followSpace({ spaceId: $query.post.space.id });
              mixpanel.track('space:follow', { spaceId: $query.post.space.id, via: 'post' });
              toast.success('관심 스페이스로 등록되었어요');
            }}
          >
            관심
          </Button>
        {/if}
      {/if}
    </div>

    <div class="space-y-3">
      {#if $query.post.collection}
        <p class="body-16-b">컬렉션명</p>

        <a
          class="p-2 flex gap-3 my-3 rounded-xl transition hover:bg-primary"
          href={`/${$query.post.space.slug}/collections/${$query.post.collection.id}`}
        >
          {#if $query.post.collection.thumbnail}
            <Image class="w-24 h-30 rounded-lg flex-none" $image={$query.post.collection.thumbnail} />
          {/if}

          <div class="truncate">
            <p class="body-16-b mb-1 truncate">{$query.post.collection.name}</p>
            <p class="body-14-m text-secondary truncate">{$query.post.collection.count}개의 포스트</p>
          </div>
        </a>
      {/if}

      {#if $query.post.previousPost || $query.post.nextPost}
        <div class="border border-secondary rounded-xl px-4 py-3">
          {#if $query.post.nextPost}
            <a
              class="body-16-b flex items-center gap-4 truncate rounded-xl p-2 transition hover:bg-primary"
              href={`/${$query.post.space.slug}/${$query.post.nextPost.permalink}`}
            >
              <span>다음글</span>
              <p class="truncate">{$query.post.nextPost.publishedRevision.title}</p>
            </a>
          {/if}
          {#if $query.post.previousPost}
            <a
              class="body-16-b flex items-center gap-4 truncate rounded-xl p-2 transition hover:bg-primary"
              href={`/${$query.post.space.slug}/${$query.post.previousPost.permalink}`}
            >
              <span>이전글</span>
              <p class="truncate">{$query.post.previousPost.publishedRevision.title}</p>
            </a>
          {/if}
        </div>
      {/if}
    </div>

    <!-- <div>
      <p class="title-20-b mb-4">추천글</p>

      <div class="grow gap-4 mb-4 sm:columns-2">
        <Feed class="mb-4 inline-block break-inside-avoid" $post />
      </div>
    </div> -->
  </div>
</article>

<LoginRequireModal bind:open={loginRequireOpen} />

{#if $postRevision.contentKind === 'ARTICLE' && !preview}
  <Toolbar {$query} {handleShare} />
{/if}

<ShareContent
  spaceIcon={$query.post.space.icon}
  spaceName={$query.post.space.name}
  title={$postRevision.title}
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
        await goto(`/${$query.post.space.slug}`);
        await deletePost({ postId: $query.post.id });
        mixpanel.track('post:delete', { postId: $query.post.id, via: 'post' });
        toast.success('포스트를 삭제했어요');
      }}
    >
      삭제
    </Button>
  </div>
</Modal>

<Modal size="sm" bind:open={adultOpen}>
  <svelte:fragment slot="title">성인 인증이 필요한 포스트예요</svelte:fragment>
  <svelte:fragment slot="subtitle">
    {!$query.me?.personalIdentity && '성인 인증을 하고 더 다양한 포스트를 감상해보세요!'}
  </svelte:fragment>

  <Button
    slot="action"
    class="w-full"
    size="xl"
    on:click={async () => {
      if (!$query.me) {
        adultOpen = false;
        loginRequireOpen = true;
        return;
      }

      if (!$query.me?.personalIdentity) {
        await goto('/me/settings');
        return;
      }

      if (!$query.me.isAdulthood) {
        history.back();
        return;
      }
    }}
  >
    {#if !$query.me?.personalIdentity}
      성인 인증하기
    {:else}
      뒤로 가기
    {/if}
  </Button>
</Modal>
