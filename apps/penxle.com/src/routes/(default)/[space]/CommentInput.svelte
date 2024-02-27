<script lang="ts">
  import clsx from 'clsx';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Tooltip } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import type { CommentInput_post, CommentInput_query, PostCommentVisibility } from '$glitch';

  let visibility: PostCommentVisibility = 'PUBLIC';
  export let content = '';
  export let commentId: string | undefined = undefined;
  export let editing = true;

  let _query: CommentInput_query;
  let _post: CommentInput_post;
  export { _post as $post, _query as $query };

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
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment CommentInput_post on Post {
        id
        commentQualification

        space @_required {
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

<form
  class={clsx(
    'px-5 pt-5 pb-4',
    parentId ? 'border-t border-gray-100 bg-gray-50 <sm:-mx-5' : 'border border-gray-200 rounded-2.5',
  )}
  on:submit|preventDefault={async () => {
    if (commentId) {
      await updateComment({
        commentId,
        content,
      });
      mixpanel.track('comment:update', { postId: $post.id });
      editing = false;

      return;
    }

    if (parentId) {
      await createComment({
        content,
        postId: $post.id,
        parentId,
        visibility,
      });
      mixpanel.track('comment:create', { postId: $post.id });
      // editing = false;
      content = '';

      return;
    }

    if (content.length > 0 && $post.id) {
      await createComment({
        content,
        postId: $post.id,
        visibility,
      });
      mixpanel.track('comment:create', { postId: $post.id });
      content = '';
    }
  }}
>
  <div class="flex gap-2.5">
    {#if parentId}
      <i class="i-px2-reply-bar square-5 text-gray-400" />
    {/if}

    <label
      class={clsx(
        'w-full min-h-80px rounded-1.5 bg-white focus-within:(ring-1.5 ring-teal-500) p-4 <sm:p-2.5',
        parentId && 'ring-1.5 ring-gray-200',
      )}
    >
      <p class="flex items-center gap-0.5">
        <span class="text-11-r text-gray-400">{$post.space.commentProfile?.name ?? ''}</span>
        {#if !$post.space?.meAsMember && $query.me}
          <Tooltip
            enabled={!$post.space?.meAsMember}
            message="익명의 프로필명이 자동으로 생성돼요"
            offset={10}
            placement="top"
          >
            <i class="i-tb-alert-circle square-3 text-gray-400 block" />
          </Tooltip>
        {/if}
      </p>

      <textarea
        class="text-15-r resize-none w-full"
        disabled={!$query.me || ($post.commentQualification === 'IDENTIFIED' && !$query.me.personalIdentity)}
        placeholder={$query.me
          ? $post.commentQualification === 'IDENTIFIED' && !$query.me?.personalIdentity
            ? '창작자가 본인 인증 후 댓글을 달 수 있도록 설정했어요'
            : parentId
              ? '답글을 작성해보세요'
              : '창작자에게 응원의 글을 남겨주세요'
          : '댓글을 작성하려면 로그인이 필요해요'}
        bind:value={content}
      />
    </label>
  </div>

  <div class={clsx('flex items-center justify-between pt-2', ($post.space.meAsMember || commentId) && 'justify-end!')}>
    {#if !$post.space.meAsMember && !commentId}
      <button
        class={clsx(
          'flex items-center gap-1 text-14-r text-gray-400 py-2 px-3 rounded hover:bg-gray-100',
          visibility === 'PRIVATE' && 'text-teal-500',
        )}
        disabled={!$query.me || ($post.commentQualification === 'IDENTIFIED' && !$query.me?.personalIdentity)}
        type="button"
        on:click={() => (visibility = visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC')}
      >
        <i class={clsx('i-tb-lock square-6 block text-gray-400', visibility === 'PRIVATE' && 'text-teal-500')} />
        비밀글
      </button>
    {/if}

    {#if parentId}
      <div class="flex gap-1.5">
        <Button
          class="h-44px w-94px bg-white flex center <sm:(h-34px text-12-sb w-69px)"
          disabled={!$query.me || ($post.commentQualification === 'IDENTIFIED' && !$query.me?.personalIdentity)}
          size="lg"
          variant="outline"
          on:click={() => (editing = false)}
        >
          취소
        </Button>
        <Button
          class="h-44px w-94px flex center <sm:(h-34px text-12-sb w-69px)"
          disabled={!$query.me || ($post.commentQualification === 'IDENTIFIED' && !$query.me?.personalIdentity)}
          size="lg"
          type="submit"
          variant="secondary"
        >
          등록
        </Button>
      </div>
    {:else}
      <Button
        class="h-44px w-94px flex center <sm:(h-34px text-12-sb w-69px)"
        disabled={!$query.me || ($post.commentQualification === 'IDENTIFIED' && !$query.me?.personalIdentity)}
        size="lg"
        type="submit"
        variant="outline"
      >
        등록
      </Button>
    {/if}
  </div>
</form>
