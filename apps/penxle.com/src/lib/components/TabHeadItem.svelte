<script lang="ts">
  import clsx from 'clsx';

  export let id: number;
  export let activeTabValue: number;
  export let variant: 'primary' | 'secondary' = 'primary';
</script>

<li class="grow sm:grow-0" role="presentation">
  <button
    id="{id}-tabhead"
    class={clsx(
      'font-bold w-full grow sm:grow-0',
      variant === 'primary' &&
        'text-xl border-b-10 leading-5 transition hover:(text-black border-brand-50)',
      variant === 'primary' &&
        activeTabValue === id &&
        'text-black border-brand-50',
      variant === 'primary' &&
        activeTabValue !== id &&
        'border-transparent text-gray-40',
      variant === 'secondary' &&
        'bg-white p-4 text-center border-b sm:bg-transparent transition hover:(text-black! border-black!)',
      variant === 'secondary' &&
        activeTabValue === id &&
        'text-black border-black',
      variant === 'secondary' &&
        activeTabValue !== id &&
        'border-gray-30 text-gray-40',
    )}
    role="tab"
    type="button"
    on:click
  >
    <slot />
  </button>
</li>
