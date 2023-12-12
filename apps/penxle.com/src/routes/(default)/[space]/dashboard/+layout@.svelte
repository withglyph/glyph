<script lang="ts">
  import clsx from 'clsx';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Avatar, BottomSheet, Button, Image, Tooltip } from '$lib/components';
  import { pageSubTitle } from '$lib/stores';
  import ComingSoonModal from '../../ComingSoonModal.svelte';
  import Footer from '../../Footer.svelte';
  import Header from '../../Header.svelte';
  import SpaceListMenu from './SpaceListMenu.svelte';
  import UpdateSpaceProfileModal from './UpdateSpaceProfileModal.svelte';

  let open = false;
  let updateSpaceProfileOpen = false;
  let comingSoonOpen = false;

  $: query = graphql(`
    query SpaceDashboardLayout_Query($slug: String!) {
      ...DefaultLayout_Header_query
      ...SpaceDashboardLayout_SpaceListMenu_query
      ...SpaceDashboardLayout_UpdateSpaceProfileModal_query

      space(slug: $slug) {
        id
        slug
        name
        visibility

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
    }
  `);
</script>

<Header {$query} />

<main class="flex flex-col justify-center grow sm:flex-row">
  <button class="flex items-center justify-between p-4 sm:hidden" type="button" on:click={() => (open = true)}>
    <h2 class="title-20-eb">{$pageSubTitle}</h2>
    <i class="i-lc-chevron-down square-6" />
  </button>

  <aside class="flex justify-end <sm:hidden max-w-21.1875rem w-full">
    <div class="w-52 p-x-4">
      <h1 class="font-extrabold mt-10">스페이스 관리</h1>

      <div class="space-y-3 my-5.5">
        <SpaceListMenu {$query} />

        <div class="py-2.5 px-2 flex items-center justify-between gap-1">
          {#if $query.space.meAsMember}
            <div class="flex items-center truncate">
              <Avatar class="square-6! mr-3 grow-0 shrink-0 text-nowrap" $profile={$query.space.meAsMember.profile} />
              <span class="body-14-b truncate grow">{$query.space.meAsMember.profile.name}</span>
            </div>
            <button
              class="shrink-0 text-secondary caption-12-m"
              type="button"
              on:click={() => (updateSpaceProfileOpen = true)}
            >
              수정
            </button>
          {/if}
        </div>

        <Button
          class="w-full"
          color="tertiary"
          href={`/editor?space=${$query.space.slug}`}
          size="xl"
          type="link"
          variant="outlined"
        >
          새 포스트 작성하기
        </Button>
      </div>

      <nav class="w-full mb-10">
        <ul class="body-16-b text-disabled space-y-1">
          <li>
            <Tooltip message="준비중인 기능이에요">
              <button
                class={clsx(
                  'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
                  $page.url.pathname === `/${$query.space.slug}/dashboard` && 'bg-primary text-primary',
                )}
                disabled
                type="button"
              >
                <i class="i-lc-home square-5" />
                대시보드
              </button>
            </Tooltip>
          </li>
          <li>
            <button
              class={clsx(
                'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
                $page.url.pathname === `/${$query.space.slug}/dashboard/members` && 'bg-primary text-primary',
              )}
              type="button"
              on:click={() => (comingSoonOpen = true)}
            >
              <i class="i-lc-user square-5" />
              멤버 관리
            </button>
          </li>
          <li>
            <a
              class={clsx(
                'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
                $page.url.pathname === `/${$query.space.slug}/dashboard/posts` && 'bg-primary text-primary',
              )}
              href="/{$query.space.slug}/dashboard/posts"
            >
              <i class="i-lc-file-text square-5" />
              포스트 관리
            </a>
          </li>
          <li>
            <button
              class={clsx(
                'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
                $page.url.pathname === `/${$query.space.slug}/dashboard/subscribers` && 'bg-primary text-primary',
              )}
              type="button"
              on:click={() => (comingSoonOpen = true)}
            >
              <i class="i-lc-users square-5" />
              독자 관리
            </button>
          </li>
          <li>
            <a
              class={clsx(
                'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
                $page.url.pathname === `/${$query.space.slug}/dashboard/settings` && 'bg-primary text-primary',
              )}
              href="/{$query.space.slug}/dashboard/settings"
            >
              <i class="i-lc-settings square-5" />
              스페이스 설정
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </aside>

  <div class="bg-primary flex-1 py-5 px-4 sm:(py-10 px-11) overflow-auto">
    <div class="max-w-218 w-full">
      <slot />
    </div>
  </div>
</main>

<Footer />

<BottomSheet bind:open>
  <div class="flex w-full gap-2 items-center">
    <i class="i-px-logo square-6 rounded-lg" />
    <span class="font-extrabold">스페이스 관리</span>
  </div>

  <div class="w-full border-b border-alphagray-10 my-2" />

  <div class="bg-primary py-2 px-3 rounded-lg flex items-center justify-between mb-3 truncate gap-1">
    <div class="flex items-center gap-3 w-full truncate">
      <Image class="square-12 rounded-xl flex-none" $image={$query.space.icon} />
      <div class="truncate">
        <p class="body-15-b mb-1 truncate">{$query.space.name}</p>
        <div class="flex items-center gap-1 caption-12-m text-secondary">
          {#if $query.space.visibility === 'PUBLIC'}
            <span class="block square-1.25 rounded-full bg-green-50" />
            <span>공개중</span>
          {:else}
            <span class="block square-1.25 rounded-full bg-text-disabled" />
            <span>비공개중</span>
          {/if}
        </div>
      </div>
    </div>

    <a
      class="py-1.5 px-3 rounded-12 bg-gray-80 text-gray-5 body-13-m text-nowrap"
      href={`/editor?space=${$query.space.slug}`}
    >
      포스트 작성하기
    </a>
  </div>

  <div class="py-2.5 px-3 flex items-center justify-between gap-1">
    {#if $query.space.meAsMember}
      <div class="flex items-center truncate">
        <Avatar class="square-6! mr-3 grow-0 shrink-0 text-nowrap" $profile={$query.space.meAsMember.profile} />
        <span class="body-14-b truncate grow">{$query.space.meAsMember.profile.name}</span>
      </div>
      <button
        class="text-secondary caption-12-m text-nowrap"
        type="button"
        on:click={() => (updateSpaceProfileOpen = true)}
      >
        수정
      </button>
    {/if}
  </div>

  <div class="w-full border-b border-alphagray-10 my-2" />

  <nav class="w-full">
    <ul class="body-16-b text-disabled">
      <li>
        <button
          class={clsx(
            'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
            $page.url.pathname === `/${$query.space.slug}/dashboard` && 'bg-primary text-primary',
          )}
          type="button"
          on:click={() => (comingSoonOpen = true)}
        >
          <i class="i-lc-home square-5" />
          대시보드
        </button>
      </li>
      <li>
        <button
          class={clsx(
            'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
            $page.url.pathname === `/${$query.space.slug}/dashboard/members` && 'bg-primary text-primary',
          )}
          type="button"
          on:click={() => (comingSoonOpen = true)}
        >
          <i class="i-lc-user square-5" />
          멤버 관리
        </button>
      </li>
      <li>
        <a
          class={clsx(
            'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
            $page.url.pathname === `/${$query.space.slug}/dashboard/posts` && 'bg-primary text-primary',
          )}
          href="/{$query.space.slug}/dashboard/posts"
        >
          <i class="i-lc-file-text square-5" />
          포스트 관리
        </a>
      </li>
      <li>
        <button
          class={clsx(
            'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
            $page.url.pathname === `/${$query.space.slug}/dashboard/subscribers` && 'bg-primary text-primary',
          )}
          type="button"
          on:click={() => (comingSoonOpen = true)}
        >
          <i class="i-lc-users square-5" />
          독자 관리
        </button>
      </li>
      <li>
        <a
          class={clsx(
            'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
            $page.url.pathname === `/${$query.space.slug}/dashboard/settings` && 'bg-primary text-primary',
          )}
          href="/{$query.space.slug}/dashboard/settings"
        >
          <i class="i-lc-settings square-5" />
          스페이스 설정
        </a>
      </li>
    </ul>
  </nav>
</BottomSheet>

<UpdateSpaceProfileModal {$query} bind:open={updateSpaceProfileOpen} />
<ComingSoonModal bind:open={comingSoonOpen} />
