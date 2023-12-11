<script lang="ts">
  import clsx from 'clsx';
  import { getContext } from 'svelte';
  import { page } from '$app/stores';

  export let id: number;
  export let activeTabValue: number | undefined = undefined;
  export let variant: 'primary' | 'secondary' = getContext('variant');
  export let href: string | undefined = undefined;

  let _class: string | undefined = undefined;
  export { _class as class };

  let element: 'a' | 'button';
  $: element = href ? 'a' : 'button';
  $: props = element === 'a' ? { href } : { type: 'button' };
</script>

<li class="grow sm:grow-0" role="presentation">
  <svelte:element
    this={element}
    id="{id}-tabhead"
    class={clsx(
      'block w-full grow sm:grow-0',
      variant === 'primary' && 'title-20-eb border-b-10 leading-5 transition hover:(text-black border-brand-50)',
      variant === 'primary' &&
        (activeTabValue === id || decodeURI($page.url.pathname) === href) &&
        'text-black border-brand-50',
      variant === 'primary' &&
        activeTabValue !== id &&
        decodeURI($page.url.pathname) !== href &&
        'border-transparent text-disabled',
      variant === 'secondary' &&
        'bg-white p-3 text-center sm:bg-transparent transition border-b-2 border-white hover:(text-black! border-black!)',
      variant === 'secondary' &&
        (activeTabValue === id ||
          ($page.url.search === ''
            ? decodeURI($page.url.pathname)
            : decodeURI($page.url.pathname + $page.url.search)) === href) &&
        'text-black body-16-b border-b-2 border-black!',
      variant === 'secondary' &&
        activeTabValue !== id &&
        ($page.url.search === '' ? decodeURI($page.url.pathname) : decodeURI($page.url.pathname + $page.url.search)) !==
          href &&
        'border-secondary body-16-sb text-disabled',
      _class,
    )}
    role="tab"
    tabindex="-1"
    on:click
    {...props}
  >
    <slot />
  </svelte:element>
</li>
