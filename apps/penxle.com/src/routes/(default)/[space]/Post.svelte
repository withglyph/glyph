<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import stringify from 'fast-json-stable-stringify';
  import { afterNavigate, goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, Button, Image, SpacePostCard, Tag, Tooltip } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import Modal from '$lib/components/Modal.svelte';
  import { EmojiPicker } from '$lib/emoji';
  import Emoji from '$lib/emoji/Emoji.svelte';
  import { FormValidationError } from '$lib/errors';
  import { toast } from '$lib/notification';
  import { TiptapRenderer } from '$lib/tiptap/components';
  import { calcurateReadingTime, humanizeNumber } from '$lib/utils';
  import LoginRequireModal from '../LoginRequireModal.svelte';
  import Toolbar from './Toolbar.svelte';
  import type { Editor } from '@tiptap/core';
  import type { Post_postRevision, Post_query } from '$glitch';

  let editor: Editor | undefined;
  let loginRequireOpen = false;
  let emojiOpen = false;
  let password = '';
  let openDeletePostWarning = false;
  let blurContent = true;
  let element: 'a' | 'div';
  let requirePersonalIdentityOpen = false;

  let _class: string | undefined = undefined;
  export { _class as class };

  let _query: Post_query;
  export { _query as $query };

  let _postRevision: Post_postRevision;
  export { _postRevision as $postRevision };

  export let preview = false;

  $: query = fragment(
    _query,
    graphql(`
      fragment Post_query on Query {
        me {
          id
          isAdulthood
          allowedAgeRating

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
          blurred
          hasPassword
          receiveFeedback
          discloseStats
          protectContent
          publishedAt
          ageRating

          tags {
            id
            kind

            tag {
              id
              name
            }
          }

          thumbnail {
            id
            url
          }

          recommendedPosts {
            id
            ...SpaceFeed_post
          }

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
      }
    `),
  );

  $: postRevision = fragment(
    _postRevision,
    graphql(`
      fragment Post_postRevision on PostRevision {
        id
        title
        subtitle
        content
        characterCount
        createdAt
        previewText
        paragraphIndent
        paragraphSpacing
      }
    `),
  );

  $: if (blurContent) {
    blurContent = $query.post.blurred;
  }

  afterNavigate(() => {
    blurContent = $query.post.blurred;
  });

  $: if ($query.post.ageRating !== 'ALL') {
    loginRequireOpen = !$query.me;

    if ($query.me) {
      requirePersonalIdentityOpen =
        !$query.me.personalIdentity || !$query.me.allowedAgeRating.includes($query.post.ageRating);
    }
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
    navigator.clipboard.writeText(shortLink);
    toast.success('링크가 복사되었어요');
  };

  $: triggerTags = $query.post.tags.filter(({ kind }) => kind === 'TRIGGER');
</script>

<Helmet
  description={$postRevision.previewText}
  image={{
    src: $query.post.thumbnail?.url ?? 'https://pnxl.net/assets/opengraph/default-cover.png',
    size: 'large',
  }}
  title={$postRevision.title ?? '(제목 없음)'}
/>

