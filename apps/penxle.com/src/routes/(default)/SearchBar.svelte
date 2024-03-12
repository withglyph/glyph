<script lang="ts">
  import qs from 'query-string';
  import { onMount } from 'svelte';
  import IconSearch from '~icons/effit/search';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconCircleXFilled from '~icons/tabler/circle-x-filled';
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
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

  beforeNavigate(() => {
    if (window.innerWidth < 800 && open) {
      open = false;
    }
  });
</script>

{#if open}
  <div
    class={css({
      flexGrow: '1',
      smDown: {
        position: 'absolute',
        left: '0',
        right: '0',
        top: '0',
        zIndex: '50',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.100',
        paddingX: '20px',
        backgroundColor: 'white',
        height: '56px',
      },
    })}
  >
    <button class={css({ hideFrom: 'sm' })} type="button" on:click={() => (open = false)}>
      <Icon style={css.raw({ size: '24px' })} icon={IconChevronLeft} />
    </button>
    <form
      class={css(
        {
          position: 'relative',
          smDown: { maxWidth: 'full' },
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
            borderRadius: '6px',
            paddingLeft: '16px',
            paddingRight: '68px',
            paddingY: '10px',
            fontSize: '15px',
            backgroundColor: 'gray.50',
            width: 'full',
            height: { base: '45px', sm: '43px' },
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
          right: '48px',
          color: 'gray.400',
          hideFrom: 'sm',
        })}
        type="button"
        on:click={() => (value = '')}
      >
        <Icon style={css.raw({ size: '20px' })} icon={IconCircleXFilled} />
      </button>

      <button
        class={center({
          position: 'absolute',
          insetY: '0',
          right: '16px',
          transition: 'common',
          color: { base: 'gray.500', _peerFocus: 'teal.500' },
        })}
        type="submit"
      >
        <Icon style={css.raw({ size: '20px' })} icon={IconSearch} />
      </button>
    </form>
  </div>
{:else}
  <button class={center({ marginRight: '8px', size: '34px' })} type="button" on:click={() => (open = true)}>
    <Icon style={css.raw({ size: '24px', color: 'gray.950' })} icon={IconSearch} />
  </button>
{/if}
