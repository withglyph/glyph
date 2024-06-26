<script lang="ts">
  import TabHead from '$lib/components/tab/TabHead.svelte';
  import TabHeadItem from '$lib/components/tab/TabHeadItem.svelte';
  import { isWebView } from '$lib/flutter';
  import { css } from '$styled-system/css';
</script>

<h1 class={css({ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}>계정설정</h1>

{#if !$isWebView}
  <TabHead
    style={css.raw({
      gap: '28px',
      smDown: {
        position: 'sticky',
        top: '116px',
        paddingY: '12px',
        paddingX: '20px',
        backgroundColor: 'gray.0',
        width: 'full',
        zIndex: '50',
      },
    })}
  >
    <TabHeadItem id={1} pathname="/me/settings">계정</TabHeadItem>
    <TabHeadItem id={2} pathname="/me/settings/notifications">알림</TabHeadItem>
  </TabHead>
{/if}

<div class={css({ marginTop: { base: '16px', sm: '32px' }, smDown: { paddingX: '20px' } })}>
  <slot />
</div>
