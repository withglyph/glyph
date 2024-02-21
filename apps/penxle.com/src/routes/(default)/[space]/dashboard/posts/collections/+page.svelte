<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Button, Image } from '$lib/components';
  import {
    CreateCollectionModal,
    ManageCollectionModal,
    UpdateCollectionModal,
  } from '$lib/components/pages/collections';
  import { Table, TableData, TableHead, TableHeader, TableRow } from '$lib/components/table';
  import { toast } from '$lib/notification';

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
          ...SpaceCollectionsEnitityPage_ManageCollectionModal_post
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
          ...SpaceCollectionsEnitityPage_ManageCollectionModal_collection
        }
      }
    }
  `);

  const deleteSpaceCollection = graphql(`
    mutation SpaceSettingCollectionPage_deleteSpaceCollection_Mutation($input: DeleteSpaceCollectionInput!) {
      deleteSpaceCollection(input: $input) {
        id
      }
    }
  `);

  let selectedCollection: (typeof $query.space.collections)[number] | null = null;
  let deleting = false;
</script>

<Helmet description={`${$query.space.name} 스페이스 컬렉션 관리`} title={`컬렉션 관리 | ${$query.space.name}`} />

<div class="flex justify-between gap-2">
  <div class="flex gap-2">
    <Button size="md" on:click={() => (openCreateCollectionModal = true)}>새 컬렉션 생성</Button>
  </div>
</div>

<div class="overflow-y-auto">
  <Table class="text-left border-separate border-spacing-y-0.125rem">
    <TableHeader>
      <TableRow>
        <TableHead>컬렉션</TableHead>
        <TableHead class="<sm:hidden">생성일</TableHead>
        <TableHead>관리</TableHead>
      </TableRow>
    </TableHeader>
    <colgroup>
      <col span="1" />
      <col class="w-8rem <sm:hidden" span="1" />
      <col class="w-11.5rem <sm:w-5rem" span="1" />
    </colgroup>
    {#each $query.space.collections as collection (collection.id)}
      <TableRow>
        <TableData>
          <a class="flex gap-xs" href={`/${$query.space.slug}/collections/${collection.id}`}>
            {#if collection.thumbnail}
              <Image class="w-6rem h-7.5rem rounded-2 shrink-0" $image={collection.thumbnail} />
            {/if}
            <dl class="truncate [&>dt]:truncate">
              <dt class="body-15-b m-b-1">
                {collection.name}
              </dt>
              <dd class="body-13-b text-secondary whitespace-pre-wrap break-keep">{collection.count}개의 포스트</dd>
            </dl>
          </a>
        </TableData>
        <TableData class="body-13-b text-disabled <sm:hidden">{dayjs(collection.createdAt).formatAsDate()}</TableData>
        <TableData>
          <div class="flex gap-2">
            <Button
              class="<sm:hidden"
              color="tertiary"
              size="sm"
              variant="outlined"
              on:click={() => {
                selectedCollection = collection;
                openManageCollectionModal = true;
              }}
            >
              포스트 관리
            </Button>
            <Button
              color="tertiary"
              size="sm"
              variant="outlined"
              on:click={() => {
                selectedCollection = collection;
                openUpdateCollectionModal = true;
              }}
            >
              <span class="<sm:hidden sm:m-r-0.5">컬렉션</span>
              관리
            </Button>
            <Button
              class="p-none! disabled:invisible"
              loading={deleting}
              size="sm"
              variant="text"
              on:click={async () => {
                deleting = true;
                await deleteSpaceCollection({ collectionId: collection.id });
                deleting = false;

                toast.success('컬렉션을 삭제했어요');
              }}
            >
              <i class="i-lc-trash-2 square-4 text-secondary hover:text-action-red-primary" />
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
