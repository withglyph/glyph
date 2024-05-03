<script lang="ts">
  import dayjs from 'dayjs';
  import * as R from 'radash';
  import IconFolder from '~icons/tabler/folder';
  import IconPhoto from '~icons/tabler/photo';
  import IconTextRecognition from '~icons/tabler/text-recognition';
  import IconTrash from '~icons/tabler/trash';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$bifrost';
  import { mixpanel } from '$lib/analytics';
  import { Alert, Chip, Icon } from '$lib/components';
  import { Checkbox } from '$lib/components/forms';
  import { Button, Modal } from '$lib/components/v2';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { EditorPage_DraftListModal_post, EditorPage_DraftListModal_user } from '$bifrost';

  let _user: EditorPage_DraftListModal_user;
  let _post: EditorPage_DraftListModal_post;
  export { _post as $post, _user as $user };
  export let open = false;

  let deletePostId: string | undefined;
  let deletePostOpen = false;

  let selectedPosts: string[] = [];
  let deleteSelectedPosts = false;

  $: user = fragment(
    _user,
    graphql(`
      fragment EditorPage_DraftListModal_user on User {
        id

        posts(state: DRAFT) {
          id
          permalink

          contentState {
            id
            title
            previewText
            characters
            files
            images
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

  $: allSelected =
    $user.posts?.length > 0 &&
    R.diff(
      $user.posts.map((p: (typeof $user.posts)[number]) => p.id),
      selectedPosts,
    ).length === 0;
</script>

<Modal style={css.raw({ paddingTop: '0', paddingX: '0' })} bind:open>
  <svelte:fragment slot="title">임시저장 포스트</svelte:fragment>

  <div>
    <div
      class={flex({
        position: 'sticky',
        top: '0',
        align: 'center',
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.150',
        backgroundColor: 'gray.50',
        zIndex: '1',
      })}
    >
      <div
        class={css({
          paddingX: '20px',
          width: '62px',
        })}
      >
        <Checkbox
          style={css.raw({ width: 'fit' })}
          checked={allSelected}
          on:change={() => {
            selectedPosts = allSelected ? [] : $user.posts.map((p) => p.id);
          }}
        />
      </div>
      <div
        class={flex({
          align: 'center',
          justify: 'space-between',
          gap: '32px',
          paddingY: '10px',
          paddingRight: '20px',
          paddingLeft: '14px',
          width: 'full',
          truncate: true,
        })}
      >
        <div
          class={css({
            fontSize: '14px',
            truncate: true,
          })}
        >
          총 <mark class={css({ color: 'brand.400' })}>{$user.posts?.length ?? 0}</mark>
          개의 포스트
        </div>
        <Button
          style={css.raw({ flex: 'none' })}
          disabled={selectedPosts.length === 0}
          size="xs"
          variant="gray-outline"
          on:click={() => {
            deleteSelectedPosts = true;
            deletePostOpen = true;
          }}
        >
          삭제
        </Button>
      </div>
    </div>

    <ul>
      {#each $user.posts as _post (_post.id)}
        <li
          class={flex({
            align: 'center',
            borderBottomWidth: '1px',
            borderBottomColor: 'gray.100',
            truncate: true,
            _last: { borderStyle: 'none' },
          })}
        >
          <div class={css({ paddingY: '14px', paddingX: '20px' })}>
            <Checkbox
              checked={selectedPosts.includes(_post.id)}
              on:change={() =>
                (selectedPosts = selectedPosts.includes(_post.id)
                  ? selectedPosts.filter((id) => id !== _post.id)
                  : [...selectedPosts, _post.id])}
            />
          </div>

          <div class={flex({ align: 'center', justify: 'space-between', gap: '32px', width: 'full', truncate: true })}>
            <div class={css({ padding: '14px', width: 'full', truncate: true })}>
              <a class={css({ truncate: true })} href={`/editor/${_post.permalink}`}>
                {#if _post.id === $post.id}
                  <Chip
                    style={css.raw({ flex: 'none', marginBottom: '4px', width: 'fit' })}
                    color="grass"
                    variant="fill"
                  >
                    현재포스트
                  </Chip>
                {/if}

                <p class={css({ fontWeight: 'semibold', truncate: true })}>
                  {_post.contentState.title ?? '(제목 없음)'}
                </p>
                <p class={css({ fontSize: '14px', color: 'gray.600', truncate: true })}>
                  {_post.contentState.previewText}
                </p>

                <div class={flex({ align: 'center', marginTop: '6px', fontSize: '12px', color: 'gray.500' })}>
                  <Icon style={css.raw({ marginRight: '2px', size: '14px' })} icon={IconTextRecognition} />
                  <span>{comma(_post.contentState.characters)}자</span>

                  {#if _post.contentState.images > 0}
                    <Icon style={css.raw({ marginLeft: '6px', marginRight: '2px', size: '14px' })} icon={IconPhoto} />
                    <span>{comma(_post.contentState.images)}장</span>
                  {/if}

                  {#if _post.contentState.files > 0}
                    <Icon style={css.raw({ marginLeft: '6px', marginRight: '2px', size: '14px' })} icon={IconFolder} />
                    <span>{comma(_post.contentState.files)}개</span>
                  {/if}

                  <hr
                    class={css({
                      flex: 'none',
                      marginX: '8px',
                      border: 'none',
                      width: '1px',
                      height: '12px',
                      backgroundColor: 'gray.100',
                    })}
                  />

                  <time class={css({ truncate: true })} datetime={_post.contentState.updatedAt}>
                    {dayjs(_post.contentState.updatedAt).formatAsDateTime()}
                  </time>
                </div>
              </a>
            </div>

            <button
              class={css({ paddingY: '10px', paddingRight: '20px' })}
              type="button"
              on:click={() => {
                deletePostOpen = true;
                deletePostId = _post.id;
              }}
            >
              <Icon style={css.raw({ color: 'gray.500' })} icon={IconTrash} size={20} />
            </button>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</Modal>

<Alert bind:open={deletePostOpen}>
  <svelte:fragment slot="title">
    {deleteSelectedPosts ? `총 ${selectedPosts.length}개의 임시저장글을` : ''}삭제하시겠습니까?
  </svelte:fragment>

  <svelte:fragment slot="action">
    <Button
      style={css.raw({ hideFrom: 'sm' })}
      size="lg"
      variant="gray-sub-fill"
      on:click={() => {
        deleteSelectedPosts = false;
        deletePostOpen = false;
      }}
    >
      취소
    </Button>
    <Button
      style={css.raw({ hideBelow: 'sm' })}
      size="lg"
      variant="gray-outline"
      on:click={() => {
        deleteSelectedPosts = false;
        deletePostOpen = false;
      }}
    >
      취소
    </Button>

    <Button
      size="lg"
      variant="red-fill"
      on:click={async () => {
        if (deleteSelectedPosts) {
          if (selectedPosts.includes($post.id)) {
            await goto('/');
          }

          await Promise.all(selectedPosts.map((postId) => deletePost({ postId })));
          mixpanel.track('post:delete', { postIds: selectedPosts, via: 'editor' });

          deleteSelectedPosts = false;
          selectedPosts = [];
        } else if (deletePostId) {
          if (selectedPosts.includes(deletePostId)) {
            selectedPosts = selectedPosts.filter((id) => id !== deletePostId);
          }

          if (deletePostId === $post.id) {
            await goto('/');
          }

          await deletePost({ postId: deletePostId });
          mixpanel.track('post:delete', { postId: deletePostId, via: 'editor' });
        }

        deletePostOpen = false;
      }}
    >
      삭제
    </Button>
  </svelte:fragment>
</Alert>
