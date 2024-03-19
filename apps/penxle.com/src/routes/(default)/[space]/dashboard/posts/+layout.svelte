<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { pageSubTitle } from '$lib/stores';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  onMount(async () => {
    pageSubTitle.set('포스트 관리');
  });
</script>

<section
  class={flex({
    direction: 'column',
    gap: '16px',
    paddingX: '24px',
    paddingY: '32px',
    borderRadius: '12px',
    backgroundColor: 'gray.5',
    borderWidth: '1px',
    borderColor: 'gray.200',
    smDown: { marginX: '16px', marginY: '20px' },
  })}
>
  <h1 class={css({ fontSize: '20px', fontWeight: 'bold' })}>포스트 관리</h1>
  <div>
    <TabHead style={css.raw({ borderStyle: 'none' })} variant="secondary">
      <TabHeadItem id={0} pathname="/{$page.params.space}/dashboard/posts">포스트</TabHeadItem>
      <TabHeadItem id={1} pathname="/{$page.params.space}/dashboard/posts/collections">컬렉션</TabHeadItem>
    </TabHead>
    <hr class={css({ width: 'full', borderColor: 'gray.900/10' })} />
  </div>
  <slot />
</section>
