<script lang="ts">
  import dayjs from 'dayjs';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { PopupSearch } from '$lib/components/forms';
  import Image from '$lib/components/Image.svelte';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { SetSpaceCollectionPostSchema } from '$lib/validations';
  import type {
    SpaceCollectionsEnitityPage_ManageCollectionModal_collection,
    SpaceCollectionsEnitityPage_ManageCollectionModal_post,
  } from '$glitch';

  $: slug = $page.params.space;

  let _collection: SpaceCollectionsEnitityPage_ManageCollectionModal_collection;
  let _posts: SpaceCollectionsEnitityPage_ManageCollectionModal_post[];
  export { _collection as $collection, _posts as $posts };
  export let open = false;

  let query = '';

  $: posts = fragment(
    _posts,
    graphql(`
      fragment SpaceCollectionsEnitityPage_ManageCollectionModal_post on Post {
        id

        permalink

        collection {
          id
        }

        publishedAt

        publishedRevision @_required {
          id
          title

          croppedThumbnail {
            ...Image_image
          }
        }
      }
    `),
  );

  $: collection = fragment(
    _collection,
    graphql(`
      fragment SpaceCollectionsEnitityPage_ManageCollectionModal_collection on SpaceCollection {
        id
        name
        thumbnail {
          id

          ...Image_image
        }
        posts {
          id
        }
      }
    `),
  );

  let registeredPostIds: Set<string>;
  const initializeRegisteredPosts = () => {
    registeredPostIds = new Set($collection.posts.map(({ id }) => id));
  };

  $: if (open) {
    initializeRegisteredPosts();
  }

  const { form, setInitialValues, isSubmitting } = createMutationForm({
    mutation: graphql(`
      mutation SpaceCollectionsEnitityPage_ManageCollectionModal_SetSpaceCollectionPosts_Mutation(
        $input: SetSpaceCollectionPostsInput!
      ) {
        setSpaceCollectionPosts(input: $input) {
          id
        }
      }
    `),
    extra: () => ({ postIds: [...registeredPostIds.values()] }),
    schema: SetSpaceCollectionPostSchema,
    onSuccess: () => {
      open = false;
      toast.success('컬렉션에 등록된 포스트 목록을 수정되었어요');
    },
  });

  $: setInitialValues({ collectionId: $collection.id, postIds: [] });

  const registerPost = (postId: string) => {
    registeredPostIds.add(postId);
    registeredPostIds = registeredPostIds;
  };
  const removePost = async (postId: string) => {
    registeredPostIds.delete(postId);
    registeredPostIds = registeredPostIds;
  };
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">{$collection.name}</svelte:fragment>
  <svelte:fragment slot="subtitle">
    컬렉션에 노출되는 포스트를 관리하세요
    <br />
    한 포스트 당 한 컬렉션에만 속할 수 있어요
  </svelte:fragment>

  <PopupSearch class="max-w-full! m-b-4" on:input={(e) => (query = e.currentTarget.value.trim())} />
  <form use:form>
    <ul class="space-y-4 sm:(max-h-27.5rem overflow-y-auto)">
      {#each $posts.filter((post) => {
        const searchResult = post.publishedRevision?.title.includes(query);
        const isInOtherCollection = !!post.collection && post.collection.id !== $collection.id;

        return searchResult && !isInOtherCollection;
      }) as post (post.id)}
        <li class="flex items-center justify-between">
          <a class="flex gap-2 items-center truncate mr-2" href="/{slug}/{post.permalink}">
            {#if post.publishedRevision?.croppedThumbnail}
              <Image class="square-10.5 rounded-lg grow-0 shrink-0" $image={post.publishedRevision.croppedThumbnail} />
            {/if}
            <div class="truncate">
              <p class="body-17-b truncate grow">{post.publishedRevision?.title}</p>
              <time class="body-15-m text-secondary truncate" datetime={post.publishedAt}>
                {dayjs(post.publishedAt).formatAsDate()}
              </time>
            </div>
          </a>
          {#if registeredPostIds.has(post.id)}
            <Button class="shrink-0" color="tertiary" size="md" variant="outlined" on:click={() => removePost(post.id)}>
              해제
            </Button>
          {:else}
            <Button class="shrink-0" color="secondary" size="md" on:click={() => registerPost(post.id)}>추가</Button>
          {/if}
        </li>
      {/each}
    </ul>
    <div class="flex w-full gap-xs m-t-6">
      <Button class="flex-1" loading={$isSubmitting} size="xl" type="submit">저장하기</Button>
      <Button
        color="tertiary"
        size="xl"
        variant="outlined"
        on:click={() => {
          open = false;
        }}
      >
        닫기
      </Button>
    </div>
  </form>
</Modal>
