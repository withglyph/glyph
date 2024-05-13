<script lang="ts">
  import qs from 'query-string';
  import { tick } from 'svelte';
  import IconSearch from '~icons/glyph/search';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconX from '~icons/tabler/x';
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Icon } from '$lib/components';
  import { TextInput } from '$lib/components/v2/forms';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;

  let inputEl: HTMLInputElement | undefined;
  let value = ($page.url.pathname === '/search' && $page.url.searchParams.get('q')) || '';

  export let smBelow = false;
  let open = !smBelow;

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
</script>

{#if open}
  <div
    class={css(
      {
        '&[data-sm-below=true]': {
          position: 'absolute',
          inset: '0',
          zIndex: '50',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingX: '20px',
          backgroundColor: 'gray.0',
          height: 'full',
        },
        '&[data-sm-below=false] > button.close-search-bar': {
          display: 'none',
        },
      },
      style,
    )}
    data-sm-below={smBelow}
  >
    <button class="close-search-bar" type="button" on:click={() => (open = false)}>
      <Icon icon={IconChevronLeft} size={24} />
    </button>
    <form
      class={css({ flexGrow: '1' })}
      on:submit|preventDefault={async () => {
        await goto(qs.stringifyUrl({ url: '/search', query: { q: value } }));
      }}
    >
      <TextInput placeholder="검색어를 입력하세요" size="sm" type="search" bind:inputEl bind:value>
        <button
          slot="left-icon"
          class={center({ transition: 'common', color: 'gray.500' })}
          aria-label="검색"
          type="submit"
        >
          <Icon icon={IconSearch} size={20} />
        </button>
        <button
          slot="right-icon"
          class={center({ color: 'gray.600', display: { _disabled: 'none' } })}
          aria-label="지우기"
          disabled={value.length === 0}
          type="reset"
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
