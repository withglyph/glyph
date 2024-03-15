<script lang="ts">
  import { getFormContext } from '$lib/form';
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let name: string | undefined = undefined;
  export let style: SystemStyleObject | undefined = undefined;

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<label class={css({ display: 'flex', alignItems: 'center' }, style)}>
  <input
    id={name}
    {name}
    class={css({
      position: 'relative',
      display: 'inline-block',
      flex: 'none',
      borderWidth: '1px',
      borderColor: 'gray.400',
      borderRadius: 'full',
      size: '18px',
      cursor: 'pointer',
      appearance: 'none',
      _checked: {
        borderColor: 'gray.900',

        _before: {
          content: '""',
          position: 'absolute',
          top: '1/2',
          left: '1/2',
          translate: 'auto',
          translateX: '-1/2',
          translateY: '-1/2',
          display: 'block',
          borderRadius: 'full',
          backgroundColor: 'gray.900',
          size: '10px',
        },
      },
    })}
    type="radio"
    on:change
    {...$$restProps}
  />
  <slot />
</label>
