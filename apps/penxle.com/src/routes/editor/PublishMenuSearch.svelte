<script lang="ts">
  import { outsideClickEvent } from '$lib/svelte/actions';

  export let query = '';
  export let placeholder: string | undefined = undefined;
  export let onClick: (q: string) => void;

  let open = false;
</script>

<form class="relative" on:submit|preventDefault on:outsideClick={() => (open = false)} use:outsideClickEvent>
  <input
    class="rounded-1.5 bg-gray-50 py-2.5 pl-4 pr-11 text-14-r border border-gray-200 w-full"
    {placeholder}
    type="search"
    on:input={() => (open = true)}
    bind:value={query}
  />
  <div class="absolute inset-y-0 right-4 flex center text-gray-700">
    <i class="i-tb-search square-4" />
  </div>

  {#if open}
    <ul class="absolute left-0 w-full bg-white border border-gray-200 rounded-b-1.5 z-1">
      <li class="hover:bg-gray-100 last-of-type:rounded-b-1.5">
        <button
          class="py-2 px-1.5 w-full"
          type="button"
          on:click={onClick('검색 결과')}
          on:click={() => {
            open = false;
            query = '';
          }}
        >
          <i class="i-tb-search square-3 text-gray-400 m-1.5" />
          <span class="text-12-r">검색 결과</span>
        </button>
      </li>
    </ul>
  {/if}
</form>
