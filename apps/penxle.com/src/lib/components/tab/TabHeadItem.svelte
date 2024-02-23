<script lang="ts">
  import clsx from 'clsx';
  import { getContext } from 'svelte';
  import { page } from '$app/stores';
  import type { Writable } from 'svelte/store';

  export let id: number;
  export let activeTabValue: number | undefined = undefined;
  export let pathname: string | undefined = undefined;

  let _class: string | undefined = undefined;
  export { _class as class };

  let variant = getContext<Writable<'primary' | 'secondary'>>('variant');
  let search = getContext<Writable<string | undefined>>('search');

  let element: 'a' | 'button';
  $: element = pathname ? 'a' : 'button';
  $: props =
    element === 'a'
      ? {
          href: pathname && pathname + ($search ?? ''),
        }
      : { type: 'button' };

  $: pathnameRegex = pathname ? new RegExp(`^${pathname}/?$`) : null;
  $: selected = activeTabValue === id || pathnameRegex?.test($page.url.pathname);
</script>

<li class="grow sm:grow-0" role="presentation">
  <svelte:element
    this={element}
    id="{id}-tabhead"
    class={clsx(
      'block w-full grow sm:grow-0',
      $variant === 'primary' &&
        'title-20-eb border-b-10 leading-5 transition border-transparent text-disabled hover:(text-black border-brand-50) aria-selected:(text-black border-brand-50)',
      $variant === 'secondary' &&
        'bg-white py-3 px-5 text-center sm:bg-transparent transition border-b-2 border-white text-14-sb text-disabled hover:(text-black border-black) aria-selected:(text-black font-bold border-b-2 border-black)',
      _class,
    )}
    aria-selected={selected}
    role="tab"
    tabindex="-1"
    on:click
    {...props}
  >
    <slot />
  </svelte:element>
</li>
