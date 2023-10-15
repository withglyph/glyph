<script lang="ts">
  import clsx from 'clsx';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Avatar, BottomSheet, Button } from '$lib/components';
  import { pageSubTitle } from '$lib/stores';
  import Footer from '../../Footer.svelte';
  import Header from '../../Header.svelte';
  import SpaceListMenu from './SpaceListMenu.svelte';

  let open = false;

  $: query = graphql(`
    query SpaceSettingsLayout_Query($slug: String!) {
      ...DefaultLayout_Header_query

      me {
        id
        ...SpaceSettingLayout_SpaceListMenu_user
      }

      space(slug: $slug) {
        id
        slug
        name

        meAsMember {
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

<main class="flex flex-col justify-center sm:flex-row">
  <button class="flex items-center justify-between p-4 sm:hidden" type="button" on:click={() => (open = true)}>
    <h2 class="title-20-eb">{$pageSubTitle}</h2>
    <span class="i-lc-chevron-down square-6" />
  </button>

  <aside class="grow pr-4 flex flex-col items-end <sm:hidden w-52">
    <div class="w-full max-w-52">
      <h1 class="font-extrabold mt-10">스페이스 관리</h1>

      <div class="space-y-3 my-5.5">
        {#if $query.me}
          <SpaceListMenu $user={$query.me} currentSpace={$query.space.name} />
        {/if}

        <div class="py-2.5 px-2 flex items-center justify-between">
          {#if $query.space.meAsMember}
            <div class="flex items-center truncate">
              <Avatar class="square-6! mr-3 grow-0 shrink-0 text-nowrap" $profile={$query.space.meAsMember.profile} />
              <span class="body-14-b truncate grow">{$query.space.meAsMember.profile.name}</span>
            </div>
            <button class="text-secondary caption-12-m text-nowrap" type="button">수정</button>
          {/if}
        </div>

        <Button
          class="w-full"
          color="tertiary"
          href={`/${$query.space.slug}/publish/post`}
          size="xl"
          type="link"
          variant="outlined"
        >
          새 포스트 작성하기
        </Button>
      </div>

      <nav class="w-full mb-10">
        <ul class="body-16-b text-disabled">
          <li>
            <a
              class={clsx(
                'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
                $page.url.pathname === `/${$query.space.slug}/dashboard` && 'bg-primary text-primary',
              )}
              href="/{$query.space.slug}/dashboard"
            >
              <span class="i-lc-home square-5" />
              대시보드
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
                $page.url.pathname === `/${$query.space.slug}/members` && 'bg-primary text-primary',
              )}
              href="/{$query.space.slug}/members"
            >
              <span class="i-lc-user square-5" />
              멤버 관리
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
                $page.url.pathname === `/${$query.space.slug}/posts` && 'bg-primary text-primary',
              )}
              href="/{$query.space.slug}/posts"
            >
              <span class="i-lc-file-text square-5" />
              포스트 관리
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
                $page.url.pathname === `/${$query.space.slug}/subscribers` && 'bg-primary text-primary',
              )}
              href="/{$query.space.slug}/subscribers"
            >
              <span class="i-lc-users square-5" />
              독자 관리
            </a>
          </li>
          <li>
            <a
              class={clsx(
                'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
                $page.url.pathname === `/${$query.space.slug}/settings` && 'bg-primary text-primary',
              )}
              href="/{$query.space.slug}/settings"
            >
              <span class="i-lc-settings square-5" />
              스페이스 설정
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </aside>

  <div class="bg-primary grow-2 py-5 px-4 sm:(py-10 px-11)">
    <slot />
  </div>
</main>

<Footer />

<BottomSheet bind:open>
  <div class="flex w-full gap-2 items-center">
    <div class="i-px-logo square-6 rounded-lg" />
    <span class="font-extrabold">스페이스 관리</span>
  </div>

  <div class="w-full border-b border-alphagray-10 my-2" />

  <div class="bg-primary py-2 px-3 rounded-lg flex items-center justify-between mb-3">
    <div class="flex items-center gap-3">
      <div class="bg-black square-12 rounded-xl" />
      <div>
        <p class="body-15-b mb-1">{$query.space.name}</p>
        <div class="flex items-center gap-1 caption-12-m text-secondary">
          <span class="block square-1.25 rounded-full bg-green-50" />
          <span>공개중</span>
        </div>
      </div>
    </div>

    <a
      class="py-1.5 px-3 rounded-12 bg-gray-80 text-gray-5 body-13-m text-nowrap"
      href={`/${$query.space.slug}/publish/post`}
    >
      포스트 작성하기
    </a>
  </div>

  <div class="py-2.5 px-3 flex items-center justify-between">
    {#if $query.space.meAsMember}
      <div class="flex items-center truncate">
        <Avatar class="square-6! mr-3 grow-0 shrink-0 text-nowrap" $profile={$query.space.meAsMember.profile} />
        <span class="body-14-b truncate grow">{$query.space.meAsMember.profile.name}</span>
      </div>
      <button class="text-secondary caption-12-m text-nowrap" type="button">수정</button>
    {/if}
  </div>

  <div class="w-full border-b border-alphagray-10 my-2" />

  <nav class="w-full">
    <ul class="body-16-b text-disabled">
      <li>
        <a
          class={clsx(
            'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
            $page.url.pathname === `/${$query.space.slug}/dashboard` && 'bg-primary text-primary',
          )}
          href="/{$query.space.slug}/dashboard"
        >
          <span class="i-lc-home square-5" />
          대시보드
        </a>
      </li>
      <li>
        <a
          class={clsx(
            'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
            $page.url.pathname === `/${$query.space.slug}/members` && 'bg-primary text-primary',
          )}
          href="/{$query.space.slug}/members"
        >
          <span class="i-lc-user square-5" />
          멤버 관리
        </a>
      </li>
      <li>
        <a
          class={clsx(
            'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
            $page.url.pathname === `/${$query.space.slug}/posts` && 'bg-primary text-primary',
          )}
          href="/{$query.space.slug}/posts"
        >
          <span class="i-lc-file-text square-5" />
          포스트 관리
        </a>
      </li>
      <li>
        <a
          class={clsx(
            'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
            $page.url.pathname === `/${$query.space.slug}/subscribers` && 'bg-primary text-primary',
          )}
          href="/{$query.space.slug}/subscribers"
        >
          <span class="i-lc-users square-5" />
          독자 관리
        </a>
      </li>
      <li>
        <a
          class={clsx(
            'px-2 py-6.5 inline-block w-full flex items-center gap-3 rounded-2xl hover:(bg-primary text-primary)',
            $page.url.pathname === `/${$query.space.slug}/settings` && 'bg-primary text-primary',
          )}
          href="/{$query.space.slug}/settings"
        >
          <span class="i-lc-settings square-5" />
          스페이스 설정
        </a>
      </li>
    </ul>
  </nav>
</BottomSheet>
