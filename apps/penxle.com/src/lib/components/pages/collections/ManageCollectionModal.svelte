<script lang="ts">
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import mixpanel from 'mixpanel-browser';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { Editable, PopupSearch } from '$lib/components/forms';
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
  export let spaceId: string;

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

  let submitButtonEl: HTMLButtonElement;
  let name: string | null = null;

  $: if (open) {
    name = null;
  }

  $: if (name === null) {
    name = $collection.name;
  }

  let registeredPostIds: Set<string>;
  const initializeRegisteredPosts = () => {
    registeredPostIds = new Set($collection.posts.map(({ id }) => id));
  };

  $: if (open) {
    initializeRegisteredPosts();
  }

  const updateSpaceCollection = graphql(`
    mutation ManageSpaceCollectionModal_UpdateSpaceCollection_Mutation($input: UpdateSpaceCollectionInput!) {
      updateSpaceCollection(input: $input) {
        id
        name
      }
    }
  `);

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
    extra: async () => ({ postIds: [...registeredPostIds.values()] }),
    schema: SetSpaceCollectionPostSchema,
    onSuccess: () => {
      open = false;
      mixpanel.track('space:collection:update', {
        spaceId,
        collectionId: $collection.id,
        postIds: [...registeredPostIds.values()],
      });
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

  $: filteredPosts = $posts.filter((post) => {
    const searchResult = post.publishedRevision?.title.includes(query);
    const isInOtherCollection = !!post.collection && post.collection.id !== $collection.id;

    return searchResult && !isInOtherCollection;
  });
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">
    <form
      on:submit|preventDefault={async (e) => {
        if (name && name.length > 0 && name !== $collection.name) {
          await updateSpaceCollection({
            collectionId: $collection.id,
            name,
            thumbnailId: $collection.thumbnail?.id,
          });
          toast.success('컬렉션 이름이 변경되었어요');
        }

        // @ts-expect-error: currentTarget.name except HTMLInputElement
        if (!('_name' in e.target && e.target._name instanceof HTMLInputElement))
          throw new Error('Fail to access input element');

        e.target._name.blur();
      }}
    >
      <Editable
        name="_name"
        maxlength={20}
        placeholder="컬렉션명"
        bind:value={name}
        on:blur={() => {
          submitButtonEl.click();
        }}
      />
      <button bind:this={submitButtonEl} class="hidden" type="submit" />
    </form>
  </svelte:fragment>
  <svelte:fragment slot="subtitle">
    컬렉션에 노출되는 포스트를 관리하세요
    <br />
    한 포스트 당 한 컬렉션에만 속할 수 있어요
  </svelte:fragment>

  <PopupSearch
    class={clsx('max-w-full! m-b-4', $posts.length === 0 && 'hidden')}
    on:input={(e) => (query = e.currentTarget.value.trim())}
  />
  <form use:form>
    <ul
      class={clsx(
        'flex flex-col gap-4 min-h-10rem max-h-15rem overflow-y-auto',
        filteredPosts.length === 0 && 'justify-center',
      )}
    >
      {#each filteredPosts as post (post.id)}
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
      {:else}
        <article class="flex flex-col text-secondary body-16-m self-center break-keep">
          {$posts.length === 0 ? '아직 스페이스에 업로드된 포스트가 없어요' : '일치하는 검색 결과가 없어요'}
        </article>
      {/each}
    </ul>
    <div class="flex w-full gap-xs m-t-6">
      <Button class="flex-1" disabled={$posts.length === 0} loading={$isSubmitting} size="xl" type="submit">
        저장하기
      </Button>
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
