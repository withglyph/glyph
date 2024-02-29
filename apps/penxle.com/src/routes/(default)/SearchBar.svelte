<script lang="ts">
  import clsx from 'clsx';
  import qs from 'query-string';
  import { onMount } from 'svelte';
  import IconSearch from '~icons/tabler/search';
  import IconX from '~icons/tabler/x';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Icon } from '$lib/components';

  let _class: string | undefined = undefined;
  export { _class as class };

  let value = ($page.url.pathname === '/search' && $page.url.searchParams.get('q')) || '';

  let open = false;

  afterNavigate(({ from, to }) => {
    if (!from || !to) return;

    const fromStartsWithSearch = from.url.pathname.startsWith('/search');
    const toStartsWithSearch = to.url.pathname.startsWith('/search');

    if (!fromStartsWithSearch && toStartsWithSearch) {
      value = to.url.searchParams.get('q') ?? '';
      return;
    }

    if (fromStartsWithSearch && !toStartsWithSearch) {
      value = '';
    }
  });

  onMount(() => {
    if (window.innerWidth >= 800) {
      open = true;
    }
  });
</script>

{#if open}
  <form
    class={clsx('relative <sm:(absolute left-0 right-0 top-0 max-w-full z-100)', _class)}
    on:submit|preventDefault={async () => {
      await goto(qs.stringifyUrl({ url: '/search', query: { q: value } }));
    }}
  >
    <input
      class="transition-all rounded bg-gray-100 py-2.5 pr-17 pl-3 text-14-r h-41px <sm:h-56px focus-within:(ring ring-teal-500 bg-white) next:focus:text-icon-primary w-full <sm:h-45px"
      placeholder="검색어를 입력하세요"
      type="search"
      bind:value
    />

    <button class="absolute inset-y-0 right-3 flex center text-gray-400" type="submit">
      <Icon class="square-5 transition" icon={IconSearch} />
    </button>

    <button
      class="absolute inset-y-0 right-10 flex center text-gray-400 sm:hidden"
      type="button"
      on:click={() => (open = false)}
    >
      <Icon class="square-5 transition" icon={IconX} />
    </button>
  </form>
{:else}
  <button type="button" on:click={() => (open = true)}>
    <Icon class="square-5 text-gray-400" icon={IconSearch} />
  </button>
{/if}
