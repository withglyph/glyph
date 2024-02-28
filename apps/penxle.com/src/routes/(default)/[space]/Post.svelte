<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { getTextBetween } from '@tiptap/core';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import stringify from 'fast-json-stable-stringify';
  import { onMount } from 'svelte';
  import { afterNavigate, goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, Badge, Image, Tooltip } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { Button, Modal } from '$lib/components/v2';
  import { categoryFilter, pairFilter } from '$lib/const/feed';
  import { EmojiPicker } from '$lib/emoji';
  import Emoji from '$lib/emoji/Emoji.svelte';
  import { FormValidationError } from '$lib/errors';
  import { toast } from '$lib/notification';
  import { TiptapRenderer } from '$lib/tiptap/components';
  import { comma, humanizeNumber } from '$lib/utils';
  import LoginRequireModal from '../LoginRequireModal.svelte';
  import AlertText from './AlertText.svelte';
  import Comment from './Comment.svelte';
  import CommentInput from './CommentInput.svelte';
  import SelectionBubbleMenu from './SelectionBubbleMenu.svelte';
  import ShareContent from './ShareContent.svelte';
  import SharePostPopover from './SharePostPopover.svelte';
  import TagManageModal from './TagManageModal.svelte';
  import type { Editor } from '@tiptap/core';
  import type { Post_postRevision, Post_query } from '$glitch';

  let editor: Editor | undefined;
  let loginRequireOpen = false;
  let emojiOpen = false;
  let password = '';
  let openDeletePostWarning = false;
  let blurContent = true;
  let openShareContentModal = false;
  let openTagManageModal = false;

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

          ...TagManageModal_post

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
          category
          pairs
          commentCount
          paginationCount: commentCount(pagination: true)
          commentQualification

          ...CommentInput_post

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
            permalink
            publishedAt
            ageRating
            hasPassword

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
              ...Image_image
            }

            publishedRevision @_required {
              id
              title
              subtitle
              previewText
              price
            }

            space @_required {
              id
              slug
              name

              icon {
                id
                ...Image_image
              }
            }

            member @_required {
              id

              profile {
                id
                name
                ...Avatar_profile
              }
            }
          }

          collection {
            id
            name
            count

            thumbnail {
              id
              ...Image_image
            }

            posts {
              id
              permalink

              publishedRevision {
                id
                title
                subtitle
              }
            }
          }

          previousPost {
            id
            permalink

            publishedRevision @_required {
              id
              title
              subtitle
            }
          }

          nextPost {
            id
            permalink

            publishedRevision @_required {
              id
              title
              subtitle
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

          postComments: comments(orderBy: LATEST, page: 1, take: 1000) {
            id
            content
            createdAt
            pinned

            profile {
              id
              name
            }

            childComments {
              id
            }

            ...PostPage_Comment_postComment
          }
        }

        ...PostPage_Comment_query
        ...EmojiPicker_query
        ...CommentInput_query
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
        createdAt
        previewText
        paragraphIndent
        paragraphSpacing
      }
    `),
  );

  // $: comments = graphql(`
  //   query Post_Comments($permalink: String!, $orderBy: CommentOrderByKind!, $page: Int!, $take: Int!) @_manual {
  //     post(permalink: $permalink) {
  //       comments(orderBy: $orderBy, page: $page, take: $take) {
  //         id
  //         ...PostPage_Comment_postComment
  //       }
  //     }
  //   }
  // `);

  let page = 2;
  const take = 1000;

  // let _postComments: typeof $query.post.postComments = [];
  let initialize = false;
  // $: postComments = derived(comments, ($comments) => {
  //   return $comments?.post.comments ?? [];
  // });
  $: postComments = $query.post.postComments;

  $: if (!initialize) {
    // _postComments = $query.post.postComments;
    initialize = true;
  }

  const fetchComments = async () => {
    // const refetchedComments = await comments.refetch({
    //   permalink: $query.post.permalink,
    //   orderBy: 'LATEST',
    //   page,
    //   take,
    // });

    // _postComments = [..._postComments, ...refetchedComments.post.comments];
    page += 1;
  };

  $: if (blurContent) {
    blurContent = $query.post.blurred;
  }

  afterNavigate(() => {
    blurContent = $query.post.blurred;
  });

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

  let selectedText = '';
  $: triggerTags = $query.post.tags.filter(({ kind }) => kind === 'TRIGGER');

  const setSelectedText = () => {
    if (!editor) {
      return;
    }

    selectedText = getTextBetween(editor?.state.doc, editor.state.selection);
  };

  onMount(() => {
    // fetchComments();

    editor?.on('selectionUpdate', setSelectedText);

    return () => {
      editor?.off('selectionUpdate', setSelectedText);
    };
  });

  $: shortLink = `https://pnxl.me/${$query.post.shortlink}`;
