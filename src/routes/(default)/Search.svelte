<script lang="ts">
  import qs from 'query-string';
  import { goto } from '$app/navigation';

  let value: string;
</script>

<div class="group relative">
  <input
    class="w-64 rounded-full bg-gray-100 py-2 pl-10 pr-4 text-sm"
    placeholder="키워드 또는 창작자를 검색해보세요."
    type="text"
    bind:value
    on:keydown={async (e) => {
      if (e.key === 'Enter') {
        await goto(qs.stringifyUrl({ url: '/search', query: { q: value } }));
      }
    }}
  />
  <div class="absolute inset-y-0 left-4 flex center">
    <span
      class="i-lc-search square-4 text-gray-300 transition group-hover:text-gray-400"
    />
  </div>
</div>
