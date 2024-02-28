<script lang="ts">
  import IconX from '~icons/tabler/x';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
</script>

<button
  class={flex({
    align: 'center',
    gap: '4px',
    borderWidth: '1px',
    borderColor: 'teal.500',
    borderRadius: 'full',
    paddingX: '12px',
    paddingY: '6px',
    fontSize: '12px',
    color: 'teal.500',
    backgroundColor: 'teal.50',
  })}
  type="button"
  on:click
>
  <slot />
  <Icon style={css.raw({ size: '14px' })} icon={IconX} />
</button>
