<script lang="ts">
  import IconReplyBar from '~icons/effit/reply-bar';
  import IconAlertCircle from '~icons/tabler/alert-circle';
  import IconLock from '~icons/tabler/lock';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, Tooltip } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type { CommentInput_query, PostCommentVisibility } from '$glitch';

  let visibility: PostCommentVisibility = 'PUBLIC';
  export let content = '';
  export let commentId: string | undefined = undefined;
  export let editing = true;

  let _query: CommentInput_query;
  export { _query as $query };

  export let parentId: string | undefined = undefined;

  $: query = fragment(
    _query,
    graphql(`
      fragment CommentInput_query on Query {
        me {
          id

          personalIdentity {
            id
          }
        }

        post(permalink: $permalink) {
          id
          commentQualification

          space {
            id

            meAsMember {
              id
            }

            commentProfile {
              id
              name
            }
          }
        }
      }
    `),
  );

  const createComment = graphql(`
    mutation PostPage_CommentInput_CreateComment_Mutation($input: CreateCommentInput!) {
      createComment(input: $input) {
        id
        content
      }
    }
  `);

  const updateComment = graphql(`
    mutation PostPage_CommentInput_UpdateComment_Mutation($input: UpdateCommentInput!) {
      updateComment(input: $input) {
        id
        content
      }
    }
  `);
</script>

{#if $query.post.space}
  <form
    class={css(
      { paddingX: '20px', paddingY: '16px', smDown: { marginX: '-20px' } },
      !!parentId && { borderTopWidth: '1px', borderTopColor: 'gray.100', backgroundColor: 'gray.50' },
    )}
    on:submit|preventDefault={async () => {
      if (commentId) {
        await updateComment({
          commentId,
          content,
        });
        mixpanel.track('comment:update', { postId: $query.post.id });
        editing = false;

        return;
      }

      if (parentId) {
        await createComment({
          content,
          postId: $query.post.id,
          parentId,
          visibility,
        });
        mixpanel.track('comment:create', { postId: $query.post.id });
        // editing = false;
        content = '';

        return;
      }

      if (content.length > 0 && $query.post.id) {
        await createComment({
          content,
          postId: $query.post.id,
          visibility,
        });
        mixpanel.track('comment:create', { postId: $query.post.id });
        content = '';
      }
    }}
  >
    <div class={flex({ gap: '4px' })}>
      {#if parentId}
        <Icon style={css.raw({ color: 'gray.500' })} icon={IconReplyBar} />
      {/if}

      <div class={css({ width: 'full' })}>
        <div class={flex({ align: 'center', gap: '2px', marginBottom: '8px' })}>
          {#if $query.post.space.meAsMember}
            <span
              class={css({
                borderRadius: '4px',
                paddingX: '10px',
                paddingY: '4px',
                fontSize: '11px',
                fontWeight: 'semibold',
                color: 'gray.5',
                backgroundColor: 'gray.400',
              })}
            >
              {$query.post.space.commentProfile?.name ?? ''}
            </span>
          {:else}
            <span class={css({ fontSize: '14px', fontWeight: 'medium' })}>
              {$query.post.space.commentProfile?.name ?? ''}
            </span>
          {/if}
          {#if !$query.post.space?.meAsMember && $query.me}
            <Tooltip
              enabled={!$query.post.space?.meAsMember}
              message="익명의 프로필명이 자동으로 생성돼요"
              offset={10}
              placement="top"
            >
              <Icon style={css.raw({ color: 'gray.400' })} icon={IconAlertCircle} size={12} />
            </Tooltip>
          {/if}
        </div>

        <textarea
          class={css({
            borderRadius: '4px',
            outlineWidth: '1px',
            outlineColor: { base: 'gray.200', _focusWithin: 'teal.500' },
            paddingX: '14px',
            paddingY: '10px',
            width: 'full',
            fontSize: '14px',
            resize: 'none',
          })}
          disabled={!$query.me ||
            ($query.post.commentQualification === 'IDENTIFIED' && !$query.me.personalIdentity) ||
            !$query.post.space.commentProfile}
          placeholder={$query.me
            ? $query.post.commentQualification === 'IDENTIFIED' && !$query.me?.personalIdentity
              ? '창작자가 본인 인증 후 댓글을 달 수 있도록 설정했어요'
              : parentId
                ? '답글을 작성해보세요'
                : '창작자에게 응원의 글을 남겨주세요'
            : '댓글을 작성하려면 로그인이 필요해요'}
          rows="4"
          bind:value={content}
        />
      </div>
    </div>

    <div
      class={css(
        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' },
        ($query.post.space.meAsMember || !!commentId) && { justifyContent: 'flex-end' },
      )}
    >
      {#if !$query.post.space.meAsMember && !commentId}
        <button
          class={flex({
            align: 'center',
            gap: '4px',
            borderRadius: '4px',
            padding: '6px',
            fontSize: '14px',
            color: visibility === 'PRIVATE' ? 'teal.500' : 'gray.400',
            _hover: { backgroundColor: 'gray.100' },
          })}
          disabled={!$query.me || ($query.post.commentQualification === 'IDENTIFIED' && !$query.me?.personalIdentity)}
          type="button"
          on:click={() => (visibility = visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC')}
        >
          <Icon
            style={css.raw({
              color: visibility === 'PRIVATE' ? 'teal.500' : 'gray.400',
            })}
            icon={IconLock}
            size={20}
          />
        </button>
      {/if}

      <Button
        style={center.raw({
          width: '94px',
          height: '44px',
          smDown: {
            width: '69px',
            height: '34px',
            fontSize: '12px',
            fontWeight: 'semibold',
          },
        })}
        disabled={!$query.me || ($query.post.commentQualification === 'IDENTIFIED' && !$query.me?.personalIdentity)}
        size="lg"
        type="submit"
        variant="gray-outline"
      >
        등록
      </Button>
    </div>
  </form>
{/if}
