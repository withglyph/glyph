<script lang="ts">
  import Wordmark from '$assets/branding/wordmark.svg?component';
  import { fragment, graphql } from '$houdini';
  import { Logo } from '$lib/components/branding';
  import PublishMenu from './PublishMenu.svelte';
  import SearchBar from './SearchBar.svelte';
  import UserMenu from './UserMenu.svelte';
  import type { DefaultLayout_Header_query } from '$houdini';

  export let _query: DefaultLayout_Header_query;

  $: query = fragment(
    _query,
    graphql(`
      fragment DefaultLayout_Header_query on Query {
        meOrNull {
          ...DefaultLayout_UserMenu_user
          ...DefaultLayout_PublishMenu_user
        }
      }
    `),
  );
</script>

<header class="relative sticky top-0 z-10 border-b bg-white px-8">
  <nav>
    <section class="h-16 flex items-center">
      <Logo class="mr-2 square-6" />
      <Wordmark class="mr-4 h-5" />

      <SearchBar />

      <div class="grow" />

      {#if $query.meOrNull}
        <div class="ml-8 flex items-center gap-8">
          <div class="i-lc-heart square-5 text-gray-50" />
          <div class="i-lc-bell square-5 text-gray-50" />
          <UserMenu _user={$query.meOrNull} />
          <PublishMenu _user={$query.meOrNull} />
        </div>
      {:else}
        <a
          class="ml-4 rounded px-4 py-2 font-semibold transition duration-300 hover:bg-gray-20"
          href="/login"
        >
          로그인
        </a>
        <a
          class="rounded px-4 py-2 font-semibold text-brand-50 transition duration-300 hover:bg-gray-20"
          href="/signup"
        >
          새 계정 만들기
        </a>
      {/if}
    </section>
  </nav>
</header>
