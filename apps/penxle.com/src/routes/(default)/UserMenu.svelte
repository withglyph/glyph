<script lang="ts">
  import { Link } from '@penxle/ui';
  import clsx from 'clsx';
  import { fade, fly } from 'svelte/transition';
  import IconChevronDown from '~icons/tabler/chevron-down';
  import IconChevronUp from '~icons/tabler/chevron-up';
  import IconPencil from '~icons/tabler/pencil';
  import IconPlus from '~icons/tabler/plus';
  import { afterNavigate, goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, Icon, Image } from '$lib/components';
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

<button class="flex center ring ring-gray-200 rounded-full" tabindex="-1" type="button" on:click={() => (open = true)}>
  <Avatar class="square-9" $profile={$user.profile} />
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

    <div class={clsx('pointer-events-none absolute flex justify-end top-0 bottom-0 right-0 <sm:w-294px sm:w-320px')}>
      <div
        class={clsx(
          'pointer-events-auto max-h-full flex flex-col bg-white shadow-[0px_6px_24px_0px_rgba(0,0,0,0.08)] rounded-lt-3 w-full',
        )}
        use:scrollLock
        in:fly={{ x: '10%', duration: 150 }}
        out:fade={{ duration: 150 }}
      >
        <div class="overflow-x-hidden">
          {#if $user}
            <div class="flex items-center gap-6.5 justify-between px-4 py-4.5 border-b border-gray-100">
              <a class="flex items-center gap-1.5" href="/me/cabinets">
                <Avatar class="square-9 border border-gray-100" $profile={$user.profile} />
                <div class="truncate">
                  <p class="text-14-m truncate">
                    <span class="truncate">{$user.profile.name}</span>
                    <span>님</span>
                  </p>
                  <p class="text-10-r text-gray-500">{$user.email}</p>
                </div>
              </a>
              <Button class="whitespace-nowrap" href="/me/settings" size="xs" type="link" variant="outline">
                계정 설정
              </Button>
            </div>

            <button
              class={clsx(
                'flex items-center justify-between p-4 pr-3.5 border-b w-full',
                spaceListOpen ? 'border-gray-150' : 'border-gray-100',
              )}
              type="button"
              on:click={() => {
                spaceListOpen = !spaceListOpen;
              }}
            >
              <p class="text-14-m text-gray-800">나의 스페이스</p>

              {#if spaceListOpen}
                <Icon class="square-5 text-gray-400" icon={IconChevronUp} />
              {:else}
                <Icon class="square-5 text-gray-400" icon={IconChevronDown} />
              {/if}
            </button>

            {#if spaceListOpen}
              <ul>
                {#each $user.spaces as space (space.id)}
                  <li class="flex items-center justify-between gap-1.5 bg-gray-50 border-b border-gray-150 px-4 py-3">
                    <a class="flex items-center gap-3 truncate" href="/{space.slug}">
                      <div class="relative flex-none">
                        <Image class="flex-none square-6.5 rounded border border-gray-150" $image={space.icon} />
                        <Avatar
                          class="absolute square-4.5 -right-6px -bottom-4px"
                          $profile={space.meAsMember.profile}
                        />
                      </div>

                      <div class="truncate">
                        <p class="text-12-m text-gray-800 truncate">{space.name}</p>
                        <p class="text-12-r text-gray-500 truncate">
                          <span class="text-11-r">by</span>
                          {space.meAsMember.profile.name}
                        </p>
                      </div>
                    </a>

                    <button
                      type="button"
                      on:click={async () => {
                        const { permalink } = await createPost({ spaceId: space.id });
                        mixpanel.track('post:create', { via: 'user-menu' });
                        await goto(`/editor/${permalink}`);
                      }}
                    >
                      <Icon class="square-5 text-gray-500" icon={IconPencil} />
                    </button>
                  </li>
                {/each}
                <li class="bg-gray-100 border-b border-gray-150">
                  <button
                    class="flex items-center gap-1.5 text-14-m text-gray-500 p-4"
                    type="button"
                    on:click={() => (createSpaceOpen = true)}
                  >
                    <Icon class="square-3.5" icon={IconPlus} />
                    스페이스 만들기
                  </button>
                </li>
              </ul>
            {/if}

            <a class="p-4 border-b border-gray-100 text-14-m text-gray-800 inline-block w-full" href="/point">포인트</a>
            <Link
              class="p-4 border-b border-gray-100 text-14-m text-gray-800 inline-block w-full"
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
