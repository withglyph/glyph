<script lang="ts">
  import Logo from '$assets/branding/logo.svg?component';
  import { fragment, graphql } from '$houdini';
  import CreateEntityMenu from './CreateEntityMenu.svelte';
  import SearchBar from './SearchBar.svelte';
  import UserMenu from './UserMenu.svelte';
  import type { DefaultLayout_Header_query } from '$houdini';

  let _query: DefaultLayout_Header_query;
  export { _query as $query };

  $: query = fragment(
    _query,
    graphql(`
      fragment DefaultLayout_Header_query on Query {
        meOrNull {
          ...DefaultLayout_UserMenu_profile
          ...DefaultLayout_CreateEntityMenu_profile
        }
      }
    `)
  );
</script>

<header class="relative sticky top-0 z-10 border-b bg-white px-8">
  <nav>
    <section class="h-16 flex items-center">
      <a class="mr-4 flex-none" href="/">
        <Logo class="square-8 rounded text-gray-900" />
      </a>

      <SearchBar />

      <div class="grow" />

      {#if $query.meOrNull}
        <div class="ml-8 flex items-center gap-8">
          <div class="i-lc-heart square-5 text-gray-500" />
          <div class="i-lc-bell square-5 text-gray-500" />
          <UserMenu $profile={$query.meOrNull} />
          <CreateEntityMenu $profile={$query.meOrNull} />
        </div>
      {:else}
        <a
          class="ml-4 rounded px-4 py-2 font-semibold transition duration-300 hover:bg-gray-200"
          href="/_/login"
        >
          로그인
        </a>
        <a
          class="rounded px-4 py-2 font-semibold text-brand-500 transition duration-300 hover:bg-gray-200"
          href="/_/signup"
        >
          새 계정 만들기
        </a>
      {/if}
    </section>

    <!-- <section class="h-16 w-full flex items-center gap-6">
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
    </section> -->
  </nav>
</header>
