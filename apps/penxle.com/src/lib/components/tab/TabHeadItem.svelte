<script lang="ts">
  import { getContext } from 'svelte';
  import { page } from '$app/stores';
  import { css, cva } from '$styled-system/css';
  import type { Writable } from 'svelte/store';
  import type { SystemStyleObject } from '$styled-system/types';

  export let id: number;
  export let activeTabValue: number | undefined = undefined;
  export let pathname: string | undefined = undefined;

  export let style: SystemStyleObject | undefined = undefined;

  let variant = getContext<Writable<'primary' | 'secondary'>>('variant');
  let search = getContext<Writable<string | undefined>>('search');

  let element: 'a' | 'button';
  $: element = pathname ? 'a' : 'button';
  $: props = element === 'a' ? { href: pathname && pathname + ($search ?? '') } : { type: 'button' };

  $: pathnameRegex = pathname ? new RegExp(`^${pathname}/?$`) : null;
  $: selected = activeTabValue === id || pathnameRegex?.test($page.url.pathname);

  const recipe = cva({
    base: {
      display: 'block',
      flexGrow: { base: '1', sm: '0' },
      width: 'full',
      color: { base: 'gray.400', _hover: 'black', _selected: 'black' },
      transition: 'common',
    },
    variants: {
      variant: {
        primary: {
          borderBottomWidth: '[10px]',
          borderBottomColor: { base: 'transparent', _hover: 'teal.500', _selected: 'teal.500' },
          fontSize: '20px',
          fontWeight: 'bold',
        },
        secondary: {
          borderBottomWidth: '2px',
          borderBottomColor: { base: 'white', _hover: 'black', _selected: 'black' },
          paddingX: '20px',
          paddingY: '12px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: { base: 'semibold', _selected: 'bold' },
          backgroundColor: { base: 'white', sm: 'transparent' },
        },
      },
    },
  });
</script>

<li class="grow sm:grow-0" role="presentation">
  <svelte:element
    this={element}
    id="{id}-tabhead"
    class={css(recipe.raw({ variant: $variant }), style)}
    aria-selected={selected}
    role="tab"
    tabindex="-1"
    on:click
    {...props}
  >
    <slot />
  </svelte:element>
</li>
