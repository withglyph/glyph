<script lang="ts">
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Button, Image, Modal } from '$lib/components';
  import { CreateCollectionModal, UpdateCollectionModal } from '$lib/components/pages/collections';
  import { PostManageTable } from '$lib/components/pages/posts';
  import { Table, TableData, TableHead, TableRow } from '$lib/components/table';
  import { toast } from '$lib/notification';

  let openPostManageModal = false;
  let openCreateCollectionModal = false;
  let openUpdateCollectionModal = false;

  $: query = graphql(`
    query SpaceSettingCollectionPage_Query($slug: String!) {
      space(slug: $slug) {
        id

        slug

        meAsMember {
          id
          ...PostManageTable_SpaceMember
        }

        collections {
          id

          name
          count
          createdAt

          thumbnail {
            ...Image_image
          }

          posts {
            ...PostManageTable_Post_query
          }

          ...PostManageTable_Collection
          ...UpdateCollectionModal_Collection_query
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

  let selectedCollectionId: string | null = null;
  let selectedCollection: (typeof $query.space.collections)[number] | null = null;
  let deleting = false;

  $: if (selectedCollectionId) {
    selectedCollection = $query.space.collections.find((collection) => collection.id === selectedCollectionId) ?? null;
  }
</script>

<div class="flex justify-between gap-2">
  <div class="flex gap-2">
    <Button size="md" on:click={() => (openCreateCollectionModal = true)}>새 컬렉션 생성</Button>
  </div>
</div>

<div class="overflow-y-auto">
  <Table class="text-left border-separate border-spacing-y-0.125rem">
    <TableRow>
      <TableHead>컬렉션</TableHead>
      <TableHead class="<sm:hidden">생성일</TableHead>
      <TableHead>관리</TableHead>
    </TableRow>
    <colgroup>
      <col class="w-50%" span="1" />
      <col class="w-15% <sm:hidden" span="1" />
      <col class="w-15% <sm:w-35%" span="1" />
    </colgroup>
    {#each $query.space.collections as collection (collection.id)}
      <TableRow>
        <TableData>
          <a class="flex gap-xs" href={`/${$query.space.slug}/collections/${collection.id}`}>
            {#if collection.thumbnail}
              <Image class="w-6rem h-7.5rem rounded-2" $image={collection.thumbnail} />
            {/if}
            <dl class="truncate [&>dt]:truncate">
              <dt class="body-15-b m-b-1">
                {collection.name}
              </dt>
              <dd class="body-13-b text-secondary">{collection.count}개의 포스트</dd>
            </dl>
          </a>
        </TableData>
        <TableData class="body-13-b text-disabled <sm:hidden">{dayjs(collection.createdAt).formatAsDate()}</TableData>
        <TableData>
          <div class="flex gap-2">
            <Button
              class="<sm:hidden disabled:invisible"
              color="tertiary"
              disabled={collection.posts.length === 0}
              size="sm"
              variant="outlined"
              on:click={() => {
                selectedCollectionId = collection.id;
                openPostManageModal = true;
              }}
            >
              포스트 관리
            </Button>
            <Button
              color="tertiary"
              size="sm"
              variant="outlined"
              on:click={() => {
                selectedCollectionId = collection.id;
                openUpdateCollectionModal = true;
              }}
            >
              <span class="<sm:hidden">컬렉션</span>
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
  <Modal size="lg" bind:open={openPostManageModal}>
    <svelte:fragment slot="title">포스트 관리</svelte:fragment>
    <PostManageTable
      $collections={$query.space.collections}
      $posts={selectedCollection.posts}
      $spaceMember={$query.space.meAsMember ?? null}
      type="space"
    />
  </Modal>
  <UpdateCollectionModal $collection={selectedCollection} bind:open={openUpdateCollectionModal} />
{/if}
