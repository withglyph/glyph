<script lang="ts">
  import IconAlertCircle from '~icons/tabler/alert-circle';
  import { Icon } from '$lib/components';
  import { FormValidationMessage } from '$lib/components/forms';
  import { setFormField } from '$lib/form';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let name: string;
  export let label: string;

  setFormField({
    name,
  });
</script>

<section class={css(style)}>
  <label class={css({ display: 'inline-block', marginBottom: '6px', fontSize: '14px' })} for={name}>{label}</label>
  <slot />
  <div
    class={flex({
      align: 'center',
      gap: '2px',
      marginTop: '6px',
      fontSize: '12px',
      color: 'error.900',
      minHeight: '18px',
    })}
  >
    <FormValidationMessage for={name} let:message>
      <Icon style={css.raw({ size: '14px' })} icon={IconAlertCircle} />
      {message}
    </FormValidationMessage>
  </div>
</section>
