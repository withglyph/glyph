<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import type { ComponentType } from 'svelte';

  export let pathname: string;
  export let title: string;
  export let icon: ComponentType;

  let navEl: HTMLElement;

  afterNavigate(() => {
    if (navEl && $page.url.pathname.startsWith(pathname)) {
      navEl.scrollIntoView({ block: 'nearest', inline: 'center' });
    }
  });
</script>

<a
  bind:this={navEl}
  class={css(
    {
      flex: 'none',
      fontSize: { base: '17px', sm: '14px' },
      fontWeight: { base: 'semibold', sm: 'medium' },
      smDown: { color: 'gray.400' },
      sm: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        paddingX: '14px',
        paddingY: '16px',
        _hover: { backgroundColor: 'gray.50' },
      },
    },
    $page.url.pathname.startsWith(pathname) && {
      smDown: { color: 'gray.900' },
      sm: { backgroundColor: 'gray.50' },
    },
  )}
  href={pathname}
>
  <Icon style={css.raw({ hideBelow: 'sm' })} {icon} />{title}
</a>