</script>

<Helmet
  description={$postRevision.previewText}
  image={{
    src: $query.post.thumbnail?.url ?? 'https://pnxl.net/assets/opengraph/default-cover.png',
    size: 'large',
  }}
  title={$postRevision.title ?? '(제목 없음)'}
/>

<article class={clsx('w-full bg-white grow', _class)}>
  <div class="w-full max-w-1062px mx-auto px-80px flex flex-col pt-42px <sm:(pt-24px px-5)">
    {#if $query.post.collection}
      <a
        class="text-14-r text-gray-500 flex items-center gap-0.5 mb-4"
        href={`/${$query.post.space?.slug}/collections/${$query.post.collection.id}`}
      >
        {$query.post.collection.name}
        <i class="i-tb-chevron-right square-4 text-gray-500" />
      </a>
    {/if}
    <div class="flex justify-between items-start">
      <div>
        <h1 class="text-28-sb break-all <sm:text-22-sb">{$postRevision.title ?? '(제목 없음)'}</h1>
        {#if $postRevision.subtitle}
          <h2 class="text-16-r text-gray-700 break-all mt-3px">{$postRevision.subtitle}</h2>
        {/if}
      </div>

      <Menu placement="bottom-end">
        <i slot="value" class="i-tb-dots-vertical square-24px text-gray-500 block sm:hidden" />

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
              } else {
                if (!$query.me) {
                  loginRequireOpen = true;
                  return;
                }

                await muteSpace({ spaceId: $query.post.space.id });
                mixpanel.track('space:mute', { spaceId: $query.post.space.id, via: 'post' });
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

    <div class="border-y border-gray-100 flex justify-between py-3 mt-4 truncate">
      <div class="flex gap-18px">
        {#if $query.post.space && $query.post.member}
          <a class="relative flex-none h-fit square-36px" href={`/${$query.post.space.slug}`}>
            <Image class="square-36px rounded-5px border" $image={$query.post.space.icon} />
            <Avatar
              class="square-26px absolute border border-gray-200 -right-8px -bottom-6px"
              $profile={$query.post.member.profile}
            />
          </a>
        {:else}
          <div class="absolute square-36px">
            <div class="square-36px rounded-4px border" />
            <div class="square-24px absolute border border-white -right-4px -bottom-4px" />
          </div>
        {/if}

        <div class="flex flex-col gap-2px truncate">
          <a class="flex items-center flex-wrap gap-1 truncate" href={`/${$query.post.space?.slug}`}>
            <span class="text-15-m truncate">{$query.post.space?.name ?? '스페이스'}</span>
            <span class="text-12-m text-gray-500">by {$query.post.member?.profile.name ?? '작성자'}</span>
          </a>

          <div class="flex items-center text-11-r text-gray-500">
            <time>
              {dayjs($query.post.publishedAt ?? $postRevision.createdAt).formatAsDate()}
            </time>
            {#if $query.post.discloseStats}
              <div class="flex items-center before:(content-empty w-1px h-12px bg-gray-200 mx-2)">
                <div class="flex items-center gap-2px mr-2.5">
                  <i class="i-tb-eye square-14px text-gray-400" />
                  {humanizeNumber($query.post.viewCount)}
                </div>
                <div class="flex items-center gap-2px">
                  <i class="i-tb-mood-smile square-13px text-gray-400" />
                  {humanizeNumber($query.post.likeCount)}
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-12px <sm:hidden">
        <!-- <Button size="xs" variant="tertiary">집중모드</Button> -->

        <SharePostPopover href={shortLink}>
          <i class="i-tb-share-2 square-24px text-gray-500 transition hover:text-teal-400" />
        </SharePostPopover>

        <button
          class={clsx(
            'square-24px',
            $query.post.bookmarkGroups.length > 0
              ? 'i-tb-bookmark-filled bg-teal-500'
              : 'i-tb-bookmark text-gray-500 transition hover:text-teal-400',
          )}
          type="button"
          on:click={async () => {
            if ($query.post.bookmarkGroups.length > 0) {
              await unbookmarkPost({ bookmarkId: $query.post.bookmarkGroups[0].id, postId: $query.post.id });
              mixpanel.track('post:unbookmark', { postId: $query.post.id, via: 'post' });
            } else {
              if (!$query.me) {
                loginRequireOpen = true;
                return;
              }

              await bookmarkPost({ postId: $query.post.id });
              mixpanel.track('post:bookmark', { postId: $query.post.id, via: 'post' });
            }
          }}
        />

        <Menu placement="bottom-end">
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
                } else {
                  if (!$query.me) {
                    loginRequireOpen = true;
                    return;
                  }

                  await muteSpace({ spaceId: $query.post.space.id });
                  mixpanel.track('space:mute', { spaceId: $query.post.space.id, via: 'post' });
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
      <div>
        {#if blurContent}
          {#if $query.post.ageRating === 'ALL'}
            <AlertText
              description="해당 포스트에는 민감한 내용이 포함되어 있어요"
              icon="i-tb-alert-square-rounded"
              title="트리거 주의"
              {triggerTags}
            >
              <Button
                class="w-158px text-14-sb! mt-4"
                size="md"
                variant="outline"
                on:click={() => (blurContent = false)}
              >
                표시
              </Button>
            </AlertText>
          {:else if $query.post.ageRating === 'R15'}
            <AlertText
              description={$query.me
                ? $query.me.personalIdentity
                  ? ''
                  : '해당 내용을 감상하려면 본인 인증이 필요해요'
                : '해당 내용을 감상하려면 본인 인증이 필요해요 로그인 후 이용해주세요'}
              icon="i-px2-rating-15-plus"
              title="15세 콘텐츠"
              {triggerTags}
            >
              <Button
                class="w-158px text-14-sb! mt-4"
                size="sm"
                variant="outline"
                on:click={async () => {
                  if (!$query.me) {
                    await goto('/login');
                    return;
                  }

                  if (!$query.me.personalIdentity) {
                    await goto('/me/settings');
                    return;
                  }

                  blurContent = false;
                }}
              >
                {$query.me ? ($query.me.personalIdentity ? '표시' : '본인 인증') : '로그인 및 본인 인증'}
              </Button>
            </AlertText>
          {:else if $query.post.ageRating === 'R19'}
            <AlertText
              description={$query.me
                ? $query.me.personalIdentity
                  ? $query.me.isAdulthood
                    ? ''
                    : '해당 내용은 20세 이상만 열람할 수 있어요'
                  : '해당 내용을 감상하려면 본인 인증이 필요해요'
                : '해당 내용을 감상하려면 본인 인증이 필요해요. 로그인 후 이용해주세요'}
              icon="i-px2-rating-20-plus"
              title="성인용 콘텐츠"
              {triggerTags}
            >
              <Button
                class="w-158px text-14-sb! mt-4"
                size="sm"
                variant="outline"
                on:click={async () => {
                  if (!$query.me) {
                    await goto('/login');
                    return;
                  }

                  if (!$query.me.personalIdentity) {
                    await goto('/me/settings');
                    return;
                  }

                  if (!$query.me.isAdulthood) {
                    history.back();
                  }

                  blurContent = false;
                }}
              >
                {$query.me
                  ? $query.me.personalIdentity
                    ? $query.me.isAdulthood
                      ? '표시'
                      : '돌아가기'
                    : '본인 인증'
                  : '로그인 및 본인 인증'}
              </Button>
            </AlertText>
          {/if}
        {:else}
          {#key stringify($postRevision.content)}
            <TiptapRenderer
              class="pt-4 pb-6"
              content={$postRevision.content}
              options={{
                paragraphIndent: $postRevision.paragraphIndent,
                paragraphSpacing: $postRevision.paragraphSpacing,
                protectContent: $query.post.protectContent,
              }}
              bind:editor
            />
          {/key}

          <div class="flex justify-between my-12">
            <dl class="space-y-1">
              <div class="flex">
                <dt class="text-13-m text-gray-500 mr-1">카테고리</dt>
                <dd class="text-13-r text-gray-400 underline">
                  #{categoryFilter[$query.post.category]}
                </dd>
              </div>

              {#if $query.post.pairs.length > 0}
                <div class="flex gap-2px flex-wrap">
                  <dt class="text-13-m text-gray-500 mr-2px">페어</dt>
                  {#each $query.post.pairs as pair (pair)}
                    <dd class="text-13-r text-gray-400 underline">#{pairFilter[pair]}</dd>
                  {/each}
                </div>
              {/if}

              <div class="flex gap-2px flex-wrap">
                {#if $query.post.tags.some(({ kind }) => kind === 'TITLE')}
                  <dt class="text-13-m text-gray-500 mr-2px">작품</dt>
                  {#each $query.post.tags as { tag, kind } (tag.id)}
                    {#if kind === 'TITLE'}
                      <dd class="text-13-r text-gray-400 underline">
                        <a href={`/tag/${tag.name}`}>#{tag.name}</a>
                      </dd>
                    {/if}
                  {/each}
                {/if}

                {#if $query.post.tags.some(({ kind }) => kind === 'CHARACTER')}
                  <dt
                    class="text-13-m text-gray-500 mr-2px flex before:(content-empty w-1px h-10px mx-2 my-auto bg-gray-200) first-of-type:before:hidden"
                  >
                    캐릭터
                  </dt>
                  {#each $query.post.tags as { tag, kind } (tag.id)}
                    {#if kind === 'CHARACTER'}
                      <dd class="text-13-r text-gray-400 underline">
                        <a href={`/tag/${tag.name}`}>#{tag.name}</a>
                      </dd>
                    {/if}
                  {/each}
                {/if}

                {#if $query.post.tags.some(({ kind }) => kind === 'COUPLING')}
                  <dt
                    class="text-13-m text-gray-500 mr-2px flex before:(content-empty w-1px h-10px mx-2 my-auto bg-gray-200) first-of-type:before:hidden"
                  >
                    커플링
                  </dt>
                  {#each $query.post.tags as { tag, kind } (tag.id)}
                    {#if kind === 'COUPLING'}
                      <dd class="text-13-r text-gray-400 underline">
                        <a href={`/tag/${tag.name}`}>#{tag.name}</a>
                      </dd>
                    {/if}
                  {/each}
                {/if}

                {#if $query.post.tags.some(({ kind }) => kind === 'TRIGGER')}
                  <dt
                    class="text-13-m text-gray-500 mr-2px flex before:(content-empty w-1px h-10px mx-2 my-auto bg-gray-200) first-of-type:before:hidden"
                  >
                    트리거
                  </dt>
                  {#each $query.post.tags as { tag, kind } (tag.id)}
                    {#if kind === 'TRIGGER'}
                      <dd class="text-13-r text-gray-400 underline">
                        <a href={`/tag/${tag.name}`}>#{tag.name}</a>
                      </dd>
                    {/if}
                  {/each}
                {/if}

                {#if $query.post.tags.some(({ kind }) => kind === 'EXTRA')}
                  <dt
                    class="text-13-m text-gray-500 mr-2px flex before:(content-empty w-1px h-10px mx-2 my-auto bg-gray-200) first-of-type:before:hidden"
                  >
                    추가태그
                  </dt>
                  {#each $query.post.tags as { tag, kind } (tag.id)}
                    {#if kind === 'EXTRA'}
                      <dd class="text-13-r text-gray-400 underline">
                        <a href={`/tag/${tag.name}`}>#{tag.name}</a>
                      </dd>
                    {/if}
                  {/each}
                {/if}
              </div>
            </dl>
            {#if $query.post.space?.meAsMember}
              <Button class="self-end" size="2xs" variant="outline" on:click={() => (openTagManageModal = true)}>
                태그수정
              </Button>
            {/if}
          </div>
        {/if}
      </div>
    {:else}
      <AlertText description="해당 내용은 비밀번호 입력이 필요해요" icon="i-tb-lock-square-rounded" title="비밀글">
        <form
          class="mt-5 flex gap-7px"
          on:submit|preventDefault={async () => {
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
          <input
            class="text-14-r border border-gray-200 bg-gray-50 py-1.5 px-2.5 rounded w-274px"
            placeholder="비밀번호를 입력해주세요"
            type="password"
            bind:value={password}
          />
          <Button class="text-14-sb!" size="sm" type="submit">입력</Button>
        </form>
      </AlertText>
    {/if}

    <div
      class="sticky flex items-center justify-between -mx-5 bottom-0 grow px-5 py-3.5 bg-white border-t border-gray-200 z-1 sm:hidden"
    >
      <div class="flex items-center">
        {#if $query.post.commentQualification === 'NONE'}
          <Tooltip
            class="flex center square-6 mr-5"
            message="해당 게시물은 댓글이 허용되어 있지 않아요"
            offset={10}
            placement="top"
          >
            <i class="i-tb-message-circle-off square-5 text-gray-400" />
          </Tooltip>
        {:else}
          <a class="flex center mr-5 square-6" href="#comment">
            <i class="i-tb-message-circle square-5 block" />
          </a>
        {/if}

        <Tooltip
          enabled={!$query.post.receiveFeedback}
          message="피드백 받기를 설정하지 않은 포스트예요"
          offset={10}
          placement="top"
        >
          <EmojiPicker {$query} disabled={!$query.post.receiveFeedback} variant="toolbar" />
        </Tooltip>
      </div>

      <div class="flex items-center gap-5">
        <button
          class={clsx(
            'square-20px',
            $query.post.bookmarkGroups.length > 0
              ? 'i-tb-bookmark-filled bg-teal-500'
              : 'i-tb-bookmark text-gray-700 transition hover:text-teal-400',
          )}
          type="button"
          on:click={async () => {
            if ($query.post.bookmarkGroups.length > 0) {
              await unbookmarkPost({ bookmarkId: $query.post.bookmarkGroups[0].id, postId: $query.post.id });
              mixpanel.track('post:unbookmark', { postId: $query.post.id, via: 'post' });
            } else {
              if (!$query.me) {
                loginRequireOpen = true;
                return;
              }

              await bookmarkPost({ postId: $query.post.id });
              mixpanel.track('post:bookmark', { postId: $query.post.id, via: 'post' });
            }
          }}
        />
        <SharePostPopover href={shortLink}>
          <i class="i-tb-share-2 square-5 text-gray-700 transition hover:text-teal-400" />
        </SharePostPopover>
      </div>
    </div>

    <div class="flex justify-between border-t border-gray-200 py-4.5 <sm:hidden">
      <div class="flex items-center gap-2.5 flex-wrap">
        <Tooltip
          enabled={!$query.post.receiveFeedback}
          message="피드백 받기를 설정하지 않은 포스트예요"
          placement="top"
        >
          <EmojiPicker {$query} disabled={!$query.post.receiveFeedback} />
        </Tooltip>

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
      <SharePostPopover href={shortLink}>
        <i class="i-tb-share-2 square-5 text-gray-500 transition hover:text-teal-400" />
      </SharePostPopover>
    </div>

    {#if $query.post.collection}
      {@const positionInCollection = $query.post.collection.posts.findIndex((post) => post.id === $query.post.id)}
      <div class="bg-gray-50 rounded-2.5 p-5">
        <a class="flex gap-3" href={`/${$query.post.space?.slug}/collections/${$query.post.collection.id}`}>
          {#if $query.post.collection.thumbnail}
            <Image class="w-60px h-84px rounded flex-none" $image={$query.post.collection.thumbnail} />
          {/if}

          <div class="truncate">
            <p class="text-11-r text-gray-500">컬렉션</p>
            <p class="text-18-sb mb-2 truncate">{$query.post.collection.name}</p>
            <p class="text-13-r text-gray-500 truncate">
              총 {$query.post.collection.count}개의 포스트
            </p>
          </div>
        </a>

        {#if positionInCollection > -1}
          <div class="bg-white mt-4">
            {#if positionInCollection > 0}
              {@const previousPost = $query.post.collection.posts[positionInCollection - 1]}
              <a
                class="flex items-center gap-8 truncate p-4 transition h-86px hover:bg-gray-100"
                href={`/${$query.post.space?.slug}/${previousPost.permalink}`}
              >
                <span class="text-13-m text-gray-500">이전글</span>

                <div class="truncate">
                  <p class="truncate text-16-sb">
                    {previousPost.publishedRevision?.title ?? '(제목 없음)'}
                  </p>
                  {#if previousPost.publishedRevision?.subtitle}
                    <p class="truncate text-13-r text-gray-500">{previousPost.publishedRevision.subtitle}</p>
                  {/if}
                </div>
              </a>
            {/if}
            {#if positionInCollection < $query.post.collection.posts.length - 1}
              {@const nextPost = $query.post.collection.posts[positionInCollection + 1]}
              <a
                class="flex items-center gap-8 truncate p-5 transition h-86px hover:bg-gray-100 border-t border-gray-100"
                href={`/${$query.post.space?.slug}/${nextPost.permalink}`}
              >
                <span class="text-13-m text-gray-500">다음글</span>

                <div class="truncate">
                  <p class="truncate text-16-sb">
                    {nextPost.publishedRevision?.title ?? '(제목 없음)'}
                  </p>
                  {#if nextPost.publishedRevision?.subtitle}
                    <p class="truncate text-13-r text-gray-500">{nextPost.publishedRevision.subtitle}</p>
                  {/if}
                </div>
              </a>
            {/if}
          </div>
        {/if}
      </div>
    {:else}
      {#if $query.post.previousPost}
        <a
          class="flex items-center gap-8 truncate p-5 transition mt-12px h-82px hover:bg-gray-100"
          href={`/${$query.post.space?.slug}/${$query.post.previousPost.permalink}`}
        >
          <span class="text-13-m text-gray-500">이전글</span>

          <div class="truncate">
            <p class="truncate text-16-sb">
              {$query.post.previousPost.publishedRevision.title ?? '(제목 없음)'}
            </p>
            {#if $query.post.previousPost.publishedRevision.subtitle}
              <p class="truncate text-13-r text-gray-500">{$query.post.previousPost.publishedRevision.subtitle}</p>
            {/if}
          </div>
        </a>
      {/if}
      {#if $query.post.nextPost}
        <a
          class="flex items-center gap-8 truncate p-5 transition h-82px hover:bg-gray-100 border-t border-gray-100"
          href={`/${$query.post.space?.slug}/${$query.post.nextPost.permalink}`}
        >
          <span class="text-13-m text-gray-500">다음글</span>

          <div class="truncate">
            <p class="truncate text-16-sb">
              {$query.post.nextPost.publishedRevision.title ?? '(제목 없음)'}
            </p>
            {#if $query.post.nextPost.publishedRevision.subtitle}
              <p class="truncate text-13-r text-gray-500">{$query.post.nextPost.publishedRevision.subtitle}</p>
            {/if}
          </div>
        </a>
      {/if}
    {/if}

    <aside class="bg-gray-50 rounded-2.5 flex sm:(items-center justify-between) <sm:(flex-col center) p-5 gap-3 my-4">
      <div class="flex gap-3 <sm:(flex-col center)">
        <a class="flex-none" href={`/${$query.post.space?.slug}`}>
          {#if $query.post.space}
            <Image class="square-16 rounded border border-gray-200" $image={$query.post.space.icon} />
          {:else}
            <div class="square-16 rounded border border-gray-200" />
          {/if}
        </a>

        <article class="grow truncate">
          <a class="truncate w-full" href={`/${$query.post.space?.slug}`}>
            <p class="text-18-sb truncate w-full <sm:text-center">
              {#if $query.post.space}
                {$query.post.space.name}
              {:else}
                스페이스 이름
              {/if}
            </p>
          </a>
          <a class="w-full whitespace-pre-wrap" href={`/${$query.post.space?.slug}`}>
            <p class="text-13-r text-gray-500 mt-1 break-all w-full <sm:text-center">
              {$query.post.space?.description ?? '아직 소개가 없어요'}
            </p>
          </a>
        </article>
      </div>

      {#if !$query.post.space?.meAsMember}
        {#if $query.post.space?.followed}
          <Button
            class="shrink-0 flex items-center gap-1"
            size="sm"
            variant="outline"
            on:click={async () => {
              if (!$query.post.space) return;

              await unfollowSpace({ spaceId: $query.post.space.id });
              mixpanel.track('space:unfollow', { spaceId: $query.post.space.id, via: 'post' });
            }}
          >
            <i class="i-tb-check square-3.5 block text-gray-400" />
            관심 스페이스
          </Button>
        {:else}
          <Button
            class="shrink-0 flex items-center gap-1"
            size="sm"
            on:click={async () => {
              if (!$query.post.space) return;

              if (!$query.me) {
                loginRequireOpen = true;
                return;
              }

              await followSpace({ spaceId: $query.post.space.id });
              mixpanel.track('space:follow', { spaceId: $query.post.space.id, via: 'post' });
            }}
          >
            <i class="i-tb-plus square-3.5 block" />
            관심 스페이스
          </Button>
        {/if}
      {/if}
    </aside>

    {#if $query.post.space}
      <div class="mt-40px">
        {#if $query.post.commentQualification !== 'NONE'}
          <p id="comment" class="text-18-sb text-gray-700 mb-2.5 scroll-my-61px">
            댓글 {comma($query.post.commentCount)}
          </p>
          <CommentInput $post={$query.post} {$query} />

          <ul class="mt-6">
            {#each postComments as comment (comment.id)}
              <Comment $postComment={comment} {$query} />
            {/each}
            {#if take * (page - 1) < $query.post.paginationCount}
              <li class="text-center">
                <button
                  type="button"
                  on:click={async () => {
                    fetchComments();
                  }}
                >
                  더보기
                </button>
              </li>
            {/if}
          </ul>
        {:else}
          <p class="py-6 px-5 text-15-r text-gray-400 border-t border-gray-200">
            해당 게시물은 댓글이 허용되어 있지 않아요
          </p>
        {/if}
      </div>
    {/if}

    {#if $query.post.recommendedPosts.length > 0}
      <div class="mt-10.5">
        <p class="text-18-sb mb-2 sm:(text-20-sb mb-4 mx-5)">추천 포스트</p>

        <ul class="grow">
          {#each $query.post.recommendedPosts as post, index (post.id)}
            {#if index !== 0}
              <hr class="bg-gray-100 sm:my-4" />
            {/if}
            <li class="rounded-2.5 sm:hover:bg-gray-50">
              <a class="flex flex-col py-6 sm:p-5" href={`/${post.space.slug}/${post.permalink}`}>
                <div class="flex">
                  <div class="w-96px mr-3.5 sm:(w-124px mr-5)">
                    {#if post.thumbnail}
                      <Image class="square-124px rounded-1.5 flex-none <sm:square-96px" $image={post.thumbnail} />
                    {:else}
                      <div class="square-124px rounded-1.5 flex-none <sm:square-96px">
                        <svg class="rounded-1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <rect fill="#0c0a091a" height="24" width="24" />
                          <path
                            d="M7.36 3.86c2.3 5.04.42 10.01-.1 11.36-.08.23-.13.36-.11.36a15.7 15.7 0 0 1 9.45 4.6l-1.58-2.74L13 14.07a1.1 1.1 0 1 1 .53-.35l3.53 6.11c-1.4-4.68.63-10.12.63-10.12-6.15-.67-10.33-5.85-10.33-5.85Z"
                            fill="#FAFAF9"
                          />
                        </svg>
                      </div>
                    {/if}

                    <div class="flex items-center truncate mt-1">
                      <div class="relative mr-2 flex-none <sm:hidden">
                        <Image class="square-5.5 border border-gray-100 rounded" $image={post.space.icon} />

                        <Avatar
                          class="square-18px absolute border border-gray-100 -right-6px -bottom-6px"
                          $profile={post.member.profile}
                        />
                      </div>
                      <div class="truncate">
                        <p class="text-12-m text-gray-700 truncate">{post.space.name}</p>
                        <p class="text-11-r truncate text-gray-400">by {post.member.profile.name}</p>
                      </div>
                    </div>
                  </div>

                  <div class="grow flex flex-col justify-between truncate">
                    <div class="truncate">
                      <div class="flex items-center gap-2.5 truncate">
                        {#if post.publishedRevision?.price}
                          <Badge class="w-fit" color="purple">유료</Badge>
                        {/if}
                        {#if post.ageRating === 'R19'}
                          <Badge class="w-fit" color="red">성인</Badge>
                        {/if}
                        {#if post.ageRating === 'R15'}
                          <Badge class="w-fit" color="red">15세</Badge>
                        {/if}
                        {#if post.tags.some(({ kind }) => kind === 'TRIGGER')}
                          <Badge class="w-fit" color="orange">트리거주의</Badge>
                        {/if}
                        {#if post.hasPassword}
                          <Badge class="w-fit" color="gray">비밀글</Badge>
                        {/if}

                        <p class="text-16-sb text-gray-700 truncate sm:text-18-sb">
                          {post.publishedRevision.title ?? '(제목 없음)'}
                        </p>
                      </div>

                      {#if post.publishedRevision.subtitle}
                        <p class="text-12- text-gray-700 truncate mt-1px sm:(mt-2px text-15-m)">
                          {post.publishedRevision.subtitle}
                        </p>
                      {/if}

                      <p
                        class="line-clamp-3 break-all whitespace-pre-wrap text-12-r mt-7px text-gray-500 sm:(text-14-r mt-3)"
                      >
                        {post.publishedRevision.previewText}
                      </p>
                    </div>

                    <ul class="flex flex-wrap items-center gap-1.5">
                      {#each post.tags as { tag, kind } (tag.id)}
                        <li class={clsx('text-12-r text-gray-400 underline p-0.5', kind === 'TITLE' && 'bg-gray-100')}>
                          #{tag.name}
                        </li>
                      {/each}
                    </ul>
                  </div>
                </div>

                <time class="text-11-r text-gray-400 text-right mt-2">{dayjs(post.publishedAt).formatAsDate()}</time>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</article>

{#if editor}
  <SelectionBubbleMenu {editor}>
    <button type="button" on:click={() => (openShareContentModal = true)}>공유</button>
  </SelectionBubbleMenu>
{/if}

{#if openShareContentModal}
  <ShareContent
    body={selectedText}
    spaceName={$query.post.space?.name ?? ''}
    title={$postRevision.title ?? '(제목 없음)'}
    bind:open={openShareContentModal}
  />
{/if}

<LoginRequireModal bind:open={loginRequireOpen} />

<Modal
  actionClass="border-none gap-1.5 pt-6 pb-6 sm:p-7"
  size="sm"
  titleClass="text-18-sb"
  bind:open={openDeletePostWarning}
>
  <svelte:fragment slot="title">포스트를 삭제하시겠어요?</svelte:fragment>

  <p class="mt-1 text-14-r text-gray-700 px-6 sm:px-7">삭제된 글은 복구할 수 없어요</p>

  <svelte:fragment slot="action">
    <Button class="w-full" size="lg" variant="outline" on:click={() => (openDeletePostWarning = false)}>취소</Button>
    <Button
      class="w-full"
      size="lg"
      on:click={async () => {
        await goto(`/${$query.post.space?.slug}`);
        await deletePost({ postId: $query.post.id });
        mixpanel.track('post:delete', { postId: $query.post.id, via: 'post' });
        toast.success('포스트를 삭제했어요');
      }}
    >
      삭제
    </Button>
  </svelte:fragment>
</Modal>

<TagManageModal $post={$query.post} bind:open={openTagManageModal} />
