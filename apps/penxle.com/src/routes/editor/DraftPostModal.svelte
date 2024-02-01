<script lang="ts">
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal } from '$lib/components';
  import { toast } from '$lib/notification';
  import type { EditorPage_DraftPostModal_user } from '$glitch';

  let deletePostId: string | undefined;
  export let open = false;
  export let postId: string | undefined = undefined;
  let deleteDraftPostOpen = false;

  let _user: EditorPage_DraftPostModal_user;
  export { _user as $user };

  $: user = fragment(
    _user,
    graphql(`
      fragment EditorPage_DraftPostModal_user on User {
        id

        posts(state: DRAFT) {
          id
          permalink

          draftRevision @_required {
            id
            title
            updatedAt
          }
        }
      }
    `),
  );

  const deletePost = graphql(`
    mutation EditorPage_DraftPostModal_DeletePost_Mutation($input: DeletePostInput!) {
      deletePost(input: $input) {
        id
      }
    }
  `);
</script>

<Modal bind:open>
  <svelte:fragment slot="title">임시저장된 글</svelte:fragment>
  <svelte:fragment slot="subtitle">{$user.posts?.length ?? 0}개의 포스트</svelte:fragment>

  <ul class="sm:(overflow-y-auto max-h-15rem)">
    {#each $user.posts as post (post.id)}
      <li class="py-3 border-t border-secondary flex items-center justify-between gap-2 [&>button]:hover:block">
        <button
          class="truncate w-full"
          type="button"
          on:click={async () => {
            open = false;
            window.location.href = `/editor/${post.permalink}`;
          }}
        >
          <p class={clsx('body-16-b mb-1 truncate', post.draftRevision?.title.trim().length === 0 && 'text-secondary')}>
            {post.draftRevision?.title.trim().length === 0 ? '(제목 없음)' : post.draftRevision?.title}
          </p>
          <time class="body-13-m text-secondary">{dayjs(post.draftRevision?.updatedAt).formatAsDate()}</time>
        </button>
        <button
          class="i-lc-trash hidden square-5 color-text-disabled"
          type="button"
          on:click={() => {
            deleteDraftPostOpen = true;
            deletePostId = post.id;
          }}
        />
      </li>
    {/each}
  </ul>
</Modal>

<Modal size="sm" bind:open={deleteDraftPostOpen}>
  <svelte:fragment slot="title">임시저장글을 삭제할까요?</svelte:fragment>

  <div slot="action" class="flex gap-3 w-full">
    <Button class="w-full" color="secondary" size="xl" on:click={() => (deleteDraftPostOpen = false)}>닫기</Button>
    <Button
      class="w-full"
      size="xl"
      on:click={async () => {
        if (deletePostId) {
          if (postId === deletePostId) {
            await goto('/editor');
          }
          await deletePost({ postId: deletePostId });
          mixpanel.track('post:delete', { postId: deletePostId, via: 'editor' });
          toast.success('임시저장 포스트를 삭제했어요');
          deleteDraftPostOpen = false;
        }
      }}
    >
      삭제
    </Button>
  </div>
</Modal>
