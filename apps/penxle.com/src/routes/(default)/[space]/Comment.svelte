<script lang="ts">
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { Button } from '$lib/components/v2';
  import CommentInput from './CommentInput.svelte';
  import type { PostPage_Comment_postComment, PostPage_Comment_query } from '$glitch';

  export let editing = false;
  let repliesOpen = false;
  let replyInputOpen = false;
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
      'py-6 border-t border-gray-100 flex gap-2.5 first-of-type:border-none px-5 <sm:-mx-5',
      $postComment.pinned && 'bg-teal-50',
      parentId && 'bg-gray-50',
    )}
  >
    {#if parentId}
      <i class="i-px2-reply-bar square-5 text-gray-400" />
    {/if}

    <div class="grow">
      {#if $postComment.pinned}
        <p class="text-gray-400 text-11-m mb-2 flex items-center gap-1">
          <i class="i-tb-pinned-filled text-gray-400" />
          고정된 댓글
        </p>
      {/if}

      <div class="flex items-center justify-between">
        {#if $query.post.member?.profile.id === $postComment.profile.id}
          <p class="bg-gray-400 text-white text-11-sb px-2.5 py-1 rounded">
            {$query.post.member?.profile.name}
          </p>
        {:else}
          <p class="text-15-sb flex gap-1 items-center flex-wrap">
            {$postComment.profile.name}
            {#if $postComment.isPurchasedUser}
              <mark class="text-12-r text-teal-500">구매자</mark>
            {/if}
            {#if $postComment.visibility === 'PRIVATE'}
              <i class="i-tb-lock square-4 text-gray-400" />
            {/if}
          </p>
        {/if}

        <Menu menuClass="w-158px" placement="bottom-end">
          <button
            slot="value"
            class={clsx(
              'i-tb-dots-vertical square-5 text-gray-500',
              ($postComment.state === 'INACTIVE' ||
                (!$query.post.space.meAsMember && $postComment.profile.id !== $query.post.space.commentProfile?.id)) &&
                'hidden',
            )}
            type="button"
          />

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
            <MenuItem
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
            </MenuItem>
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
        <p class="text-15-r text-gray-400 mt-2 mb-1.5">비밀댓글이에요</p>
      {:else}
        {#if $postComment.state === 'INACTIVE'}
          <p class="text-15-r text-gray-400 mt-2 mb-1.5">삭제된 댓글이에요</p>
        {:else}
          <p class="text-15-r mt-2 mb-1.5 whitespace-pre">{$postComment.content}</p>

          <time class="text-11-l text-gray-400 block">{dayjs($postComment.createdAt).formatAsDateTime()}</time>

          <div class="mt-5 flex gap-1.5 items-center">
            <button
              class="text-gray-500 flex items-center gap-1 text-13-m m-7px"
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
                <i class="i-tb-heart-filled square-4 block text-teal-500" />
              {:else}
                <i class="i-tb-heart square-4 block text-gray-500" />
              {/if}
              {$postComment.likeCount ?? ''}
            </button>

            {#if !parentId}
              <Button
                class="bg-white/60!"
                size="xs"
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

                <i class="i-tb-heart-filled text-teal-500 square-4 absolute -bottom-6px -right-6px" />
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
            <i
              class={clsx('i-tb-caret-down-filled square-14px text-gray-500', repliesOpen && 'i-tb-caret-up-filled')}
            />
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
