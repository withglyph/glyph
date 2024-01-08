<script lang="ts">
  export let initialIndex: number;
  let currentIndex = initialIndex;
  export let count: number;
  export let itemsPerPage = 10;
  export let onChange: (page: number) => void;

  $: currentPage = Math.ceil(currentIndex / itemsPerPage);
  $: remainingItems = count - (currentPage - 1) * itemsPerPage;

  $: range = [...Array.from({ length: remainingItems < itemsPerPage ? remainingItems : itemsPerPage }).keys()].map(
    (index) => (currentPage - 1) * itemsPerPage + (index + 1),
  );

  $: maxPage = Math.ceil(count / itemsPerPage);

  $: if (initialIndex !== currentIndex) {
    onChange(currentIndex);
  }
</script>

<div class="flex center mt-9 gap-1 pb-4" role="group">
  <button
    class="square-7 flex center disabled:(text-disabled cursor-not-allowed)"
    disabled={currentIndex <= itemsPerPage}
    type="button"
    on:click={() => {
      const previousPage = currentPage - 1;
      currentIndex = previousPage * itemsPerPage;
    }}
  >
    <i class="i-lc-chevron-left square-3.5" aria-label="왼쪽 화살표 아이콘" />
  </button>
  {#each range as index (index)}
    <button
      class="square-8 p-2 rounded-lg border border-alphagray-10 flex center body-13-b transition bg-cardprimary hover:(bg-gray-90 text-darkprimary) focus-visible:(bg-gray-90 text-darkprimary) aria-pressed:(bg-gray-90 text-darkprimary)"
      aria-pressed={currentIndex === index}
      type="button"
      on:click={() => {
        currentIndex = index;
      }}
    >
      {index}
    </button>
  {/each}
  <button
    class="square-7 flex center disabled:(text-disabled cursor-not-allowed)"
    disabled={currentPage === maxPage}
    type="button"
    on:click={() => {
      const nextPage = currentPage + 1;
      currentIndex = nextPage * itemsPerPage - (itemsPerPage - 1);
    }}
  >
    <i class="i-lc-chevron-right square-3.5" aria-label="오른쪽 화살표 아이콘" />
  </button>
</div>
