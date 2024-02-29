<script lang="ts">
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import IconReplyBar from '~icons/effit/reply-bar';
  import IconCaretDownFilled from '~icons/tabler/caret-down-filled';
  import IconCaretUpFilled from '~icons/tabler/caret-up-filled';
  import IconDotsVertical from '~icons/tabler/dots-vertical';
  import IconHeart from '~icons/tabler/heart';
  import IconHeartFilled from '~icons/tabler/heart-filled';
  import IconLock from '~icons/tabler/lock';
  import IconPinnedFilled from '~icons/tabler/pinned-filled';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, Icon } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { Button, Modal } from '$lib/components/v2';
  import CommentInput from './CommentInput.svelte';
  import type { PostPage_Comment_postComment, PostPage_Comment_query } from '$glitch';

  export let editing = false;
  let repliesOpen = false;
  let replyInputOpen = false;
  let blockMasqueradeOpen = false;
  export let parentId: string | undefined = undefined;

  let _postComment: PostPage_Comment_postComment;
  let _query: PostPage_Comment_query;
  export { _postComment as $postComment, _query as $query };

  $: query = fragment(
    _query,
    graphql(`
      fragment PostPage_Comment_query on Query {
        me {
          id
        }

        post(permalink: $permalink) {
          id

          member {
            id

            profile {
              id
              name
              ...Avatar_profile
            }
          }

          space @_required {
            id
            slug

            meAsMember {
              id
            }

            myMasquerade {
              id
            }

            commentProfile {
              id
            }
          }

          comments {
            id
            content
            pinned
            createdAt

            profile {
              id
              name
            }

            masquerade {
              id
            }

            childComments {
              id
            }
          }

          ...CommentInput_post
        }

        ...CommentInput_query
      }
    `),
  );

  $: postComment = fragment(
    _postComment,
    graphql(`
      fragment PostPage_Comment_postComment on PostComment {
        id
        content
        pinned
        visibility
        createdAt
        state
        isPurchasedUser
        likedByMe
        likeCount
        likedByPostedUser

        profile {
          id
          name
        }

        masquerade {
          id
        }

        childComments {
          id
          content
          createdAt

          profile {
            id
            name
          }

          masquerade {
            id
          }
        }
      }
    `),
  );

  const blockMasquerade = graphql(`
    mutation PostPage_Comment_BlockMasquerade_Mutation($input: BlockMasqueradeInput!) {
      blockMasquerade(input: $input) {
        id
      }
    }
  `);

  const deleteComment = graphql(`
    mutation PostPage_Comment_DeleteComment_Mutation($input: DeleteCommentInput!) {
      deleteComment(input: $input) {
        id
      }
    }
  `);

  const pinComment = graphql(`
    mutation PostPage_Comment_PinComment_Mutation($input: PinCommentInput!) {
      pinComment(input: $input) {
        id
        pinned
      }
    }
  `);

  const unpinComment = graphql(`
    mutation PostPage_Comment_UnpinComment_Mutation($input: UnpinCommentInput!) {
      unpinComment(input: $input) {
        id
        pinned
      }
    }
  `);

  const likeComment = graphql(`
    mutation PostPage_Comment_LikeComment_Mutation($input: LikeCommentInput!) {
      likeComment(input: $input) {
        id
        likeCount
        likedByMe
        likedByPostedUser
      }
    }
  `);

  const unlikeComment = graphql(`
    mutation PostPage_Comment_UnlikeComment_Mutation($input: UnlikeCommentInput!) {
      unlikeComment(input: $input) {
        id
        likeCount
        likedByMe
        likedByPostedUser
      }
    }
  `);
</script>

