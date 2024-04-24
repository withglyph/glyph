<script lang="ts">
  import dayjs from 'dayjs';
  import IconLock from '~icons/glyph/lock';
  import IconReplyBar from '~icons/glyph/reply-bar';
  import IconCaretDownFilled from '~icons/tabler/caret-down-filled';
  import IconCaretUpFilled from '~icons/tabler/caret-up-filled';
  import IconDotsVertical from '~icons/tabler/dots-vertical';
  import IconHeart from '~icons/tabler/heart';
  import IconHeartFilled from '~icons/tabler/heart-filled';
  import IconPinnedFilled from '~icons/tabler/pinned-filled';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Alert, Avatar, Icon } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import CommentInput from './CommentInput.svelte';
  import type { PostPage_Comment_postComment, PostPage_Comment_query } from '$glitch';

  export let editing = false;
  export let parentId: string | undefined = undefined;
  export let visible = false;

  let repliesOpen = false;
  let replyInputOpen = false;
  let blockMasqueradeOpen = false;
  let deleteCommentOpen = false;

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

          space {
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

            children {
              id

              profile {
                id
              }
            }
          }
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
        purchased
        liked
        likeCount
        likedByPostUser

        profile {
          id
          name
        }

        masquerade {
          id
        }

        children {
          id
          content
          pinned
          visibility
          createdAt
          state
          purchased
          liked
          likeCount
          likedByPostUser

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
        liked
        likedByPostUser
      }
    }
  `);

  const unlikeComment = graphql(`
    mutation PostPage_Comment_UnlikeComment_Mutation($input: UnlikeCommentInput!) {
      unlikeComment(input: $input) {
        id
        likeCount
        liked
        likedByPostUser
      }
    }
  `);

  $: if (!parentId) {
    visible = $query.post.space?.commentProfile?.id === $postComment.profile.id || !!$query.post.space?.meAsMember;
  }
</script>

{#if $query.post.space}
  <li
    class={css(
      {
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.100',
        paddingY: '24px',
        _lastOfType: { borderBottomWidth: '0' },
      },
      !!parentId && { paddingLeft: { base: '20px', sm: '40px' } },
      !!parentId && editing && { paddingTop: '18px' },
    )}
  >
    {#if editing}
      <CommentInput {$query} commentId={$postComment.id} content={$postComment.content} {parentId} bind:editing />
    {:else}
      <div class={css({ flexGrow: '1' })}>
        {#if $postComment.pinned}
          <span
            class={flex({
              align: 'center',
              gap: '2px',
              marginBottom: '6px',
              padding: '4px',
              paddingRight: '6px',
              fontSize: '12px',
              color: 'gray.500',
              width: 'fit',
              backgroundColor: 'gray.50',
            })}
          >
            <Icon icon={IconPinnedFilled} size={12} />
            고정 댓글
          </span>
        {/if}

        <div class={flex({ justify: 'space-between', align: 'center', marginBottom: '6px' })}>
          <p class={flex({ align: 'center', gap: '2px', wrap: 'wrap', fontSize: '14px', fontWeight: 'medium' })}>
            {#if parentId}
              <Icon icon={IconReplyBar} size={12} />
            {/if}
            {#if $postComment.visibility === 'PRIVATE'}
              <Icon style={css.raw({ size: '14px' })} icon={IconLock} />
            {/if}
            {$postComment.profile.name}
            <span class={css({ marginRight: '2px', fontSize: '12px', color: 'brand.400' })}>
              {$postComment.purchased
                ? '구매자'
                : $query.post.member?.profile.id === $postComment.profile.id
                  ? '창작자'
                  : ''}
            </span>
          </p>

          <Menu menuStyle={css.raw({ width: '158px' })} placement="bottom-end">
            <div
              slot="value"
              class={css(
                ($postComment.state === 'INACTIVE' ||
                  (!$query.post.space.meAsMember &&
                    $postComment.profile.id !== $query.post.space.commentProfile?.id)) && { display: 'none' },
              )}
            >
              <Icon style={css.raw({ color: 'gray.500' })} icon={IconDotsVertical} size={20} />
            </div>

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
              <MenuItem on:click={() => (deleteCommentOpen = true)}>삭제</MenuItem>
            {/if}
          </Menu>
        </div>

        {#if $postComment.visibility === 'PRIVATE' && !visible}
          <p class={css({ fontSize: '14px', color: 'gray.400' })}>비밀댓글이에요</p>
        {:else if $postComment.state === 'INACTIVE'}
          <p class={css({ fontSize: '14px', color: 'gray.400' })}>삭제된 댓글이에요</p>
        {:else}
          <p class={css({ fontSize: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' })}>
            {$postComment.content}
          </p>
        {/if}

        <time
          class={css({ display: 'inline-block', marginTop: '4px', fontSize: '12px', color: 'gray.500' })}
          datetime={$postComment.createdAt}
        >
          {dayjs($postComment.createdAt).formatAsDateTime()}
        </time>

        <div class={flex({ align: 'center', justify: 'space-between', height: '37px' })}>
          {#if ($postComment.visibility === 'PUBLIC' && $postComment.state === 'ACTIVE') || visible}
            <div class={flex({ align: 'center', marginTop: '6px' })}>
              {#if !parentId}
                <button
                  class={flex({
                    align: 'center',
                    marginRight: '14px',
                    paddingY: '9px',
                    fontSize: '13px',
                    fontWeight: 'medium',
                    color: 'gray.500',
                    _after: {
                      content: '""',
                      display: 'block',
                      width: '1px',
                      height: '10px',
                      backgroundColor: 'gray.100',
                      marginLeft: '14px',
                    },
                  })}
                  type="button"
                  on:click={() => (replyInputOpen = !replyInputOpen)}
                >
                  답글
                </button>
              {/if}

              <button
                class={flex({
                  align: 'center',
                  gap: '2px',
                  fontSize: '14px',
                  fontWeight: 'medium',
                  color: 'gray.500',
                  height: '37px',
                })}
                type="button"
                on:click={async () => {
                  if ($postComment.liked) {
                    await unlikeComment({ commentId: $postComment.id });
                    mixpanel.track('comment:unlike', { postId: $query.post.id, commentId: $postComment.id });
                  } else {
                    await likeComment({ commentId: $postComment.id });
                    mixpanel.track('comment:like', { postId: $query.post.id, commentId: $postComment.id });
                  }
                }}
              >
                {#if $postComment.liked}
                  <Icon icon={IconHeartFilled} />
                {:else}
                  <Icon icon={IconHeart} />
                {/if}
                {#if $postComment.likeCount > 0}
                  {$postComment.likeCount}
                {/if}
              </button>
            </div>
          {/if}

          {#if $postComment.likedByPostUser}
            <div
              class={center({
                position: 'relative',
                borderRadius: 'full',
                outlineWidth: '1px',
                outlineColor: 'gray.900',
                marginLeft: 'auto',
                marginRight: '7px',
                size: '24px',
              })}
            >
              {#if $query.post.member}
                <Avatar
                  style={css.raw({ borderRadius: 'full', size: '24px' })}
                  $profile={$query.post.member.profile}
                  size={24}
                />
              {/if}

              <Icon
                style={css.raw({
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  color: 'gray.900',
                })}
                icon={IconHeartFilled}
              />
            </div>
          {/if}
        </div>

        {#if !parentId && $postComment.children.length > 0}
          <button
            class={flex({
              align: 'center',
              gap: '4px',
              marginTop: '2px',
              paddingY: '6px',
              fontSize: '13px',
              fontWeight: 'medium',
              color: 'gray.500',
            })}
            type="button"
            on:click={() => {
              repliesOpen = !repliesOpen;
              replyInputOpen = repliesOpen ? true : false;
            }}
          >
            {$postComment.children.length}개의 답글
            {#if repliesOpen}
              <Icon icon={IconCaretUpFilled} />
            {:else}
              <Icon icon={IconCaretDownFilled} />
            {/if}
          </button>
        {/if}
      </div>
    {/if}
  </li>

  {#if repliesOpen}
    {#each $postComment.children as reply (reply)}
      <svelte:self
        $postComment={reply}
        {$query}
        parentId={$postComment.id}
        visible={$query.post.space?.commentProfile?.id === reply.profile.id || visible}
      />
    {/each}
  {/if}

  {#if replyInputOpen && (($postComment.visibility === 'PUBLIC' && $postComment.state === 'ACTIVE') || visible)}
    <li
      class={css({
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.100',
        paddingTop: '18px',
        paddingLeft: { base: '20px', sm: '40px' },
        paddingBottom: '24px',
        _lastOfType: { borderBottomWidth: '0' },
      })}
    >
      <CommentInput
        {$query}
        parentId={$postComment.id}
        visibility={$postComment.visibility}
        bind:editing={replyInputOpen}
      />
    </li>
  {/if}

  <Alert bind:open={blockMasqueradeOpen}>
    <p slot="title" class={css({ textAlign: 'left' })}>{$postComment.profile.name}님을 차단할까요?</p>

    <div slot="content" class={css({ textAlign: 'left' })}>
      차단된 유저는 스페이스의 모든 게시물을 볼 수 없으며, 댓글을 달 수 없어요
      <br />
      차단 해지는 [스페이스 설정 - 독자관리]에서 가능해요
    </div>

    <svelte:fragment slot="action">
      <Button size="lg" variant="gray-sub-fill" on:click={() => (blockMasqueradeOpen = false)}>취소</Button>
      <Button
        size="lg"
        variant="red-fill"
        on:click={async () => {
          if (!$postComment.masquerade || !$query.post.space) return;

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
  </Alert>

  <Alert bind:open={deleteCommentOpen}>
    <svelte:fragment slot="title">댓글을 삭제하시겠어요?</svelte:fragment>

    <svelte:fragment slot="action">
      <Button size="lg" variant="gray-sub-fill" on:click={() => (deleteCommentOpen = false)}>취소</Button>
      <Button
        size="lg"
        variant="red-fill"
        on:click={async () => {
          await deleteComment({ commentId: $postComment.id });

          if (!$postComment.masquerade || !$query.post.space) return;

          mixpanel.track('comment:delete', {
            masqueradeId: $postComment.masquerade.id,
            spaceId: $query.post.space.id,
          });

          deleteCommentOpen = false;
        }}
      >
        삭제
      </Button>
    </svelte:fragment>
  </Alert>
{/if}
