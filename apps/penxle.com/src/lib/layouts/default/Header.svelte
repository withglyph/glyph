<script lang="ts">
  import { Link } from '@penxle/ui';
  import clsx from 'clsx';
  import mixpanel from 'mixpanel-browser';
  import { page } from '$app/stores';
  import Logo from '$assets/icons/logo.svg?component';
  import Wordmark from '$assets/icons/wordmark.svg?component';
  import { fragment, graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { outsideClickEvent } from '$lib/svelte/actions';
  import Notification from './Notification.svelte';
  import SearchBar from './SearchBar.svelte';
  import SideBar from './SideBar.svelte';
  import UserMenu from './UserMenu.svelte';
  import type { DefaultLayout_Header_query } from '$glitch';

  let _query: DefaultLayout_Header_query;
  export { _query as $query };

  let isOpen = false;
  let isSideBarOpen = false;

  $: query = fragment(
    _query,
    graphql(`
      fragment DefaultLayout_Header_query on Query {
        me {
          id
          email

          profile {
            id
            name
          }

          ...DefaultLayout_UserMenu_user
          ...DefaultLayout_Notification_user
        }
      }
    `),
  );

  const logoutUser = graphql(`
    mutation DefaultLayout_LogoutUser_Mutation {
      logoutUser
    }
  `);
</script>

<header class="relative sticky top-0 z-10 border-b border-secondary bg-white px-4 py-2 sm:px-7.5 h-15.25 flex center">
  <nav class="w-full max-w-300">
    <section class="flex items-center justify-between">
      <Link class="mr-3.5 flex items-center gap-2 sm:mr-4 transition w-fit" href="/">
        <Logo class="<sm:square-7.5 sm:square-6" />
        <Wordmark class="<sm:hidden h-5.25 color-icon-primary" />
      </Link>

      <div
        class={clsx('flex items-center grow justify-end', isOpen && 'justify-between')}
        on:outsideClick={() => (isOpen = false)}
        use:outsideClickEvent
      >
        <SearchBar class={clsx('<sm:hidden', isOpen && 'block!')} />

        <div class={clsx('flex center square-10 sm:hidden', isOpen && 'hidden!')}>
          <button type="button" on:click={() => (isOpen = true)}>
            <span class="i-lc-search square-6" />
          </button>
        </div>
      </div>

      <div class="flex sm:hidden grow-0">
        <div class={clsx('flex center square-10')}>
          <button type="button" on:click={() => (isSideBarOpen = true)}>
            <span class="i-lc-menu square-6" />
          </button>
        </div>
      </div>

      <div class="flex items-center <sm:hidden relative">
        {#if $query.me}
          <a
            class="relative flex items-center gap-2 rounded-lg py-1 px-2 font-bold text-gray-60 transition hover:bg-surface-primary <lg:hidden"
            href="/editor"
          >
            <span class="i-px-pen-fill square-6 fill-gray-60" />
            <span class="text-sm">포스트 작성하기</span>
          </a>
          <Notification $user={$query.me} />
          <UserMenu $user={$query.me} />
        {:else}
          <Button href="/login" size="md" type="link">펜슬과 함께하기</Button>
        {/if}
      </div>
    </section>
  </nav>
</header>

<SideBar bind:open={isSideBarOpen}>
  {#if $query.me}
    <div class="my-4 px-3">
      <p class="font-extrabold text-2xl break-all mt-1 mb-2">
        <mark class="inline-block leading-0 border-b-10">{$query.me.profile.name}님</mark>
      </p>
      <p class="text-lg font-semibold text-secondary mb-4">{$query.me.email}</p>
      <Button class="w-full" href="/editor" size="xl" type="link">새 포스트 작성하기</Button>
    </div>
    <div class="space-y-1">
      <a
        class={clsx(
          'flex items-center w-full inline-block px-4 py-3 h-15 font-bold rounded-2 transition hover:bg-primary text-disabled',
          $page.url.pathname === '/' && 'bg-primary text-primary',
        )}
        href="/"
      >
        피드
      </a>
      <a
        class={clsx(
          'flex items-center w-full inline-block px-4 py-3 h-15 font-bold rounded-2 transition hover:bg-primary text-disabled',
          $page.url.pathname === '/me' && 'bg-primary text-primary',
        )}
        href="/me"
      >
        나의 펜슬
      </a>
      <a
        class={clsx(
          'flex items-center w-full inline-block px-4 py-3 h-15 font-bold rounded-2 transition hover:bg-primary text-disabled',
          $page.url.pathname === '/#' && 'bg-primary text-primary',
        )}
        href="/#"
      >
        포인트
      </a>
      <a
        class={clsx(
          'flex items-center w-full inline-block px-4 py-3 h-15 font-bold rounded-2 transition hover:bg-primary text-disabled',
          $page.url.pathname === '/#' && 'bg-primary text-primary',
        )}
        href="/#"
      >
        스페이스 설정
      </a>
      <button
        class="flex items-center w-full inline-block px-4 py-3 h-15 font-bold rounded-2 transition hover:bg-primary text-disabled"
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
    </div>
  {:else}
    <a
      class="flex items-center w-full inline-block px-4 py-3 h-15 font-bold rounded-2 transition hover:bg-primary text-disabled"
      href="/login"
    >
      로그인
    </a>
    <a
      class="flex items-center w-full inline-block px-4 py-3 h-15 font-bold rounded-2 transition hover:bg-primary text-disabled"
      href="/signup"
    >
      회원가입
    </a>
  {/if}
</SideBar>
