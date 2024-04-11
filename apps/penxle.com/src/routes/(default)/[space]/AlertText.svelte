<script lang="ts">
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { SystemStyleObject } from '$styled-system/types';

  export let titleStyle: SystemStyleObject | undefined = undefined;
  export let title: string;
  export let triggerTags: { id: string; tag: { name: string } }[] = [];
  export let description: string | undefined = undefined;
</script>

<header
  class={flex({
    direction: 'column',
    align: 'center',
    paddingTop: '60px',
    paddingBottom: { base: '60px', sm: '24px' },
    width: 'full',
  })}
  role="alert"
>
  <h2 class={css({ textAlign: 'center', fontSize: '16px', fontWeight: 'semibold' }, titleStyle)}>
    {title}
  </h2>

  <ul class={flex({ justify: 'center', gap: '6px', wrap: 'wrap' })}>
    {#each triggerTags as triggerTag (triggerTag.id)}
      <li class={css({ fontSize: '14px', color: 'red.600' })}>#{triggerTag.tag.name.replaceAll('_', ' ')}</li>
    {/each}
  </ul>

  {#if description}
    <p
      class={css({
        marginTop: '4px',
        fontSize: '14px',
        color: 'gray.500',
        textAlign: 'center',
        whiteSpace: 'pre-wrap',
      })}
    >
      {description}
    </p>
  {/if}

  <slot />
</header>
