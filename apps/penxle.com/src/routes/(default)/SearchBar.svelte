<script lang="ts">
  import qs from 'query-string';
  import { onMount } from 'svelte';
  import IconSearch from '~icons/tabler/search';
  import IconX from '~icons/tabler/x';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Icon } from '$lib/components';
  import { css, cx } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;

  let value = ($page.url.pathname === '/search' && $page.url.searchParams.get('q')) || '';

  let open = false;

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

  onMount(() => {
    if (window.innerWidth >= 800) {
      open = true;
    }
  });
</script>

{#if open}
  <form
    class={css(
      {
        position: 'relative',
        smDown: { position: 'absolute', left: '0', right: '0', top: '0', maxWidth: 'full', zIndex: '50' },
      },
      style,
    )}
    on:submit|preventDefault={async () => {
      await goto(qs.stringifyUrl({ url: '/search', query: { q: value } }));
    }}
  >
    <input
      class={cx(
        'peer',
        css({
          borderRadius: '4px',
          paddingLeft: '12px',
          paddingRight: '68px',
          paddingY: '10px',
          width: 'full',
          height: { base: '41px', smDown: '56px' },
          fontSize: '14px',
          backgroundColor: 'gray.100',
          transition: 'common',
          _focusWithin: {
            ringWidth: '1px',
            ringColor: 'teal.500',
            backgroundColor: 'white',
          },
        }),
      )}
      placeholder="검색어를 입력하세요"
      type="search"
      bind:value
    />

    <button
      class={center({
        position: 'absolute',
        insetY: '0',
        right: '12px',
        transition: 'common',
        color: { base: 'gray.400', _peerFocus: 'gray.900' },
      })}
      type="submit"
    >
      <Icon style={css.raw({ size: '20px' })} icon={IconSearch} />
    </button>

    <button
      class={center({
        position: 'absolute',
        insetY: '0',
        right: '40px',
        color: 'gray.400',
        hideFrom: 'sm',
      })}
      type="button"
      on:click={() => (open = false)}
    >
      <Icon style={css.raw({ size: '20px' })} icon={IconX} />
    </button>
  </form>
{:else}
  <button type="button" on:click={() => (open = true)}>
    <Icon style={css.raw({ size: '20px', color: 'gray.400' })} icon={IconSearch} />
  </button>
{/if}
