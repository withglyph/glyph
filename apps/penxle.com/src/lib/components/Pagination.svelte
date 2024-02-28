<script lang="ts">
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';

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

<div class={center({ gap: '4px', marginTop: '36px', paddingBottom: '16px' })} role="group">
  <button
    class={center({ size: '28px', _disabled: { color: 'gray.400', cursor: 'not-allowed' } })}
    disabled={currentPage <= displayPage}
    type="button"
    on:click={() => {
      const previousPageGroup = currentPageGroup - 1;
      currentPage = previousPageGroup * displayPage;
    }}
  >
    <Icon style={css.raw({ size: '14px' })} icon={IconChevronLeft} />
  </button>
  {#each range as index (index)}
    <button
      class={center({
        borderWidth: '1px',
        borderColor: '[black/10]',
        borderRadius: '8px',
        padding: '8px',
        size: '32px',
        fontSize: '13px',
        fontWeight: 'bold',
        backgroundColor: 'white',
        transition: 'common',
        _hover: { color: 'white', backgroundColor: 'gray.900' },
        _focusVisible: { color: 'white', backgroundColor: 'gray.900' },
        _pressed: { color: 'white', backgroundColor: 'gray.900' },
      })}
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
    class={center({ size: '28px', _disabled: { color: 'gray.400', cursor: 'not-allowed' } })}
    disabled={currentPageGroup === totalPageGroup}
    type="button"
    on:click={() => {
      const nextPageGroup = currentPageGroup + 1;
      currentPage = nextPageGroup * displayPage - (displayPage - 1);
    }}
  >
    <Icon style={css.raw({ size: '14px' })} icon={IconChevronRight} />
  </button>
</div>
