<script lang="ts">
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let href: string;
  export let underline = false;
  export let colored = false;
  export let external = !href.startsWith('/');
</script>

<a
  class={css(
    underline && { _hover: { textDecorationLine: 'underline', textUnderlineOffset: '2px' } },
    colored && { color: 'gray.800' },
    style,
  )}
  {href}
  {...external && {
    target: '_blank',
    rel: 'noopener noreferrer',
  }}
  {...$$restProps}
>
  <slot />
</a>
