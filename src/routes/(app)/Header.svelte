<script lang="ts">
  import clsx from 'clsx';
  import { page } from '$app/stores';
  import Wordmark from '$assets/branding/wordmark-colored.svg?component';
  import { fragment, graphql } from '$houdini';
  import UserMenu from './UserMenu.svelte';
  import type { AppLayout_Header_query } from '$houdini';

  let _query: AppLayout_Header_query;
  export { _query as $query };

  $: query = fragment(
    _query,
    graphql(/* GraphQL */ `
      fragment AppLayout_Header_query on Query {
        me {
          ...AppLayout_UserMenu_profile
        }
      }
    `)
  );

  $: isArtworks = $page.url.pathname.startsWith('/artworks');
  $: isPosts = $page.url.pathname.startsWith('/posts');
</script>

<header class="relative sticky top-0 border-b bg-white px-4">
  <nav class="mx-auto max-w-screen-lg">
    <section class="h-16 flex items-center">
      <a href="/">
        <Wordmark class="h-6" />
      </a>
      {#if isArtworks}
        <div class="mx-4 h-6 border-x" />
        <div class="text-lg font-medium">아트</div>
      {/if}
      {#if isPosts}
        <div class="mx-4 h-6 border-x" />
        <div class="text-lg font-medium">포스트</div>
      {/if}

      <div class="grow" />

      {#if $query.me}
        <div class="mx-6 h-6 border-x border-x-gray-300" />
        <div class="flex items-center gap-5">
          <div class="i-lc-heart square-5" />
          <div class="i-lc-bell square-5" />
        </div>
        <div class="ml-6">
          <UserMenu $profile={$query.me} />
        </div>
      {:else}
        <a
          class="rounded px-4 py-2 font-semibold transition duration-300 hover:bg-gray-200"
          href="/user/login"
        >
          로그인
        </a>
        <a
          class="rounded px-4 py-2 font-semibold text-brand-500 transition duration-300 hover:bg-gray-200"
          href="/user/signup"
        >
          새 계정 만들기
        </a>
      {/if}
    </section>

    <section class="h-16 w-full flex items-center gap-6">
      <a
        class={clsx(
          'text-xl font-semibold transition',
          isArtworks || isPosts ? 'hover:text-gray-500' : 'text-brand-500'
        )}
        href="/"
      >
        전체
      </a>
      <a
        class={clsx(
          'text-xl font-semibold transition',
          isArtworks ? 'text-brand-500' : 'hover:text-gray-500'
        )}
        href="/artworks"
      >
        아트
      </a>
      <a
        class={clsx(
          'text-xl font-semibold transition',
          isPosts ? 'text-brand-500' : 'hover:text-gray-500'
        )}
        href="posts"
      >
        포스트
      </a>
    </section>
  </nav>
</header>

<style lang="scss">
  .menu-item {
    --uno: flex items-center gap-2 justify-stretch rounded m-1 px-2 py-1 text-gray-500 hover:(bg-gray-100 text-gray-700);
  }
</style>
