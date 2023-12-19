<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import mixpanel from 'mixpanel-browser';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Button, Image } from '$lib/components';
  import { ManageCollectionModal } from '$lib/components/pages/collections';
  import { toast } from '$lib/notification';
  import LoginRequireModal from '../../../../LoginRequireModal.svelte';
  import Feed from '../../Feed.svelte';

  let openPostManageCollectionModal = false;
  let loginRequireOpen = false;

  $: query = graphql(`
    query SpaceCollectionsEnitityPage_Query($slug: String!) {
      me {
        id
      }

      space(slug: $slug) {
        id
        slug
        name
        followed

        posts {
          id
          collection {
            id
          }

          ...SpaceCollectionsEnitityPage_ManageCollectionModal_post
        }

        icon {
          ...Image_image
        }

        description

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

  const followSpace = graphql(`
    mutation SpaceCollectionPage_FollowSpace_Mutation($input: FollowSpaceInput!) {
      followSpace(input: $input) {
        id
        followed
      }
    }
  `);

  const unfollowSpace = graphql(`
    mutation SpaceCollectionPage_UnfollowSpace_Mutation($input: UnfollowSpaceInput!) {
      unfollowSpace(input: $input) {
        id
        followed
      }
    }
  `);
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

  <article class="sm:p-x-6 w-full flex flex-1">
    <div class="max-w-75rem m-x-auto w-full flex sm:(m-y-2.25rem gap-8) <sm:(flex-col gap-2)">
      {#if collection?.count}
        <ul class="sm:max-w-[calc(100%-18.4375rem)] <sm:space-y-2 flex-1 space-y-8">
          {#each collection.posts as post (post.id)}
            <li><Feed $post={post} /></li>
          {/each}
        </ul>
      {:else}
        <section class="sm:max-w-[calc(100%-18.4375rem)] <sm:min-h-20rem flex flex-col center flex-1 space-y-8">
          <div class="body-15-sb text-center break-keep">아직 컬렉션에 추가된 포스트가 없어요</div>
          {#if $query.space.meAsMember && !$query.space.posts.every((post) => post.collection?.id)}
            <Button
              size="lg"
              on:click={() => {
                openPostManageCollectionModal = true;
              }}
            >
              포스트 추가하기
            </Button>
          {/if}
        </section>
      {/if}

      <aside class="max-w-18.4375rem <sm:max-w-initial w-full">
        <section class="flex sm:flex-col p-6 <sm:(p-y-4 gap-4) sm:(bg-primary rounded-4 m-b-4) bg-cardprimary center">
          <Image class="square-3.75rem <sm:square-4rem rounded-4 sm:m-b-4 shrink-0" $image={$query.space.icon} />
          <hgroup class="sm:(text-center w-full m-b-2) flex-1 break-keep">
            <a class="flex sm:center m-b-2" href="/{$query.space?.slug}">
              <h2 class="subtitle-18-eb <sm:body-15-b leading-5">
                {$query.space.name}
              </h2>
              <i class="i-lc-chevron-right text-icon-secondary square-5 <sm:hidden" />
            </a>
            <p class="body-15-sb <sm:body-14-m text-secondary whitespace-pre-wrap">
              {$query.space.description ?? ''}
            </p>
          </hgroup>
          {#if !$query.space.meAsMember}
            {#if $query.space.followed}
              <Button
                class="rounded-12! shrink-0"
                color="tertiary"
                size="md"
                variant="outlined"
                on:click={async () => {
                  await unfollowSpace({ spaceId: $query.space.id });
                  mixpanel.track('space:unfollow', { spaceId: $query.space.id, via: 'collection' });
                  toast.success('관심 스페이스 해제되었어요');
                }}
              >
                관심 해제
              </Button>
            {:else}
              <Button
                class="rounded-12! shrink-0"
                size="md"
                on:click={async () => {
                  if (!$query.me) {
                    loginRequireOpen = true;
                    return;
                  }

                  await followSpace({ spaceId: $query.space.id });
                  mixpanel.track('space:follow', { spaceId: $query.space.id, via: 'collection' });
                  toast.success('관심 스페이스로 등록되었어요');
                }}
              >
                + 관심
              </Button>
            {/if}
          {/if}
        </section>
        <section class="<sm:(bg-cardprimary p-y-2 p-x-4 m-t-2)">
          {#if $query.space.collections.length > 1}
            <h2 class="body-14-b m-b-2 <sm:m-b-3">이 스페이스의 다른 컬렉션</h2>

            <ul class="sm:space-y-1 <sm:(flex gap-xs overflow-x-auto)">
              {#each $query.space.collections as collection (collection.id)}
                {#if collection.id !== collectionId}
                  <li>
                    <a
                      class="flex <sm:(flex-col w-7.5rem) gap-xs p-2 sm:(hover:bg-primary focus:bg-primary) rounded-3 <sm:rounded-none"
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
          {/if}
        </section>
      </aside>
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

<LoginRequireModal bind:open={loginRequireOpen} />
