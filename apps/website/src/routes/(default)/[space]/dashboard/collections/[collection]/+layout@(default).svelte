<script lang="ts">
  import IconArrowLeft from '~icons/tabler/arrow-left';
  import { graphql } from '$glitch';
  import { Icon } from '$lib/components';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { isWebView } from '$lib/flutter';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  $: query = graphql(`
    query SpaceDashboardCollectionsEntityLayout_Query($slug: String!) {
      spaceCollection(slug: $slug) {
        id

        space {
          id
          slug
        }
      }
    }
  `);
</script>

<div
  class={flex({
    direction: 'column',
    grow: '1',
    marginBottom: { base: '96px', sm: '120px' },
    width: 'full',
    sm: { maxWidth: '860px' },
  })}
>
  <div
    class={css({
      position: 'sticky',
      top: $isWebView ? '0' : '62px',
      paddingTop: { sm: '35px' },
      backgroundColor: 'gray.0',
      zIndex: '1',
      smDown: { paddingX: '20px' },
    })}
  >
    <h1
      class={flex({
        align: 'center',
        gap: '4px',
        fontSize: { base: '17px', sm: '24px' },
        fontWeight: { base: 'semibold', sm: 'bold' },
        smDown: { paddingY: '13px' },
        sm: { marginBottom: '20px' },
      })}
    >
      <a href="/{$query.spaceCollection.space.slug}/dashboard/collections">
        <Icon style={css.raw({ hideFrom: 'sm' })} icon={IconArrowLeft} size={24} />
        <Icon style={css.raw({ hideBelow: 'sm' })} icon={IconArrowLeft} size={28} />
      </a>
      컬렉션 수정
    </h1>

    <TabHead style={css.raw({ gap: '31px', smDown: { paddingY: '12px' }, sm: { paddingBottom: '6px' } })}>
      <TabHeadItem
        id={1}
        pathname="/{$query.spaceCollection.space.slug}/dashboard/collections/{$query.spaceCollection.id}"
      >
        컬렉션 정보
      </TabHeadItem>
      <TabHeadItem
        id={2}
        pathname="/{$query.spaceCollection.space.slug}/dashboard/collections/{$query.spaceCollection.id}/posts"
      >
        포스트 관리
      </TabHeadItem>
    </TabHead>
  </div>

  <slot />
</div>
