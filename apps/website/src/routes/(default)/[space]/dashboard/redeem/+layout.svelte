<script lang="ts">
  import { graphql } from '$glitch';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { css } from '$styled-system/css';

  $: query = graphql(`
    query SpaceDashboardRedeemLayout_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
      }
    }
  `);
</script>

<h1 class={css({ marginBottom: '12px', fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}>리딤코드</h1>

<TabHead style={css.raw({ gap: '28px', smDown: { marginTop: '-20px', paddingY: '12px' }, sm: { paddingBottom: '0' } })}>
  <TabHeadItem id={1} pathname="/{$query.space.slug}/dashboard/redeem">생성</TabHeadItem>
  <TabHeadItem id={2} pathname="/{$query.space.slug}/dashboard/redeem/manage">관리</TabHeadItem>
</TabHead>

<slot />
