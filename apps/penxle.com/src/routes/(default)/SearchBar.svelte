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
    class="transition-all rounded bg-primary py-3 pr-10 pl-3 text-14-m h-45px border border-bg-primary focus-within:border-primary next:focus:text-icon-primary w-full"
    placeholder="검색어를 입력하세요"
    type="search"
    bind:value
  />
  <div class="absolute inset-y-0 right-3 flex center text-gray-400">
    <i class="i-tb-search square-5 transition" />
  </div>
</form>
