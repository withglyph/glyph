<script lang="ts">
  import qs from 'query-string';
  import { goto } from '$app/navigation';

  let value: string;
</script>

<div class="relative">
  <input
    class="w-64 rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm next:focus:text-gray-500"
    placeholder="펜슬 검색하기"
    type="text"
    bind:value
    on:keydown={async (e) => {
      if (e.key === 'Enter') {
        await goto(qs.stringifyUrl({ url: '/search', query: { q: value } }));
      }
    }}
  />
  <div class="absolute inset-y-0 left-4 flex center text-gray-300">
    <span class="i-lc-search square-4 transition" />
  </div>
</div>
