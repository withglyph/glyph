<script lang="ts">
  import { Link } from '@penxle/ui';
  import clsx from 'clsx';
  import { fade, fly } from 'svelte/transition';
  import { afterNavigate, goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, Image } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { portal, scrollLock } from '$lib/svelte/actions';
  import CreateSpaceModal from './CreateSpaceModal.svelte';
  import type { DefaultLayout_UserMenu_user } from '$glitch';

  let _user: DefaultLayout_UserMenu_user;
  export { _user as $user };

  let open = false;
  let spaceListOpen = true;
  let createSpaceOpen = false;

  $: user = fragment(
    _user,
    graphql(`
      fragment DefaultLayout_UserMenu_user on User {
        id
        email

        profile {
          id
          name
          ...Avatar_profile
        }

        spaces {
          id
          slug
          name

          icon {
            id
            ...Image_image
          }

          meAsMember @_required {
            id

            profile {
              id
              name
              ...Avatar_profile
            }
          }
        }

        ...CreateSpaceModal_user
      }
    `),
  );

  const createPost = graphql(`
    mutation DefaultLayout_UserMenuCreatePost_Mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        permalink
      }
    }
  `);

  const logoutUser = graphql(`
    mutation DefaultLayout_UserMenu_LogoutUser_Mutation {
      logoutUser
    }
  `);

  afterNavigate(() => {
    open = false;
  });
</script>

<button
  class="flex center border border-gray-200 rounded-full"
  tabindex="-1"
  type="button"
  on:click={() => (open = true)}
>
  <Avatar class="square-8" $profile={$user.profile} />
</button>

{#if open}
  <div class="fixed inset-0 z-50" use:portal>
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur"
      role="button"
      tabindex="-1"
      on:click={() => (open = false)}
      on:keypress={null}
      transition:fade={{ duration: 150 }}
    />

    <div class={clsx('pointer-events-none absolute flex justify-end top-0 bottom-0 right-0 w-75')}>
      <div
        class={clsx('pointer-events-auto max-h-full flex flex-col bg-white shadow-xl w-270px sm:w-320px')}
        use:scrollLock
        in:fly={{ x: '10%', duration: 150 }}
        out:fade={{ duration: 150 }}
      >
        <div class="overflow-x-hidden">
          {#if $user}
            <div class="flex items-center gap-1.5 justify-between px-4 py-4.5 border-b border-gray-200">
              <div class="flex items-center gap-1.5">
                <Avatar class="square-8 border border-gray-200" $profile={$user.profile} />
                <div class="truncate">
                  <p class="text-14-m truncate">
                    <span class="truncate">{$user.profile.name}</span>
                    <span>님</span>
                  </p>
                  <p class="text-10-r text-gray-400">{$user.email}</p>
                </div>
              </div>
              <Button class="whitespace-nowrap" href="/me/settings" size="sm" type="link" variant="outline">
                계정 설정
              </Button>
            </div>

            <button
              class="flex items-center justify-between p-4 border-b border-gray-200 w-full"
              type="button"
              on:click={() => {
                spaceListOpen = !spaceListOpen;
              }}
            >
              <p class="text-14-m text-gray-800">내 스페이스</p>

              <i class={clsx('i-tb-chevron-down square-5 text-gray-400', spaceListOpen && 'i-tb-chevron-up')} />
            </button>

            {#if spaceListOpen}
              <ul>
                {#each $user.spaces as space (space.id)}
                  <li class="flex items-center justify-between gap-1.5 bg-gray-50 border-b border-gray-100 px-4 py-3">
                    <a class="flex items-center gap-3 truncate" href="/{space.slug}">
                      <div class="relative flex-none">
                        <Image class="flex-none square-5.5 rounded-3px border border-gray-100" $image={space.icon} />
                        <Avatar
                          class="absolute square-4.5 -right-6px -bottom-4px"
                          $profile={space.meAsMember.profile}
                        />
                      </div>

                      <div class="truncate">
                        <p class="text-12-m text-gray-800 truncate">{space.name}</p>
                        <p class="text-11-r text-gray-400 truncate">by {space.meAsMember.profile.name}</p>
                      </div>
                    </a>

                    <div class="flex items-center gap-5">
                      <button
                        class="i-tb-pencil square-5 text-gray-400 sm:hidden"
                        type="button"
                        on:click={async () => {
                          const { permalink } = await createPost({ spaceId: space.id });
                          mixpanel.track('post:create', { via: 'user-menu' });
                          await goto(`/editor/${permalink}`);
                        }}
                      />

                      <a href="/{space.slug}/dashboard/settings">
                        <i class="i-tb-settings square-5 text-gray-400" />
                      </a>
                    </div>
                  </li>
                {/each}
                <li class="bg-gray-50 border-b border-gray-100">
                  <button
                    class="flex items-center gap-1.5 text-12-m text-gray-500 px-4 py-3"
                    type="button"
                    on:click={() => (createSpaceOpen = true)}
                  >
                    <i class="i-tb-plus square-5 text-gray-400" />
                    스페이스 만들기
                  </button>
                </li>
              </ul>
            {/if}

            <a class="p-4 border-b border-gray-200 text-14-m text-gray-800 inline-block w-full" href="/point">포인트</a>
            <Link
              class="p-4 border-b border-gray-200 text-14-m text-gray-800 inline-block w-full"
              href="https://penxle.nolt.io"
            >
              펜슬 피드백하기
            </Link>
            <button
              class="p-4 text-14-m text-gray-800 w-full"
              type="button"
              on:click={async () => {
                await logoutUser();
                mixpanel.track('user:logout');
                mixpanel.reset();
                location.href = '/';
              }}
            >
              로그아웃
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<CreateSpaceModal {$user} bind:open={createSpaceOpen} />