{#if editing}
  <CommentInput
    $post={$query.post}
    {$query}
    commentId={$postComment.id}
    content={$postComment.content}
    {parentId}
    bind:editing
  />
{:else}
  <li
    class={clsx(
      'py-4 border-t border-gray-100 flex gap-1 first-of-type:border-none px-5 <sm:-mx-5',
      $postComment.pinned && 'bg-teal-50',
      parentId && 'bg-gray-50',
    )}
  >
    {#if parentId}
      <Icon class="square-3.5 text-gray-500" icon={IconReplyBar} />
    {/if}

    <div class="grow">
      {#if $postComment.pinned}
        <p class="text-gray-400 text-11-m mb-2 flex items-center gap-1">
          <Icon class="text-gray-400" icon={IconPinnedFilled} />
          고정된 댓글
        </p>
      {/if}

      <div class="flex items-center justify-between mb-2">
        {#if $query.post.member?.profile.id === $postComment.profile.id}
          <p class="bg-gray-400 text-white text-11-sb px-2.5 py-1 rounded">
            {$query.post.member?.profile.name}
          </p>
        {:else}
          <p class="text-14-m flex gap-1 items-center flex-wrap">
            {$postComment.profile.name}
            {#if $postComment.isPurchasedUser}
              <mark class="text-12-r text-teal-500">구매자</mark>
            {/if}
            {#if $postComment.visibility === 'PRIVATE'}
              <Icon class="square-4 text-gray-400" icon={IconLock} />
            {/if}
          </p>
        {/if}

        <Menu menuClass="w-158px" placement="bottom-end">
          <button
            slot="value"
            class={clsx(
              ($postComment.state === 'INACTIVE' ||
                (!$query.post.space.meAsMember && $postComment.profile.id !== $query.post.space.commentProfile?.id)) &&
                'hidden',
            )}
            type="button"
          >
            <Icon class="square-5 text-gray-500 square-5" icon={IconDotsVertical} />
          </button>

          {#if $query.post.space.meAsMember}
            <MenuItem
              on:click={async () => {
                if ($postComment.pinned) {
                  await unpinComment({ commentId: $postComment.id });
                  mixpanel.track('comment:unpin', { commentId: $postComment.id });
                } else {
                  await pinComment({ commentId: $postComment.id });
                  mixpanel.track('comment:pin', { commentId: $postComment.id });
                }
              }}
            >
              {$postComment.pinned ? '고정 해제' : '고정'}
            </MenuItem>
          {/if}
          {#if $query.post.space.commentProfile?.id === $postComment.profile.id}
            <MenuItem on:click={() => (editing = true)}>수정</MenuItem>
          {/if}
          {#if $query.post.space.meAsMember && $postComment.masquerade && $postComment.profile.id !== $query.post.member?.profile.id}
            <MenuItem on:click={() => (blockMasqueradeOpen = true)}>차단</MenuItem>
          {/if}
          {#if $query.post.space.meAsMember || $query.post.space.commentProfile?.id === $postComment.profile.id}
            <MenuItem
              on:click={async () => {
                await deleteComment({ commentId: $postComment.id });

                if (!$postComment.masquerade) return;

                mixpanel.track('comment:delete', {
                  masqueradeId: $postComment.masquerade.id,
                  spaceId: $query.post.space.id,
                });
              }}
            >
              삭제
            </MenuItem>
          {/if}
        </Menu>
      </div>

      {#if $postComment.visibility === 'PRIVATE' && $query.post.space.commentProfile?.id !== $postComment.profile.id && !$query.post.space.meAsMember}
        <p class="text-14-r text-gray-400">비밀댓글이에요</p>
      {:else}
        {#if $postComment.state === 'INACTIVE'}
          <p class="text-14-r text-gray-400">삭제된 댓글이에요</p>
        {:else}
          <p class="text-14-r whitespace-pre-wrap break-all">{$postComment.content}</p>

          <time class="text-10-l text-gray-400 block">{dayjs($postComment.createdAt).formatAsDateTime()}</time>

          <div class="mt-5 flex gap-1.5 items-center h-34px">
            <button
              class="text-gray-400 flex items-center gap-1 text-13-m m-7px"
              type="button"
              on:click={async () => {
                if ($postComment.likedByMe) {
                  await unlikeComment({ commentId: $postComment.id });
                  mixpanel.track('comment:unlike', { postId: $query.post.id, commentId: $postComment.id });
                } else {
                  await likeComment({ commentId: $postComment.id });
                  mixpanel.track('comment:like', { postId: $query.post.id, commentId: $postComment.id });
                }
              }}
            >
              {#if $postComment.likedByMe}
                <Icon class="square-4 block text-teal-500" icon={IconHeartFilled} />
              {:else}
                <Icon class="square-4 block text-gray-400" icon={IconHeart} />
              {/if}
              {#if $postComment.likeCount > 0}
                {$postComment.likeCount}
              {/if}
            </button>

            {#if !parentId}
              <Button
                class="bg-white/60!"
                size="2xs"
                variant="outline"
                on:click={() => (replyInputOpen = !replyInputOpen)}
              >
                답글
              </Button>
            {/if}

            {#if $postComment.likedByPostedUser}
              <div class="ring ring-teal-500 rounded-full square-5.5 relative m-1.5">
                {#if $query.post.member}
                  <Avatar class="rounded-full square-5.5" $profile={$query.post.member.profile} />
                {/if}

                <Icon class="text-teal-500 square-4 absolute -bottom-6px -right-6px" icon={IconHeartFilled} />
              </div>
            {/if}
          </div>
        {/if}

        {#if !parentId && $postComment.childComments.length > 0}
          <button
            class="flex items-center gap-1 text-12-m text-gray-500 mt-3"
            type="button"
            on:click={() => {
              repliesOpen = !repliesOpen;
              replyInputOpen = repliesOpen ? true : false;
            }}
          >
            {$postComment.childComments.length}개의 답글
            {#if repliesOpen}
              <Icon class="square-14px text-gray-500" icon={IconCaretUpFilled} />
            {:else}
              <Icon class="square-14px text-gray-500" icon={IconCaretDownFilled} />
            {/if}
          </button>
        {/if}
      {/if}
    </div>
  </li>
{/if}

{#if repliesOpen}
  {#each $postComment.childComments as reply (reply)}
    <svelte:self $postComment={reply} {$query} parentId={$postComment.id} />
  {/each}
{/if}

{#if replyInputOpen && $postComment.state !== 'INACTIVE'}
  <CommentInput $post={$query.post} {$query} parentId={$postComment.id} bind:editing={replyInputOpen} />
{/if}

<Modal
  actionClass="gap-1.5 border-none pt-7 pb-6 sm:(pb-7 px-7)"
  size="sm"
  titleClass="text-18-sb"
  bind:open={blockMasqueradeOpen}
>
  <svelte:fragment slot="title">{$postComment.profile.name}님을 차단할까요?</svelte:fragment>

  <div class="text-14-r text-gray-700 px-6 mt-1 sm:px-7">
    차단된 유저는 스페이스의 모든 게시물을 볼 수 없으며, 댓글을 달 수 없어요
    <br />
    차단 해지는 [스페이스 설정 - 독자관리]에서 가능해요
  </div>

  <svelte:fragment slot="action">
    <Button class="w-full" size="lg" variant="outline" on:click={() => (blockMasqueradeOpen = false)}>취소</Button>
    <Button
      class="w-full"
      size="lg"
      on:click={async () => {
        if (!$postComment.masquerade) return;

        await blockMasquerade({ masqueradeId: $postComment.masquerade.id, spaceId: $query.post.space.id });
        mixpanel.track('space:masquerade:block', {
          masqueradeId: $postComment.masquerade?.id,
          spaceId: $query.post.space.id,
        });
      }}
    >
      차단
    </Button>
  </svelte:fragment>
</Modal>
