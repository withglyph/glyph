<script lang="ts">
  import Wordmark from '$assets/branding/wordmark.svg?component';
  import { fragment, graphql } from '$houdini';
  import { refreshAll } from '$lib/houdini';
  import type { AppLayout_Header_query } from '$houdini';

  let _query: AppLayout_Header_query;
  export { _query as $query };

  $: query = fragment(
    _query,
    graphql(/* GraphQL */ `
      fragment AppLayout_Header_query on Query {
        me {
          name
        }
      }
    `)
  );

  const logout = graphql(/* GraphQL */ `
    mutation AppLayout_Header_Logout_Mutation {
      logout
    }
  `);

  const handleLogout = async () => {
    await logout.mutate(null);
    await refreshAll();
  };
</script>

<header class="relative sticky top-0 bg-black px-4">
  <nav class="mx-auto h-16 max-w-screen-lg flex items-center">
    <a href="/">
      <Wordmark class="h-7 text-white" />
    </a>
    <div class="grow" />
    {#if $query.me}
      <div class="text-sm font-medium text-white">{$query.me.name}</div>
      <div class="mx-6 h-6 border-x border-x-gray-700" />
      <div class="flex items-center gap-5">
        <div class="i-lc-heart square-5 text-white" />
        <div class="i-lc-bell square-5 text-white" />
      </div>
      <button type="button" on:click={handleLogout}>
        <img
          class="ml-6 square-8 rounded-full"
          src="https://picsum.photos/512/512"
        />
      </button>
    {:else}
      <a
        class="border-2 border-white rounded-full px-5 py-2 text-2xs font-extrabold tracking-widest uppercase text-white transition duration-300 hover:(bg-white text-black)"
        href="/user/login"
      >
        Login
      </a>
    {/if}
  </nav>
  <div
    class="absolute inset-x-0 bottom-0 h-1.25 from-pink-400 via-sky-400 to-indigo-400 bg-gradient-to-r"
  />
</header>
