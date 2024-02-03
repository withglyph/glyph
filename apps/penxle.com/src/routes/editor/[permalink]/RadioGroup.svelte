<script lang="ts">
  import clsx from 'clsx';

  export let name: string;
  export let items: { label: string; value: string; icon: string; checked: boolean }[];
</script>

<fieldset class="flex gap-xs">
  {#each items as item (item.value)}
    {@const id = `${name}-${item.value}`}
    <div class="flex flex-col justify-center relative">
      <div
        class="relative m-b-0.375rem square-15 flex center border-(1px gray-300) rounded-0.625rem has-[:checked]:(border-teal-500 bg-teal-50)"
      >
        <input
          {id}
          {name}
          class="appearance-none absolute square-full peer"
          checked={item.checked}
          type="radio"
          value={item.value}
        />
        <i class={clsx(item.icon, 'square-6 color-gray-400 peer-checked:color-teal-500')} />
      </div>
      <label class="text-12-r text-center after:(absolute content-[''] inset-0 cursor-pointer)" for={id}>
        {item.label}
      </label>
    </div>
  {/each}
</fieldset>
