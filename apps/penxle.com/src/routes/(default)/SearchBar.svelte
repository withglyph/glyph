<script lang="ts">
  import clsx from 'clsx';
  import qs from 'query-string';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';

  let _class: string | undefined = undefined;
  export { _class as class };

  let value: string;
  if ($page.url.pathname === '/search') {
    value = $page.url.searchParams.get('q') ?? '';
  }

  afterNavigate(({ from, to }) => {
    if (from?.url.pathname === '/search' && to?.url.pathname !== '/search') {
      value = '';
    }
  });
</script>

<form
  class={clsx('relative w-full mr-4 h-10 ', _class)}
  on:submit|preventDefault={async () => {
    await goto(qs.stringifyUrl({ url: '/search', query: { q: value } }));
  }}
>
  <input
    class="transition-width ease-in-out rounded-9 bg-primary py-2 pl-11 pr-4 text-sm border border-bg-primary focus-within:border-primary next:focus:text-icon-primary h-10 <sm:(w-full max-w-80) sm:(w-80 focus-within:w-full!)"
    placeholder="#검색어를 입력해 태그를 검색해 보세요"
    type="text"
    bind:value
  />
  <div class="absolute inset-y-0 left-4 flex center text-secondary">
    <span class="i-lc-search square-5 transition" />
  </div>
</form>
