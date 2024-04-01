<script lang="ts">
  import qs from 'query-string';
  import { onMount, tick } from 'svelte';
  import IconSearch from '~icons/effit/search';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconX from '~icons/tabler/x';
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Icon } from '$lib/components';
  import { TextInput } from '$lib/components/v2/forms';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;

  let inputEl: HTMLInputElement | undefined;
  let value = ($page.url.pathname === '/search' && $page.url.searchParams.get('q')) || '';

  export let open = false;

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
    const toggleSearchBar = () => {
      open = window.innerWidth >= 992;
    };

    toggleSearchBar();

    window.addEventListener('resize', toggleSearchBar);

    return () => {
      window.removeEventListener('resize', toggleSearchBar);
    };
  });

  beforeNavigate(() => {
    if (window.innerWidth < 992 && open) {
      open = false;
    }
  });
</script>

{#if open}
  <div
    class={css(
      {
        smDown: {
          position: 'absolute',
          inset: '0',
          zIndex: '50',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'gray.5',
          height: 'full',
        },
      },
      style,
    )}
  >
    <button class={css({ hideFrom: 'sm' })} type="button" on:click={() => (open = false)}>
      <Icon icon={IconChevronLeft} size={24} />
    </button>
    <form
      on:submit|preventDefault={async () => {
        await goto(qs.stringifyUrl({ url: '/search', query: { q: value } }));
      }}
    >
      <TextInput placeholder="검색어를 입력하세요" size="sm" type="search" bind:inputEl bind:value>
        <button slot="left-icon" class={center({ transition: 'common', color: 'gray.500' })} type="submit">
          <Icon icon={IconSearch} size={20} />
        </button>
        <button
          slot="right-icon"
          class={center({ color: 'gray.600', display: { _disabled: 'none' } })}
          aria-label="지우기"
          disabled={value.length === 0}
          type="button"
          on:click={() => (value = '')}
        >
          <Icon icon={IconX} size={20} />
        </button>
      </TextInput>
    </form>
  </div>
{:else}
  <button
    class={css(style)}
    type="button"
    on:click={async () => {
      open = true;
      await tick();
      inputEl?.focus();
    }}
  >
    <Icon style={css.raw({ color: 'gray.900' })} icon={IconSearch} size={24} />
  </button>
{/if}
