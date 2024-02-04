<script lang="ts">
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Badge, Button, Modal } from '$lib/components';
  import { toast } from '$lib/notification';
  import type { EditorPage_DraftListModal_post, EditorPage_DraftListModal_user } from '$glitch';

  let _user: EditorPage_DraftListModal_user;
  let _post: EditorPage_DraftListModal_post;
  export { _post as $post, _user as $user };
  export let open = false;

  let deletePostId: string | undefined;
  let deletePostOpen = false;

  $: user = fragment(
    _user,
    graphql(`
      fragment EditorPage_DraftListModal_user on User {
        id

        posts(state: DRAFT) {
          id
          permalink

          draftRevision {
            id
            title
            characterCount
            updatedAt
          }
        }
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_DraftListModal_post on Post {
        id
      }
    `),
  );

  const deletePost = graphql(`
    mutation EditorPage_DraftListModal_DeletePost_Mutation($input: DeletePostInput!) {
      deletePost(input: $input) {
        id
      }
    }
  `);
</script>

<Modal bind:open>
  <svelte:fragment slot="title">임시저장된 포스트</svelte:fragment>
  <svelte:fragment slot="subtitle">{$user.posts?.length ?? 0}개의 포스트</svelte:fragment>

  <ul class="sm:(overflow-y-auto max-h-15rem)">
    {#each $user.posts as _post (_post.id)}
      <li class="py-3 border-t border-secondary flex items-center justify-between gap-2 [&>button]:hover:block">
        <button
          class="truncate w-full"
          type="button"
          on:click={async () => {
            open = false;
            await goto(`/editor/${_post.permalink}`);
          }}
        >
          <p
            class={clsx('body-16-b mb-1 truncate', _post.draftRevision?.title?.trim().length === 0 && 'text-secondary')}
          >
            {_post.draftRevision?.title?.trim().length === 0
              ? '(제목 없음)'
              : _post.draftRevision?.title ?? '(제목 없음)'}
          </p>
          <div class="body-13-m text-secondary flex gap-8px items-center">
            <div class="flex gap-2px items-center">
              <i class="i-tb-calendar" />
              {dayjs(_post.draftRevision?.updatedAt).formatAsDateTime()}
            </div>

            <div class="flex gap-2px items-center">
              <i class="i-tb-text-recognition" />
              {_post.draftRevision.characterCount}자
            </div>
          </div>
        </button>
        <button
          class="i-lc-trash hidden square-5 color-text-disabled"
          type="button"
          on:click={() => {
            deletePostOpen = true;
            deletePostId = _post.id;
          }}
        />
        {#if _post.id === $post.id}
          <div class="mb-1 flex-none">
            <Badge color="green">현재 포스트</Badge>
          </div>
        {/if}
      </li>
    {/each}
  </ul>
</Modal>

<Modal size="sm" bind:open={deletePostOpen}>
  <svelte:fragment slot="title">임시저장글을 삭제할까요?</svelte:fragment>

  <div slot="action" class="flex gap-3 w-full">
    <Button class="w-full" color="secondary" size="xl" on:click={() => (deletePostOpen = false)}>닫기</Button>
    <Button
      class="w-full"
      size="xl"
      on:click={async () => {
        if (deletePostId) {
          await deletePost({ postId: deletePostId });
          mixpanel.track('post:delete', { postId: deletePostId, via: 'editor' });
          toast.success('임시저장 포스트를 삭제했어요');
          deletePostOpen = false;

          if (deletePostId === $post.id) {
            await goto('/');
          }
        }
      }}
    >
      삭제
    </Button>
  </div>
</Modal>
