<script lang="ts">
  import IconLock from '~icons/glyph/lock';
  import IconReplyBar from '~icons/glyph/reply-bar';
  import IconAlertCircle from '~icons/tabler/alert-circle';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Icon, Tooltip } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type { CommentInput_query, PostCommentVisibility } from '$glitch';

  export let visibility: PostCommentVisibility = 'PUBLIC';
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

          member {
            id
          }

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
    <div class={css({ width: 'full' })}>
      {#if $query.me}
        <div class={flex({ align: 'center', gap: '4px', marginBottom: '6px' })}>
          {#if parentId}
            <Icon icon={IconReplyBar} size={12} />
          {/if}
          <span class={css({ fontSize: '14px', fontWeight: 'medium' })}>
            {$query.post.space.commentProfile?.name ?? ''}
          </span>
          {#if !$query.post.space?.meAsMember}
            <Tooltip
              enabled={!$query.post.space?.meAsMember}
              message="익명의 프로필명이 자동으로 생성돼요"
              offset={10}
              placement="top"
            >
              <Icon style={css.raw({ color: 'gray.400' })} icon={IconAlertCircle} size={12} />
            </Tooltip>
          {:else if $query.post.member?.id === $query.post.space?.meAsMember?.id}
            <span class={css({ fontSize: '12px', color: 'brand.400' })}>창작자</span>
          {/if}
        </div>
      {/if}

      <textarea
        class={css({
          outlineWidth: '1px',
          outlineColor: { base: 'gray.200', _focusWithin: 'gray.900' },
          padding: '20px',
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

    <div
      class={css(
        { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px' },
        ($query.post.space.meAsMember || !!commentId) && { justifyContent: 'flex-end' },
      )}
    >
      {#if !commentId && $query.me}
        <Button
          style={center.raw({ size: '37px', _pressed: { backgroundColor: 'gray.200!', outline: 'none!' } })}
          aria-pressed={visibility === 'PRIVATE'}
          disabled={!$query.me || ($query.post.commentQualification === 'IDENTIFIED' && !$query.me?.personalIdentity)}
          variant="gray-outline"
          on:click={() => (visibility = visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC')}
        >
          <Icon icon={IconLock} />
        </Button>
      {/if}

      <Button
        style={center.raw({ marginLeft: 'auto', width: '68px', height: '37px' })}
        disabled={!$query.me || ($query.post.commentQualification === 'IDENTIFIED' && !$query.me?.personalIdentity)}
        size="sm"
        type="submit"
        variant="gray-outline"
      >
        등록
      </Button>
    </div>
  </form>
{/if}
