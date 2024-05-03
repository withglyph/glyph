<script lang="ts">
  import dayjs from 'dayjs';
  import { graphql } from '$bifrost';
  import { Button, Helmet, Image } from '$lib/components';
  import {
    CreateCollectionModal,
    ManageCollectionModal,
    UpdateCollectionModal,
  } from '$lib/components/pages/collections';
  import { Table, TableData, TableHead, TableHeader, TableRow } from '$lib/components/table';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  let openManageCollectionModal = false;
  let openCreateCollectionModal = false;
  let openUpdateCollectionModal = false;

  $: query = graphql(`
    query SpaceSettingCollectionPage_Query($slug: String!) {
      space(slug: $slug) {
        id

        name
        slug

        meAsMember {
          id
          ...PostManageTable_SpaceMember
        }

        posts {
          ...SpaceCollectionsEntityPage_ManageCollectionModal_post
        }

        collections {
          id

          name
          count
          createdAt

          thumbnail {
            ...Image_image
          }

          ...UpdateCollectionModal_Collection_query
          ...SpaceCollectionsEntityPage_ManageCollectionModal_collection
        }
      }
    }
  `);

  let selectedCollection: (typeof $query.space.collections)[number] | null = null;
</script>

<Helmet description={`${$query.space.name} 스페이스 컬렉션 관리`} title={`컬렉션 관리 | ${$query.space.name}`} />

<div class={flex({ justify: 'space-between', gap: '8px' })}>
  <div class={flex({ gap: '8px' })}>
    <Button size="md" on:click={() => (openCreateCollectionModal = true)}>새 컬렉션 생성</Button>
  </div>
</div>

<div class={css({ overflowY: 'auto' })}>
  <Table style={css.raw({ borderSpacingY: '2px', borderCollapse: 'separate', textAlign: 'left' })}>
    <TableHeader>
      <TableRow>
        <TableHead>컬렉션</TableHead>
        <TableHead style={css.raw({ width: '[20%]' })}>수정/관리</TableHead>
      </TableRow>
    </TableHeader>
    {#each $query.space.collections as collection (collection.id)}
      <TableRow>
        <TableData>
          <a
            class={flex({ align: 'flex-end', gap: '12px' })}
            href={`/${$query.space.slug}/collections/${collection.id}`}
          >
            <Image
              style={css.raw({ flex: 'none', width: '48px', aspectRatio: '[3/4]', flexShrink: 0, objectFit: 'cover' })}
              $image={collection.thumbnail}
              placeholder
              size={128}
            />
            <dl class={css({ truncate: true })}>
              <dt class={css({ marginBottom: '4px', fontSize: '15px', fontWeight: 'bold', truncate: true })}>
                {collection.name}
              </dt>
              <dd
                class={css({
                  marginBottom: '4px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: 'gray.500',
                  truncate: true,
                })}
              >
                {collection.count}개의 포스트
              </dd>
              <div class={flex({ align: 'center', fontSize: '12px', fontWeight: 'semibold', color: 'gray.400' })}>
                <dt>생성일:</dt>
                <dd>{dayjs(collection.createdAt).formatAsDate()}</dd>
              </div>
            </dl>
          </a>
        </TableData>
        <TableData>
          <div class={flex({ gap: '6px', wrap: 'wrap' })}>
            <Button
              color="tertiary"
              size="sm"
              variant="outlined"
              on:click={() => {
                selectedCollection = collection;
                openUpdateCollectionModal = true;
              }}
            >
              수정
            </Button>
            <Button
              color="tertiary"
              size="sm"
              variant="outlined"
              on:click={() => {
                selectedCollection = collection;
                openManageCollectionModal = true;
              }}
            >
              관리
            </Button>
          </div>
        </TableData>
      </TableRow>
    {/each}
  </Table>
</div>
<CreateCollectionModal spaceId={$query.space.id} bind:open={openCreateCollectionModal} />
{#if selectedCollection}
  <ManageCollectionModal
    $collection={selectedCollection}
    $posts={$query.space.posts}
    spaceId={$query.space.id}
    bind:open={openManageCollectionModal}
  />
  <UpdateCollectionModal
    $collection={selectedCollection}
    spaceId={$query.space.id}
    bind:open={openUpdateCollectionModal}
  />
{/if}
