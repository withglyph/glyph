<script lang="ts">
  import clsx from 'clsx';
  import { nanoid } from 'nanoid';

  export let name: string;
  export let items: { label: string; value: string; icon?: string; checked: boolean; text?: string }[];
  let _class: string | undefined = undefined;
  export { _class as class };
</script>

<fieldset class={clsx('flex gap-xs', _class)}>
  {#each items as item (item.value)}
    {@const id = nanoid()}
    <div class="flex flex-col justify-center relative">
      <div
        class="relative m-b-0.375rem square-16 flex center bg-gray-50 border-(1px gray-100) rounded-0.625rem has-[:checked]:(border-teal-500 bg-teal-50)"
      >
        <input
          {id}
          {name}
          class="appearance-none absolute square-full peer"
          checked={item.checked}
          type="radio"
          value={item.value}
        />
        {#if item.icon}
          <i class={clsx(item.icon, 'square-8 color-gray-400 peer-checked:color-teal-500')} />
        {:else if item.text}
          <span class="text-18-sb text-gray-400 peer-checked:text-teal-500">{item.text}</span>
        {/if}
      </div>
      <label class="text-13-m text-center text-gray-400 after:(absolute content-[''] inset-0 cursor-pointer)" for={id}>
        {item.label}
      </label>
    </div>
  {/each}
</fieldset>
