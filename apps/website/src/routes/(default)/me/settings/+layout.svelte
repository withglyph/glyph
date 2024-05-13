<script lang="ts">
  import TabHead from '$lib/components/tab/TabHead.svelte';
  import TabHeadItem from '$lib/components/tab/TabHeadItem.svelte';
  import { css } from '$styled-system/css';
</script>

<h1 class={css({ marginBottom: '12px', fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}>계정설정</h1>

<TabHead
  style={css.raw({
    gap: '28px',
    marginBottom: { base: '16px', sm: '32px' },
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

<div class={css({ smDown: { paddingX: '20px' } })}>
  <slot />
</div>
