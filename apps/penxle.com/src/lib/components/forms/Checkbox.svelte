<script lang="ts">
  import IconAlertTriangleFilled from '~icons/tabler/alert-triangle-filled';
  import IconChecked from '~icons/tabler/check';
  import { Icon } from '$lib/components';
  import { getFormContext } from '$lib/form';
  import { css, cx } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import FormValidationMessage from './FormValidationMessage.svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  export let name: string | null | undefined = undefined;
  export let checked: boolean | null | undefined = false;
  export let style: SystemStyleObject | undefined = undefined;

  type $$Props = Omit<HTMLInputAttributes, 'style'> & { style?: SystemStyleObject };
  type $$Events = {
    change: Parameters<NonNullable<HTMLInputAttributes['on:change']>>[0];
  };

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<div>
  <label
    class={css({ position: 'relative', display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }, style)}
  >
    <input
      id={name}
      {name}
      class={cx(
        'peer',
        center({
          flex: 'none',
          size: '18px',
          borderWidth: '1px',
          borderColor: 'gray.300',
          borderRadius: '3px',
          cursor: 'pointer',
          appearance: 'none',
          transition: 'common',
          _checked: { borderWidth: '0', backgroundColor: 'teal.500' },
          _enabled: { '&[aria-invalid]': { borderColor: 'red.500' } },
        }),
      )}
      type="checkbox"
      on:change
      bind:checked
      {...$$restProps}
    />
    <div
      class={center({
        display: 'none',
        position: 'absolute',
        top: '2px',
        left: '0',
        size: '18px',
        _peerChecked: { display: 'flex' },
      })}
    >
      <Icon style={css.raw({ size: '14px', color: 'white' })} icon={IconChecked} />
    </div>

    <span class={css({ cursor: 'pointer' })}>
      <slot />
    </span>
  </label>
  {#if name}
    <FormValidationMessage for={name} let:message>
      <div class={flex({ align: 'center', gap: '6px', marginTop: '6px', fontSize: '11px', color: 'gray.400' })}>
        <Icon style={css.raw({ color: 'red.500' })} icon={IconAlertTriangleFilled} />
        {message}
      </div>
    </FormValidationMessage>
  {/if}
</div>
