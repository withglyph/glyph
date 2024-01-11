<script lang="ts">
  export let initialPage: number;
  export let totalItems: number;
  export let displayPage = 10;
  export let onChange: (page: number) => void;

  let currentPage = initialPage;

  $: maxPage = Math.ceil(totalItems / displayPage);
  $: currentPageGroup = Math.ceil(currentPage / displayPage);
  $: totalPageGroup = Math.ceil(maxPage / 10);
  $: remainingItems = maxPage - (currentPageGroup - 1) * displayPage;

  $: range = [...Array.from({ length: remainingItems < displayPage ? remainingItems : displayPage }).keys()].map(
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
      const previousPage = currentPageGroup - 1;
      currentPage = previousPage * displayPage;
    }}
  >
    <i class="i-lc-chevron-left square-3.5" aria-label="왼쪽 화살표 아이콘" />
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
    disabled={maxPage <= displayPage || currentPageGroup === totalPageGroup}
    type="button"
    on:click={() => {
      const nextPage = currentPageGroup + 1;
      currentPage = nextPage * displayPage - (displayPage - 1);
    }}
  >
    <i class="i-lc-chevron-right square-3.5" aria-label="오른쪽 화살표 아이콘" />
  </button>
</div>
