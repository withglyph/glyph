<script lang="ts">
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { Icon } from '$lib/components';

  export let initialPage: number;
  export let totalItems: number;
  export let itemsPerPage = 10;
  export let displayPage = 10;
  export let onChange: (page: number) => void;

  let currentPage = initialPage;

  $: maxPage = Math.ceil(totalItems / itemsPerPage);
  $: currentPageGroup = Math.ceil(currentPage / displayPage);
  $: totalPageGroup = Math.ceil(maxPage / displayPage);
  $: remainingPage = maxPage - (currentPageGroup - 1) * displayPage;

  $: range = [...Array.from({ length: remainingPage < displayPage ? remainingPage : displayPage }).keys()].map(
    (index) => (currentPageGroup - 1) * displayPage + (index + 1),
  );

  $: if (initialPage !== currentPage) {
    onChange(currentPage);
  }
</script>

<div class="flex center mt-9 gap-1 pb-4" role="group">
  <button
    class="square-7 flex center disabled:(text-disabled cursor-not-allowed)"
    disabled={currentPage <= displayPage}
    type="button"
    on:click={() => {
      const previousPageGroup = currentPageGroup - 1;
      currentPage = previousPageGroup * displayPage;
    }}
  >
    <Icon class="square-3.5" icon={IconChevronLeft} />
  </button>
  {#each range as index (index)}
    <button
      class="square-8 p-2 rounded-lg border border-alphagray-10 flex center body-13-b transition bg-cardprimary hover:(bg-gray-90 text-darkprimary) focus-visible:(bg-gray-90 text-darkprimary) aria-pressed:(bg-gray-90 text-darkprimary)"
      aria-pressed={currentPage === index}
      type="button"
      on:click={() => {
        currentPage = index;
      }}
    >
      {index}
    </button>
  {/each}
  <button
    class="square-7 flex center disabled:(text-disabled cursor-not-allowed)"
    disabled={currentPageGroup === totalPageGroup}
    type="button"
    on:click={() => {
      const nextPageGroup = currentPageGroup + 1;
      currentPage = nextPageGroup * displayPage - (displayPage - 1);
    }}
  >
    <Icon class="square-3.5" icon={IconChevronRight} />
  </button>
</div>
