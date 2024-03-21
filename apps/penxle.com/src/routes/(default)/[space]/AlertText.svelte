<script lang="ts">
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { ComponentType } from 'svelte';

  export let icon: ComponentType;
  export let title: string;
  export let triggerTags: { id: string; tag: { name: string } }[] = [];
  export let description: string | undefined = undefined;
</script>

<header
  class={flex({ direction: 'column', align: 'center', paddingX: '12px', paddingY: '80px', width: 'full' })}
  role="alert"
>
  <div class={flex({ direction: 'column', align: 'center', gap: '8px' })}>
    <Icon style={css.raw({ color: 'teal.500' })} {icon} size={32} />
    <h2 class={css({ textAlign: 'center', fontSize: '18px', fontWeight: 'semibold' })}>
      {title}
    </h2>
  </div>

  <ul class={flex({ justify: 'center', gap: '6px', wrap: 'wrap' })}>
    {#each triggerTags as triggerTag (triggerTag.id)}
      <li class={css({ color: 'teal.500' })}>#{triggerTag.tag.name.replaceAll('_', ' ')}</li>
    {/each}
  </ul>

  {#if description}
    <p class={css({ marginTop: '2px', fontSize: '14px', color: 'gray.500' })}>{description}</p>
  {/if}

  <slot />
</header>
