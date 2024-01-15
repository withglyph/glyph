<script lang="ts">
  import clsx from 'clsx';
  import qs from 'query-string';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';

  let _class: string | undefined = undefined;
  export { _class as class };

  let value = ($page.url.pathname === '/search' && $page.url.searchParams.get('q')) || '';

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
</script>

<form
  class={clsx('relative', _class)}
  on:submit|preventDefault={async () => {
    await goto(qs.stringifyUrl({ url: '/search', query: { q: value } }));
  }}
>
  <input
    class="transition-all rounded-9 bg-primary py-2 pl-11 pr-4 text-sm border border-bg-primary focus-within:border-primary next:focus:text-icon-primary w-full"
    placeholder="검색어를 입력하세요"
    type="search"
    bind:value
  />
  <div class="absolute inset-y-0 left-4 flex center text-secondary">
    <i class="i-lc-search square-5 transition" />
  </div>
</form>
