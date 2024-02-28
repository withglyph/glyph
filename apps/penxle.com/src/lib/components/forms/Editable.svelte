<script lang="ts">
  import IconEdit from '~icons/tabler/edit';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  export let value: string | null | undefined = undefined;
  export let style: SystemStyleObject | undefined = undefined;

  type $$Props = Omit<HTMLInputAttributes, 'class' | 'style'> & { value?: typeof value; style?: SystemStyleObject };
  type $$Events = {
    input: Parameters<NonNullable<HTMLInputAttributes['on:input']>>[0];
    blur: Parameters<NonNullable<HTMLInputAttributes['on:blur']>>[0];
  };

  let editing = false;
  let inputEl: HTMLInputElement;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<label class={flex({ position: 'relative', align: 'center', gap: '4px' })} on:click={() => (editing = true)}>
  <span class={css(editing && { visibility: 'hidden' }, !value && { color: 'gray.400' })} role="textbox" tabindex="-1">
    {value || $$props.placeholder}
  </span>
  <input
    {...$$props}
    bind:this={inputEl}
    class={css({ position: 'absolute', left: '0', width: 'full' }, !editing && { visibility: 'hidden' }, style)}
    tabindex="0"
    type="text"
    on:blur={() => {
      editing = false;
    }}
    bind:value
    on:blur
  />
  <button
    class={css({ color: { base: 'gray.500', _disabled: 'gray.400' } }, editing && { display: 'none' })}
    type="button"
    on:click={() => {
      editing = true;

      setTimeout(() => {
        inputEl.select();
      });
    }}
  >
    <Icon style={css.raw({ size: '24px' })} icon={IconEdit} />
  </button>
</label>
