<script lang="ts">
  import clsx from 'clsx';
  import TextInput from './TextInput.svelte';
  import type { ComponentProps } from 'svelte';

  type $$Props = ComponentProps<TextInput>;

  let reveal = false;
</script>

<TextInput type={reveal ? 'text' : 'password'} {...$$restProps}>
  <button
    slot="right-icon"
    class={clsx(
      'square-4 text-gray-300 transition hover:text-gray-400',
      reveal ? 'i-lc-eye-off' : 'i-lc-eye'
    )}
    tabindex="-1"
    type="button"
    on:click={() => (reveal = !reveal)}
  />
</TextInput>
