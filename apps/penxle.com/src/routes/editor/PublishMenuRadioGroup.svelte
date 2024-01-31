<script lang="ts">
  import clsx from 'clsx';

  export let name: string;
  export let items: { label: string; value: string; icon: string }[];
</script>

<fieldset class="flex gap-xs">
  {#each items as item (item.value)}
    {@const id = `${name}-${item.value}`}
    <div class="flex flex-col justify-center">
      <label
        class="relative m-b-0.375rem square-15 flex center border-(1px gray-300) rounded-0.625rem has-[:checked]:(border-teal-500 bg-teal-50)"
      >
        <input {id} {name} class="appearance-none absolute square-full" type="radio" value={item.value} />
        <i class={clsx(item.icon, 'square-6 color-gray-400 selected:teal-500')} />
      </label>
      <label class="text-12-r text-center" for={id}>
        {item.label}
      </label>
    </div>
  {/each}
</fieldset>
