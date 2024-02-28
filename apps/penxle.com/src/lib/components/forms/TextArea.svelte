<script lang="ts">
  import { getFormContext } from '$lib/form';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type { HTMLTextareaAttributes } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  export let name: HTMLTextareaAttributes['name'] = undefined;
  export let value: HTMLTextareaAttributes['value'] = undefined;

  export let style: SystemStyleObject | undefined = undefined;

  type $$Props = Omit<HTMLTextareaAttributes, 'class' | 'style'> & { style?: SystemStyleObject };

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<div class={flex({ position: 'relative', align: 'center' })}>
  <textarea
    id={name}
    {name}
    class={css(
      { fontSize: '15px', fontWeight: 'medium', resize: 'none' },
      'right-icon' in $$slots && { marginBottom: '16px' },
      style,
    )}
    on:input
    bind:value
    {...$$restProps}
  />
  {#if 'right-icon' in $$slots}
    <div class={center({ position: 'absolute', right: '0', bottom: '0' })}>
      <slot name="right-icon" />
    </div>
  {/if}
</div>
