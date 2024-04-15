<script lang="ts">
  import IconAlertTriangle from '~icons/tabler/alert-triangle';
  import { Icon } from '$lib/components';
  import { setFormField } from '$lib/form';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import FormValidationMessage from './FormValidationMessage.svelte';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let name: string;
  export let label: string;

  setFormField({
    name,
  });
</script>

<section class={css(style)}>
  <div
    class={flex({
      'direction': 'column',
      'gap': '6px',
      'borderWidth': '1px',
      'borderColor': { base: 'gray.50', _hover: 'gray.200', _focusWithin: '[gray.900!]' },
      'borderRadius': '16px',
      'paddingX': '14px',
      'paddingTop': '12px',
      'paddingBottom': '16px',
      'backgroundColor': 'gray.50',
      'transition': 'common',
      '_disabled': { opacity: '50' },
      '&:has(input[aria-invalid], textarea[aria-invalid])': { borderColor: 'red.600' },
    })}
  >
    <label class={css({ fontSize: '14px', fontWeight: 'semibold' })} for={name}>{label}</label>
    <slot />
  </div>
  <FormValidationMessage for={name} let:message>
    <div class={flex({ align: 'center', gap: '6px', marginTop: '6px', fontSize: '12px', color: 'red.600' })}>
      <Icon icon={IconAlertTriangle} />
      {message}
    </div>
  </FormValidationMessage>
</section>
