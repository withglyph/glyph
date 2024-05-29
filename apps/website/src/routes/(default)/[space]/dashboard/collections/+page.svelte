<script lang="ts">
  import dayjs from 'dayjs';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import IconPlus from '~icons/tabler/plus';
  import { graphql } from '$glitch';
  import { Helmet, Icon, Image } from '$lib/components';
  import { CreateCollectionModal } from '$lib/components/pages/collections';
  import { Button } from '$lib/components/v2';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  let openCreateCollectionModal = false;

  $: query = graphql(`
    query SpaceDashboardCollectionsPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name
        slug

        collections {
          id
          name
          count
          createdAt

          thumbnail {
            ...Image_image
          }
        }
      }
    }
  `);
</script>

<Helmet description={`${$query.space.name} 스페이스 컬렉션 관리`} title={`컬렉션 관리 | ${$query.space.name}`} />

<h1 class={css({ marginBottom: '32px', fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}>컬렉션</h1>

<div class={flex({ align: 'center', justify: 'space-between', marginBottom: '16px' })}>
  <p class={css({ fontSize: '15px', color: 'gray.500' })}>총 {$query.space.collections.length}개의 컬렉션</p>

  <Button
    style={flex.raw({ align: 'center', gap: '4px' })}
    size="sm"
    variant="gray-sub-fill"
    on:click={() => (openCreateCollectionModal = true)}
  >
    <Icon icon={IconPlus} />
    컬렉션 만들기
  </Button>
</div>

<ul class={flex({ direction: 'column', gap: { sm: '8px' } })}>
  {#each $query.space.collections as collection (collection.id)}
    <li class={css({ '& + & > a': { borderTopWidth: '1px' } })}>
      <a
        class={flex({
          justify: 'space-between',
          gap: '12px',
          borderColor: 'gray.100',
          paddingY: '14px',
          paddingLeft: '14px',
          paddingRight: '20px',
          _hover: { backgroundColor: 'gray.50' },
          sm: { borderWidth: '1px' },
          smDown: { marginX: '-20px', paddingX: '20px' },
        })}
        href="/{$query.space.slug}/dashboard/collections/{collection.id}"
      >
        <Image
          style={css.raw({ flex: 'none', width: '80px', aspectRatio: '3/4', objectFit: 'cover' })}
          $image={collection.thumbnail}
          placeholder
          size={128}
        />

        <div
          class={flex({
            direction: 'column',
            justify: 'space-between',
            align: 'flex-start',
            width: 'full',
            truncate: true,
          })}
        >
          <div class={css({ width: 'full', truncate: true })}>
            <h2 class={css({ marginBottom: '2px', fontSize: '15px', fontWeight: 'semibold', truncate: true })}>
              {collection.name}
            </h2>
            <p class={css({ fontSize: '14px', color: 'gray.600' })}>포스트 {comma(collection.count)}개</p>
          </div>

          <time class={css({ fontSize: '12px', color: 'gray.400' })} datetime={collection.createdAt}>
            생성일: {dayjs(collection.createdAt).formatAsDate()}
          </time>
        </div>

        <Icon style={css.raw({ marginY: 'auto', color: 'gray.400' })} icon={IconChevronRight} size={24} />
      </a>
    </li>
  {:else}
    <li class={css({ paddingY: '77px' })}>
      <p class={css({ fontSize: '15px', color: 'gray.500', textAlign: 'center' })}>
        스페이스에 업로드된 컬렉션이 없어요
      </p>
    </li>
  {/each}
</ul>

<CreateCollectionModal spaceId={$query.space.id} bind:open={openCreateCollectionModal} />
