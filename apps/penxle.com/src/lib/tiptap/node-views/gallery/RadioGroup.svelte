<script generics="T" lang="ts">
  import clsx from 'clsx';
  import { nanoid } from 'nanoid';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ change: T }>();

  export let name: string;
  export let items: { label: string; value: T; icon?: string; checked: boolean; text?: string }[];
  let _class: string | undefined = undefined;
  export { _class as class };
  export let variant: 'gallery' | 'list' = 'gallery';
  export let size: 'sm' | 'md' = 'md';
</script>

<fieldset class={clsx('flex gap-xs', variant === 'list' && 'flex-col', _class)}>
  {#each items as item (item.value)}
    {@const id = nanoid()}
    <div class="flex flex-col center relative">
      <div
        class={clsx(
          'relative m-b-0.375rem flex center bg-gray-50 border-(1px gray-100) has-[:checked]:(border-teal-500 bg-teal-50)',
          variant === 'gallery' && size === 'sm' && 'square-12 rounded',
          variant === 'gallery' && size === 'md' && 'square-16 rounded-0.625rem',
          variant === 'list' && 'w-full rounded h-8 pl-2 pr-4.5 gap-1.5 mb-0',
        )}
      >
        <input
          {id}
          {name}
          class="appearance-none absolute square-full peer"
          checked={item.checked}
          type="radio"
          value={item.value}
          on:change={() => dispatch('change', item.value)}
        />
        {#if item.icon}
          <i
            class={clsx(
              item.icon,
              'color-gray-400 peer-checked:color-teal-500',
              size === 'sm' && 'square-5',
              size === 'md' && 'square-8',
            )}
          />
        {:else if item.text}
          <span class="text-18-sb text-gray-400 peer-checked:text-teal-500">{item.text}</span>
        {/if}

        {#if variant === 'list'}
          <label
            class="text-gray-400 grow after:(absolute content-[''] inset-0 cursor-pointer) text-11-m peer-checked:text-teal-500"
            for={id}
          >
            {item.label}
          </label>
        {/if}
      </div>
      {#if variant === 'gallery'}
        <label
          class={clsx(
            "text-center text-gray-400 after:(absolute content-[''] inset-0 cursor-pointer)",
            size === 'sm' && 'text-11-m',
            size === 'md' && 'text-13-m',
          )}
          for={id}
        >
          {item.label}
        </label>
      {/if}
    </div>
  {/each}
</fieldset>
