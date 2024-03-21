<script lang="ts">
  import IconSearch from '~icons/tabler/search';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  export let name: HTMLInputAttributes['name'] = undefined;
  export let value: HTMLInputAttributes['value'] = undefined;

  export let style: SystemStyleObject | undefined = undefined;

  type $$Props = Omit<HTMLInputAttributes, 'class' | 'style'> & { style?: SystemStyleObject };
  type $$Events = {
    input: Parameters<NonNullable<HTMLInputAttributes['on:input']>>[0];
  };
</script>

<form class={css({ position: 'relative', height: '46px' }, style)} on:submit|preventDefault>
  <input
    {name}
    class={css(
      {
        borderWidth: '1px',
        borderColor: { base: 'gray.50', _focusWithin: 'gray.900' },
        borderRadius: '10px',
        paddingLeft: '44px',
        paddingRight: '14px',
        paddingY: '7px',
        width: 'full',
        height: '46px',
        transition: 'common',
      },
      style,
    )}
    type="search"
    bind:value
    on:input
    {...$$restProps}
  />

  <div class={center({ position: 'absolute', left: '14px', insetY: '0', height: 'full', color: 'gray.500' })}>
    <Icon icon={IconSearch} size={20} />
  </div>
</form>
