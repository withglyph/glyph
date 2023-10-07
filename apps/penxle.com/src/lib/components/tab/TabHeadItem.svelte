<script lang="ts">
  import clsx from 'clsx';
  import { page } from '$app/stores';

  export let id: number;
  export let activeTabValue: number | undefined = undefined;
  export let variant: 'primary' | 'secondary' = 'primary';
  export let href: string | undefined = undefined;
</script>

<li class="grow sm:grow-0" role="presentation">
  <button
    id="{id}-tabhead"
    class={clsx(
      'font-bold w-full grow sm:grow-0',
      variant === 'primary' && 'text-xl border-b-10 leading-5 transition hover:(text-black border-brand-50)',
      variant === 'primary' && (activeTabValue === id || $page.url.pathname === href) && 'text-black border-brand-50',
      variant === 'primary' &&
        activeTabValue !== id &&
        $page.url.pathname !== href &&
        'border-transparent text-gray-40',
      variant === 'secondary' &&
        'bg-white p-4 text-center sm:bg-transparent transition hover:(text-black! border-b-2 border-black!)',
      variant === 'secondary' &&
        (activeTabValue === id || $page.url.pathname === href) &&
        'text-black border-b-2 border-black',
      variant === 'secondary' && activeTabValue !== id && $page.url.pathname !== href && 'border-gray-30 text-gray-40',
    )}
    role="tab"
    type="button"
    on:click
  >
    <slot />
  </button>
</li>
