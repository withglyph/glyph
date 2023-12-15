<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import clsx from 'clsx';
  import { graphql } from '$glitch';
  import { Button, Image } from '$lib/components';
  import { CreateCollectionModal } from '$lib/components/pages/collections';

  $: query = graphql(`
    query SpaceCollectionsPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name

        collections {
          id
          name
          count
          thumbnail {
            id
            ...Image_image
          }
        }

        meAsMember {
          id
        }
      }
    }
  `);

  let openCreateCollectionModal = false;
</script>

<Helmet title={`컬렉션 | ${$query.space.name}`} />

<div
  class={clsx(
    'min-h-11rem w-full max-w-50rem flex flex-col grow gap-xs <sm:(p-0 gap-2 bg-surface-primary) sm:py-4',
    $query.space.collections.length === 0 && 'center',
  )}
>
  {#if $query.space.collections.length > 0}
    <ul class="space-y-1">
      {#each $query.space.collections as collection (collection.id)}
        <li>
          <a
            class="flex gap-xs p-2 bg-cardprimary sm:(rounded-0.75rem hover:bg-primary focus:bg-primary)"
            href={`/${$query.space.slug}/collections/${collection.id}`}
          >
            {#if collection.thumbnail}
              <Image class="w-6rem h-7.5rem rounded-2" $image={collection.thumbnail} />
            {/if}
            <dl class="p-y-2">
              <dt class="body-16-b m-b-1">{collection.name}</dt>
              <dd class="body-14-m text-secondary">{collection.count}개의 포스트</dd>
            </dl>
          </a>
        </li>
      {/each}
    </ul>

    {#if $query.space.meAsMember}
      <Button
        class="flex gap-2"
        color="tertiary"
        size="lg"
        variant="outlined"
        on:click={() => (openCreateCollectionModal = true)}
      >
        새 컬렉션 추가하기 <i class="i-lc-plus square-5" />
      </Button>
    {/if}
  {:else}
    <div class="flex flex-col center">
      <p class="body-15-b text-secondary">아직 스페이스에 업로드된 컬렉션이 없어요</p>
      {#if $query.space.meAsMember}
        <Button class="mt-5" size="lg" on:click={() => (openCreateCollectionModal = true)}>컬렉션 생성하기</Button>
      {/if}
    </div>
  {/if}
</div>

<CreateCollectionModal spaceId={$query.space.id} bind:open={openCreateCollectionModal} />
