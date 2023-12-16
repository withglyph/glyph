<script lang="ts">
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';

  export let value: string;

  let currentValue = getContext<Writable<string>>('currentValue');
  let currentText = getContext<Writable<string>>('currentText');
  let close = getContext<() => void>('close');
</script>

<li>
  <button
    class="body-14-sb text-secondary px-4 py-3 w-full rounded-lg hover:(bg-primary text-primary) focus:(bg-primary text-primary) aria-selected:(bg-primary text-primary)"
    aria-selected={$currentValue === value}
    role="option"
    type="button"
    {value}
    on:click
    on:click={(e) => {
      const { value, textContent } = e.currentTarget;

      $currentValue = value;
      if (textContent) $currentText = textContent;

      close();
    }}
  >
    <slot />
  </button>
</li>
