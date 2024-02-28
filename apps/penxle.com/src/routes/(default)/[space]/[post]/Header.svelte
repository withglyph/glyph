<script lang="ts">
  import { Link } from '@penxle/ui';
  import clsx from 'clsx';
  import { goto } from '$app/navigation';
  import Logo from '$assets/icons/logo.svg?component';
  import Wordmark from '$assets/icons/wordmark.svg?component';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Modal } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { Button } from '$lib/components/v2';
  import { toast } from '$lib/notification';
  import LoginRequireModal from '../../LoginRequireModal.svelte';
  import NotificationMenu from '../../NotificationMenu.svelte';
  import SearchBar from '../../SearchBar.svelte';
  import UserMenu from '../../UserMenu.svelte';
  import type { SpacePostPage_Header_query } from '$glitch';

  let _query: SpacePostPage_Header_query;
  export { _query as $query };

  let loginRequireOpen = false;
  let openDeletePostWarning = false;

  $: query = fragment(
    _query,
    graphql(`
      fragment SpacePostPage_Header_query on Query {
        me {
          id
          email

          profile {
            id
            name
          }

          ...DefaultLayout_UserMenu_user
          ...DefaultLayout_NotificationMenu_user
        }

        post(permalink: $permalink) {
          id
          permalink

          space {
            id
            slug
            muted

            meAsMember {
              id
            }
          }

          bookmarkGroups {
            id
          }
        }
      }
    `),
  );

  const createPost = graphql(`
    mutation SpacePostPage_Header_CreatePost_Mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        permalink
      }
    }
  `);

  const bookmarkPost = graphql(`
    mutation SpacePostPage_Header_BookmarkPost_Mutation($input: BookmarkPostInput!) {
      bookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);

  const unbookmarkPost = graphql(`
    mutation SpacePostPage_Header_UnbookmarkPost_Mutation($input: UnbookmarkPostInput!) {
      unbookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);

  const muteSpace = graphql(`
    mutation SpacePostPage_Header_MuteSpace_Mutation($input: MuteSpaceInput!) {
      muteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  const unmuteSpace = graphql(`
    mutation SpacePostPage_Header_UnmuteSpace_Mutation($input: UnmuteSpaceInput!) {
      unmuteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  const deletePost = graphql(`
    mutation SpacePostPage_DeletePost_Mutation($input: DeletePostInput!) {
      deletePost(input: $input) {
        id

        space {
          id
          slug
        }
      }
    }
  `);
</script>

<header
  class="relative sticky top-0 z-10 border-b border-gray-200 bg-white px-5 sm:px-10 h-15.25 flex center h-54px sm:h-65px"
>
  <nav class="w-full max-w-300">
    <section class="flex items-center justify-between">
      <Link class="mr-3.5 flex items-center gap-2 sm:mr-4 transition w-fit" href="/">
        <Logo class="<sm:square-14px sm:square-21px" />
        <Wordmark class="h-12px sm:h-19px" />
      </Link>

      <div class="flex flex-1 items-center justify-between <sm:hidden">
        <SearchBar class="flex-1 max-w-80 <sm:focus-within:max-w-full peer" />

        <div class="flex items-center gap-5 relative">
          {#if $query.me}
            <Button
              class="flex items-center gap-1 text-14-sb! text-gray-700 <sm:hidden"
              size="sm"
              type="button"
              variant="outline"
              on:click={async () => {
                const { permalink } = await createPost({ spaceId: undefined });
                mixpanel.track('post:create', { via: 'feed' });
                await goto(`/editor/${permalink}`);
              }}
            >
              <i class="i-tb-plus square-5 block" />
              포스트 작성
            </Button>
            <NotificationMenu $user={$query.me} />
            <UserMenu $user={$query.me} />
          {:else}
            <Button href="/login" size="md" type="link">펜슬과 함께하기</Button>
          {/if}
        </div>
      </div>

      <div class="flex items-center gap-12px">
        <button class="i-tb-share-2 square-24px text-gray-500" type="button" />

        <button
          class={clsx(
            'square-24px',
            $query.post.bookmarkGroups.length > 0
              ? 'i-tb-bookmark-filled bg-teal-500'
              : 'i-tb-bookmark text-gray-500 transition hover:text-teal-400',
          )}
          type="button"
          on:click={async () => {
            if ($query.post.bookmarkGroups.length > 0) {
              await unbookmarkPost({ bookmarkId: $query.post.bookmarkGroups[0].id, postId: $query.post.id });
              mixpanel.track('post:unbookmark', { postId: $query.post.id, via: 'post' });
            } else {
              if (!$query.me) {
                loginRequireOpen = true;
                return;
              }

              await bookmarkPost({ postId: $query.post.id });
              mixpanel.track('post:bookmark', { postId: $query.post.id, via: 'post' });
            }
          }}
        />

        <Menu placement="bottom-end">
          <i slot="value" class="i-tb-dots-vertical square-24px text-gray-500" />

          {#if $query.post.space?.meAsMember}
            <MenuItem href={`/editor/${$query.post.permalink}`} type="link">수정하기</MenuItem>
            <MenuItem
              on:click={() => {
                openDeletePostWarning = true;
              }}
            >
              삭제하기
            </MenuItem>
          {:else}
            <MenuItem
              on:click={async () => {
                if (!$query.post.space) return;

                if ($query.post.space.muted) {
                  await unmuteSpace({ spaceId: $query.post.space.id });
                  mixpanel.track('space:unmute', { spaceId: $query.post.space.id, via: 'post' });
                } else {
                  if (!$query.me) {
                    loginRequireOpen = true;
                    return;
                  }

                  await muteSpace({ spaceId: $query.post.space.id });
                  mixpanel.track('space:mute', { spaceId: $query.post.space.id, via: 'post' });
                }
              }}
            >
              {#if $query.post.space?.muted}
                스페이스 숨기기 해제
              {:else}
                스페이스 숨기기
              {/if}
            </MenuItem>
          {/if}
        </Menu>
      </div>
    </section>
  </nav>
</header>

<LoginRequireModal bind:open={loginRequireOpen} />

<Modal size="sm" bind:open={openDeletePostWarning}>
  <svelte:fragment slot="title">정말 포스트를 삭제하시겠어요?</svelte:fragment>

  <div slot="action" class="flex gap-2 w-full [&>button]:grow">
    <Button color="secondary" size="md" on:click={() => (openDeletePostWarning = false)}>취소</Button>
    <Button
      size="md"
      on:click={async () => {
        await goto(`/${$query.post.space?.slug}`);
        await deletePost({ postId: $query.post.id });
        mixpanel.track('post:delete', { postId: $query.post.id, via: 'post' });
        toast.success('포스트를 삭제했어요');
      }}
    >
      삭제
    </Button>
  </div>
</Modal>
