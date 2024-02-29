<script lang="ts">
  import clsx from 'clsx';
  import IconReplyBar from '~icons/effit/reply-bar';
  import IconAlertCircle from '~icons/tabler/alert-circle';
  import IconLock from '~icons/tabler/lock';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, Tooltip } from '$lib/components';
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
  class={clsx('px-5 py-4 <sm:-mx-5', parentId && 'border-t border-gray-100 bg-gray-50')}
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
  <div class="flex gap-1">
    {#if parentId}
      <Icon class="square-3.5 text-gray-500" icon={IconReplyBar} />
    {/if}

    <div class="w-full">
      <p class="flex items-center gap-0.5 mb-2">
        {#if $post.space.meAsMember}
          <span class="py-1 px-2.5 rounded bg-gray-400 text-11-sb text-white">
            {$post.space.commentProfile?.name ?? ''}
          </span>
        {:else}
          <span class="text-14-m">{$post.space.commentProfile?.name ?? ''}</span>
        {/if}
        {#if !$post.space?.meAsMember && $query.me}
          <Tooltip
            enabled={!$post.space?.meAsMember}
            message="익명의 프로필명이 자동으로 생성돼요"
            offset={10}
            placement="top"
          >
            <Icon class="square-3 text-gray-400 block" icon={IconAlertCircle} />
          </Tooltip>
        {/if}
      </p>

      <textarea
        class="text-14-r resize-none w-full rounded py-2.5 px-3.5 ring ring-gray-200 focus-within:ring-teal-500"
        disabled={!$query.me ||
          ($post.commentQualification === 'IDENTIFIED' && !$query.me.personalIdentity) ||
          !$post.space.commentProfile}
        placeholder={$query.me
          ? $post.commentQualification === 'IDENTIFIED' && !$query.me?.personalIdentity
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
    class={clsx('flex items-center justify-between pt-2.5', ($post.space.meAsMember || commentId) && 'justify-end!')}
  >
    {#if !$post.space.meAsMember && !commentId}
      <button
        class={clsx(
          'flex items-center gap-1 text-14-r p-1.5 rounded hover:bg-gray-100',
          visibility === 'PRIVATE' ? 'text-teal-500' : 'text-gray-400',
        )}
        disabled={!$query.me || ($post.commentQualification === 'IDENTIFIED' && !$query.me?.personalIdentity)}
        type="button"
        on:click={() => (visibility = visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC')}
      >
        <Icon
          class={clsx('square-5 block ', visibility === 'PRIVATE' ? 'text-teal-500' : 'text-gray-400')}
          icon={IconLock}
        />
      </button>
    {/if}

    <Button
      class="h-44px w-94px flex center <sm:(h-34px text-12-sb w-69px)"
      disabled={!$query.me || ($post.commentQualification === 'IDENTIFIED' && !$query.me?.personalIdentity)}
      size="lg"
      type="submit"
      variant="outline"
    >
      등록
    </Button>
  </div>
</form>
