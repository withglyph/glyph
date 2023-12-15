<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Button, Image } from '$lib/components';
  import { ManageCollectionModal } from '$lib/components/pages/collections';
  import Feed from '../../Feed.svelte';

  let openPostManageCollectionModal = false;

  $: query = graphql(`
    query SpaceCollectionsEnitityPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name

        posts {
          id

          ...SpaceCollectionsEnitityPage_ManageCollectionModal_post
        }

        collections {
          id
          name
          count
          thumbnail {
            id
            url
            ...Image_image
          }

          posts {
            id
            ...SpaceFeed_post
          }

          ...SpaceCollectionsEnitityPage_ManageCollectionModal_collection
        }

        meAsMember {
          id
        }
      }
    }
  `);
  $: collectionId = $page.params.entity;
  $: collection = $query.space.collections.find(({ id }) => id === collectionId);
</script>

<Helmet title={`${collection?.name} | 컬렉션 | ${$query.space.name}`} />

<section class="flex flex-col items-center w-full sm:bg-cardprimary grow">
  <header
    style={typeof collection?.thumbnail?.url === 'string'
      ? `background-image: linear-gradient(transparent, rgba(0, 0, 0, 0.8)), url(${collection.thumbnail.url})`
      : ''}
    class="w-full h-12.875rem p-x-6 p-y-6 flex justify-center items-end text-darkprimary bg-(cover center no-repeat alphagray-50)"
  >
    <div class="max-w-75rem flex-1">
      <a class="body-14-sb" href="/{$query.space?.slug}">{$query.space.name}</a>
      <h1 class="title-20-b m-b-2">{collection?.name}</h1>
      <div class="max-w-75rem w-full self-center flex justify-between items-center flex-wrap gap-1">
        <p class="body-14-m">
          <i class="i-px-document-align-left square-4 m-r-1 align-sub" />
          {collection?.count}개의 포스트
        </p>
        {#if $query.space.meAsMember}
          <div class="flex flex-wrap gap-2" role="group">
            <Button
              class="flex gap-1 text-darkprimary! disabled:invisible"
              color="tertiary"
              size="sm"
              variant="outlined"
              on:click={() => {
                openPostManageCollectionModal = true;
              }}
            >
              포스트 관리 <i class="i-lc-list" />
            </Button>
            <Button
              class="flex gap-1 text-darkprimary! disabled:invisible"
              color="tertiary"
              href="/{$query.space.slug}/dashboard/posts/collections"
              size="sm"
              type="link"
              variant="outlined"
            >
              컬렉션 관리 <i class="i-lc-settings" />
            </Button>
          </div>
        {/if}
      </div>
    </div>
  </header>

  <article class="sm:p-x-6">
    <div class="max-w-75rem m-x-auto w-full flex gap-8 sm:m-t-2.25rem">
      <ul class="sm:max-w-[calc(100%-18.4375rem)] flex-1 space-y-8 <sm:space-y-2">
        {#if collection}
          {#each collection.posts as post (post.id)}
            <li><Feed $post={post} /></li>
          {/each}
        {/if}
      </ul>

      {#if $query.space.collections.length > 1}
        <aside class="<sm:hidden">
          <h2 class="body-14-b m-b-2">이 스페이스의 다른 컬렉션</h2>

          <ul class="w-18.4375rem space-y-1">
            {#each $query.space.collections as collection (collection.id)}
              {#if collection.id !== collectionId}
                <li>
                  <a
                    class="flex gap-xs p-2 hover:bg-primary focus:bg-primary rounded-3"
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
              {/if}
            {/each}
          </ul>
        </aside>
      {/if}
    </div>
  </article>
</section>

{#if collection}
  <ManageCollectionModal
    $collection={collection}
    $posts={$query.space.posts}
    bind:open={openPostManageCollectionModal}
  />
{/if}
