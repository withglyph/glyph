<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getEditorContext } from './context';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  const dispatch = createEventDispatcher<{ click: unknown }>();

  const { state } = getEditorContext();

  type $$Props = HTMLButtonAttributes;
</script>

<button
  type="button"
  on:pointerup={() => {
    if ($$restProps.disabled) {
      return;
    }

    dispatch('click');

    setTimeout(() => {
      $state.editor?.commands.focus();
    }, 0);
  }}
  {...$$restProps}
>
  <slot />
</button>
