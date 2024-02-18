<script lang="ts">
  import { Link } from '@penxle/ui';
  import clsx from 'clsx';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Logo from '$assets/icons/logo.svg?component';
  import PenFancy from '$assets/icons/pen-fancy.svg?component';
  import Wordmark from '$assets/icons/wordmark.svg?component';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal } from '$lib/components';
  import GotoSpaceModal from './GotoSpaceModal.svelte';
  import Notification from './Notification.svelte';
  import SearchBar from './SearchBar.svelte';
  import SideBar from './SideBar.svelte';
  import UserMenu from './UserMenu.svelte';
  import type { DefaultLayout_Header_query } from '$glitch';

  let _query: DefaultLayout_Header_query;
  export { _query as $query };

  let sideBarOpen = false;
  let openGotoSpace = false;
  let comingSoonOpen = false;

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

          ...DefaultLayout_GotoSpaceModal_user
          ...DefaultLayout_UserMenu_user
          ...DefaultLayout_Notification_user
        }
      }
    `),
  );

  const createPost = graphql(`
    mutation DefaultLayout_CreatePost_Mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        permalink
      }
    }
  `);

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

      <div class="flex flex-1 items-center justify-between">
        <SearchBar class="flex-1 max-w-80 <sm:focus-within:max-w-full peer" />

        <div class="flex sm:hidden grow-0 peer-focus-within:hidden">
          {#if $query.me}
            <Notification $user={$query.me} />
          {/if}
          <div class={clsx('flex center square-10')}>
            <button type="button" on:click={() => (sideBarOpen = true)}>
              <i class="i-lc-menu square-6" />
            </button>
          </div>
        </div>

        <div class="flex items-center <sm:hidden relative">
          {#if $query.me}
            <button
              class="relative flex items-center gap-2 rounded-lg py-1 pr-2 pl-1 transition hover:bg-surface-primary <sm:hidden"
              type="button"
              on:click={async () => {
                const { permalink } = await createPost({ spaceId: undefined });
                mixpanel.track('post:create', { via: 'feed' });
                await goto(`/editor/${permalink}`);
              }}
            >
              <PenFancy class="square-8 mb-1" />
              <span class="subtitle-17-b text-gray-70">포스트 작성하기</span>
            </button>
            <Notification $user={$query.me} />
            <UserMenu $user={$query.me} />
          {:else}
            <Button href="/login" size="md" type="link">펜슬과 함께하기</Button>
          {/if}
        </div>
      </div>
    </section>
  </nav>
</header>

<SideBar bind:open={sideBarOpen}>
  {#if $query.me}
    <div class="my-4 px-3">
      <p class="font-extrabold text-2xl break-all mt-1 mb-2">
        <mark class="inline-block leading-0 border-b-10">{$query.me.profile.name}님</mark>
      </p>
      <p class="text-lg font-semibold text-secondary mb-4">{$query.me.email}</p>
      <Button
        class="w-full"
        size="xl"
        on:click={async () => {
          const { permalink } = await createPost({ spaceId: undefined });
          mixpanel.track('post:create', { via: 'feed' });
          await goto(`/editor/${permalink}`);
        }}
      >
        새 포스트 작성하기
      </Button>
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
          $page.url.pathname === '/point/purchase' && 'bg-primary text-primary',
        )}
        href="/point/purchase"
      >
        포인트
      </a>
      <button
        class="flex items-center w-full inline-block px-4 py-3 h-15 font-bold rounded-2 transition hover:bg-primary text-disabled"
        type="button"
        on:click={() => {
          sideBarOpen = false;
          openGotoSpace = true;
        }}
      >
        스페이스
      </button>
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
  {/if}
</SideBar>

{#if $query.me}
  <GotoSpaceModal $user={$query.me} bind:open={openGotoSpace} />
{/if}

<Modal size="sm" bind:open={comingSoonOpen}>
  <svelte:fragment slot="title">준비중인 기능이에요</svelte:fragment>
  <svelte:fragment slot="subtitle">모바일 에디터는 아직 준비 중이에요. 조금만 기다려주세요!</svelte:fragment>

  <Button slot="action" class="w-full" size="xl" on:click={() => (comingSoonOpen = false)}>닫기</Button>
</Modal>