<article class={clsx('w-full grow @dark:bg-gray-900', _class)}>
  <div class="w-full max-w-960px mx-auto flex flex-col pt-60px">
    <div>
      <h1 class="text-28-sb break-all">{$postRevision.title ?? '(제목 없음)'}</h1>
      {#if $postRevision.subtitle}
        <h2 class="text-16-r text-gray-700 break-all">{$postRevision.subtitle}</h2>
      {/if}
    </div>

    <div class="border-y border-gray-100 flex gap-12px p-12px">
      {#if $query.post.space && $query.post.member}
        <a class="relative" href={`/${$query.post.space.slug}`}>
          <Image class="square-36px rounded-4px border" $image={$query.post.space.icon} />
          <Avatar
            class="square-24px absolute border border-white -right-4px -bottom-4px"
            $profile={$query.post.member.profile}
          />
        </a>
      {:else}
        <div class="absolute">
          <div class="square-36px rounded-4px border" />
          <div class="square-24px absolute border border-white -right-4px -bottom-4px" />
        </div>
      {/if}

      <div class="flex flex-col gap-2px">
        <div class="text-14-m text-gray-700">
          {$query.post.space?.name ?? '스페이스'} · {$query.post.member?.profile.name ?? '작성자'}
        </div>

        <div class="flex gap-8px">
          <span class="text-gray-500">{dayjs($query.post.publishedAt).formatAsDate()}</span>
          <div class="w-1px h-12px bg-gray-200" />
          <div class="flex gap-8px">
            <div class="flex items-center gap-2px">
              <i class="i-tb-eye square-14px" />
              {humanizeNumber($query.post.viewCount)}
            </div>
            <div class="flex items-center gap-2px">
              <i class="i-tb-heart square-14px" />
              {humanizeNumber($query.post.likeCount)}
            </div>
            <div class="flex items-center gap-2px">
              <i class="i-tb-clock-hour-4 square-14px" />
              {calcurateReadingTime($postRevision.characterCount)}분
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-12px">
        <button class="px-10px py-2px text-14-r text-gray-400" type="button">URL 복사</button>

        <button
          class={clsx(
            'square-24px',
            $query.post.bookmarkGroups.length > 0 ? 'i-tb-bookmark-filled bg-yellow-50' : 'i-tb-bookmark text-gray-500',
          )}
          type="button"
          on:click={async () => {
            if ($query.post.bookmarkGroups.length > 0) {
              await unbookmarkPost({ bookmarkId: $query.post.bookmarkGroups[0].id, postId: $query.post.id });
              mixpanel.track('post:unbookmark', { postId: $query.post.id, via: 'post' });
              toast.success('북마크에서 삭제했어요');
            } else {
              if (!$query.me) {
                loginRequireOpen = true;
                return;
              }

              await bookmarkPost({ postId: $query.post.id });
              mixpanel.track('post:bookmark', { postId: $query.post.id, via: 'post' });
              toast.success('북마크에 저장되었어요');
            }
          }}
        />

        <Menu>
          <i slot="value" class="i-tb-dots-vertical square-24px text-gray-500" />
          {#if $query.post.space?.meAsMember}
            <MenuItem href={`/editor/${$query.post.permalink}`} type="link">수정하기</MenuItem>
            <MenuItem
              on:click={() => {
                openDeletePostWarning = true;
              }}
            >
              삭제하기
            </MenuItem>
          {:else}
            <MenuItem
              on:click={async () => {
                if (!$query.post.space) return;

                if ($query.post.space.muted) {
                  await unmuteSpace({ spaceId: $query.post.space.id });
                  mixpanel.track('space:unmute', { spaceId: $query.post.space.id, via: 'post' });
                  toast.success('스페이스 숨기기를 해제했어요');
                } else {
                  if (!$query.me) {
                    loginRequireOpen = true;
                    return;
                  }

                  await muteSpace({ spaceId: $query.post.space.id });
                  mixpanel.track('space:mute', { spaceId: $query.post.space.id, via: 'post' });
                  toast.success('스페이스를 숨겼어요');
                }
              }}
            >
              {#if $query.post.space?.muted}
                스페이스 숨기기 해제
              {:else}
                스페이스 숨기기
              {/if}
            </MenuItem>
          {/if}
        </Menu>
      </div>
    </div>

    {#if !$query.post.hasPassword || $query.post.space?.meAsMember || $query.post.unlocked}
      <div class="relative">
        {#if $query.me?.personalIdentity || !$query.me?.isAdulthood}
          {#if blurContent}
            <header class="py-6 px-3 rounded-3 w-full flex flex-col gap-0.625rem items-center bg-primary" role="alert">
              <div class="flex flex-col gap-2 items-center">
                <i class="i-px-alert-triangle square-6 color-text-secondary" />
                <h2 class="body-16-eb text-center break-keep">포스트에 민감한 내용이 포함되어 있어요</h2>
              </div>
              <ul class="flex gap-0.625rem flex-wrap justify-center max-w-26rem">
                {#if $query.post.ageRating === 'R19'}
                  <Tag as="div" size="sm">😳 성인물</Tag>
                {:else if $query.post.ageRating === 'R15'}
                  <Tag as="div" size="sm">15세</Tag>
                {/if}
                {#each triggerTags as triggerTag (triggerTag.id)}
                  <Tag as="div" size="sm">{triggerTag.tag.name.replaceAll('_', ' ')}</Tag>
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
            {#key stringify($postRevision.content)}
              <TiptapRenderer
                class=""
                content={$postRevision.content}
                options={{
                  paragraphIndent: $postRevision.paragraphIndent,
                  paragraphSpacing: $postRevision.paragraphSpacing,
                  protectContent: $query.post.protectContent,
                }}
                bind:editor
              />
            {/key}
          {/if}
        {/if}

        <!-- {#if editor && !preview}
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
        {/if} -->
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
      {#each $query.post.tags as { tag } (tag.id)}
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
      <svelte:element this={element} href={preview || !$query.post.space ? undefined : `/${$query.post.space.slug}`}>
        {#if $query.post.space}
          <Image class="square-16 rounded-2xl border border-secondary" $image={$query.post.space.icon} />
        {:else}
          <div class="square-16 rounded-2xl border border-secondary" />
        {/if}
      </svelte:element>

      <div class="grow truncate">
        <svelte:element
          this={element}
          class="truncate w-full"
          href={preview || !$query.post.space ? undefined : `/${$query.post.space.slug}`}
        >
          <p class="body-15-b truncate w-full">
            {#if $query.post.space}
              {$query.post.space.name}
            {:else}
              스페이스 이름
            {/if}
          </p>
        </svelte:element>
        <svelte:element
          this={element}
          class="w-full whitespace-pre-wrap"
          href={preview || !$query.post.space ? undefined : `/${$query.post.space.slug}`}
        >
          <p class="body-14-m text-secondary mt-2 break-all w-full">
            {$query.post.space?.description ?? '아직 소개가 없어요'}
          </p>
        </svelte:element>
      </div>

      {#if !$query.post.space?.meAsMember}
        {#if $query.post.space?.followed}
          <!-- <Button class="rounded-12!" color="tertiary" size="md" variant="outlined">
                <i class="i-lc-bell square-5" />
                <span class="mx-2">알림받는중</span>
                <i class="i-lc-chevron-down square-5" />
              </Button> -->
          <Button
            class="shrink-0"
            color="tertiary"
            size="md"
            variant="outlined"
            on:click={async () => {
              if (!$query.post.space) return;

              await unfollowSpace({ spaceId: $query.post.space.id });
              mixpanel.track('space:unfollow', { spaceId: $query.post.space.id, via: 'post' });
              toast.success('관심 스페이스 해제되었어요');
            }}
          >
            관심 해제
          </Button>
        {:else}
          <Button
            class="shrink-0"
            size="md"
            on:click={async () => {
              if (!$query.post.space) return;

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
          href={`/${$query.post.space?.slug}/collections/${$query.post.collection.id}`}
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
              href={`/${$query.post.space?.slug}/${$query.post.nextPost.permalink}`}
            >
              <span>다음글</span>
              <p class="truncate">{$query.post.nextPost.publishedRevision.title ?? '(제목 없음)'}</p>
            </a>
          {/if}
          {#if $query.post.previousPost}
            <a
              class="body-16-b flex items-center gap-4 truncate rounded-xl p-2 transition hover:bg-primary"
              href={`/${$query.post.space?.slug}/${$query.post.previousPost.permalink}`}
            >
              <span>이전글</span>
              <p class="truncate">{$query.post.previousPost.publishedRevision.title ?? '(제목 없음)'}</p>
            </a>
          {/if}
        </div>
      {/if}
    </div>

    {#if $query.post.recommendedPosts.length > 0}
      <div>
        <p class="title-20-b mb-4">추천글</p>

        <div class="grow gap-4 sm:columns-2 <sm:(bg-surface-primary -mx-4)">
          {#each $query.post.recommendedPosts as post (post.id)}
            <SpacePostCard class="mb-2 inline-block break-inside-avoid sm:mb-4" $post={post} />
          {/each}
        </div>
      </div>
    {/if}
  </div>
</article>

<LoginRequireModal bind:open={loginRequireOpen}>
  <svelte:fragment slot="subtitle">
    {$query.post.ageRating === 'R15' ? '15세' : '성인'} 포스트 열람을 위해 로그인이 필요해요
  </svelte:fragment>
  <svelte:fragment slot="action-secondary">
    <Button class="w-full" color="secondary" size="xl" on:click={() => history.back()}>뒤로 가기</Button>
  </svelte:fragment>
</LoginRequireModal>

{#if !preview}
  <Toolbar {$query} {handleShare} />
{/if}

<Modal size="sm" bind:open={openDeletePostWarning}>
  <svelte:fragment slot="title">정말 포스트를 삭제하시겠어요?</svelte:fragment>

  <div slot="action" class="flex gap-2 w-full [&>button]:grow">
    <Button color="secondary" size="md" on:click={() => (openDeletePostWarning = false)}>취소</Button>
    <Button
      size="md"
      on:click={async () => {
        await goto(`/${$query.post.space?.slug}`);
        await deletePost({ postId: $query.post.id });
        mixpanel.track('post:delete', { postId: $query.post.id, via: 'post' });
        toast.success('포스트를 삭제했어요');
      }}
    >
      삭제
    </Button>
  </div>
</Modal>

<Modal size="sm" bind:open={requirePersonalIdentityOpen}>
  <svelte:fragment slot="title">
    {$query.post.ageRating === 'R15' ? '본인' : '성인'} 인증이 필요한 포스트예요
  </svelte:fragment>

  <div slot="action" class="flex gap-3 w-full">
    {#if !$query.me?.personalIdentity}
      <Button
        class="w-full"
        color="secondary"
        size="xl"
        on:click={() => {
          history.back();
        }}
      >
        뒤로 가기
      </Button>
    {/if}

    <Button
      class="w-full"
      size="xl"
      on:click={async () => {
        if (!$query.me?.personalIdentity) {
          await goto('/me/settings');
          return;
        }

        if (!$query.me.allowedAgeRating.includes($query.post.ageRating)) {
          history.back();
          return;
        }
      }}
    >
      {#if !$query.me?.personalIdentity}
        본인 인증하기
      {:else}
        뒤로 가기
      {/if}
    </Button>
  </div>
</Modal>
