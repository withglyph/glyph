<script lang="ts">
  import 'swiper/css';

  import { onMount } from 'svelte';
  import { register } from 'swiper/element/bundle';
  import { fragment, graphql } from '$glitch';
  import { Button, Image } from '$lib/components';
  import Modal from '$lib/components/Modal.svelte';
  import { comma } from '$lib/utils';
  import LoginRequireModal from '../../LoginRequireModal.svelte';
  import type { JSONContent } from '@tiptap/core';
  import type { SwiperContainer, SwiperSlide } from 'swiper/element-bundle';
  import type { SpacePostPage_GalleryPost_query } from '$glitch';

  let loginRequireOpen = false;
  let pointPurchaseOpen = false;
  let postPurchaseOpen = false;

  let swiperEl: SwiperContainer;
  let swiperSlideEl: SwiperSlide;
  let swiperNextElem: HTMLElement | undefined;
  let swiperPrevElem: HTMLElement | undefined;
  let swiperPaginationElem: HTMLElement | undefined;

  let _query: SpacePostPage_GalleryPost_query;
  export { _query as $query };

  $: query = fragment(
    _query,
    graphql(`
      fragment SpacePostPage_GalleryPost_query on Query {
        me {
          id
        }

        post(permalink: $permalink) {
          id

          revision {
            id
            title
            subtitle
            content
            characterCount
            createdAt
            contentKind
          }
        }
      }
    `),
  );

  register();

  onMount(() => {
    if (swiperEl != undefined) {
      const swiperParams = {
        navigation: {
          nextEl: swiperNextElem,
          prevEl: swiperPrevElem,
        },
        pagination: {
          el: swiperPaginationElem,
          type: 'bullets',
        },
        slidesPerView: 1,
        slidesPerGroupSkip: 1,
        grabCursor: true,
      };

      Object.assign(swiperEl, swiperParams);

      swiperEl.initialize();
      swiperEl.swiper.update();
    }
  });

  const purchasePost = graphql(`
    mutation SpacePostPage_GalleryPost_PurchasePost_Mutation($input: PurchasePostInput!) {
      purchasePost(input: $input) {
        id

        revision {
          id
          content
        }
      }
    }
  `);

  $: data = $query.post.revision.content.content.find((c: JSONContent) => c.type === 'access_barrier');

  $: accessBarrierIndex = $query.post.revision.content.content.findIndex(
    (c: JSONContent) => c.type === 'access_barrier',
  );

  $: images = $query.post.revision.content.content.filter((c: JSONContent) => {
    if (c.type === 'access_barrier' && !c.attrs?.__data.purchasable) return false;

    return c;
  });
</script>

<div class="max-w-187.5">
  <swiper-container
    bind:this={swiperEl}
    class="square-[calc(100vw-32px)] max-w-187.5 max-h-187.5 rounded-xl mb-4"
    init="false"
  >
    {#each images as node, index (index)}
      {#if node.type !== 'paragraph'}
        <swiper-slide
          bind:this={swiperSlideEl}
          class="square-[calc(100vw-32px)] max-w-187.5 max-h-187.5 relative [&>button]:hover:opacity-100 rounded-xl"
        >
          {#if node.type === 'image'}
            <div class="relative">
              <Image
                class="square-[calc(100vw-32px)] max-w-187.5 max-h-187.5 bg-black rounded-xl select-none"
                $image={node.attrs.__data}
                fit="contain"
              />

              {#if accessBarrierIndex !== -1 && index > accessBarrierIndex}
                <p
                  class="absolute bottom-0 h-9.5 bg-alphagray-50 text-center text-darkprimary body-13-m w-full rounded-b-xl flex center"
                >
                  결제된 포스트
                </p>
              {/if}
            </div>
          {:else if node.type === 'access_barrier' && node.attrs.__data.purchasable}
            <div class="flex center square-[calc(100vw-32px)] max-w-187.5 max-h-187.5 rounded-xl bg-gray-80 px-10">
              <div class="flex flex-col w-full max-w-100 center space-y-2.5 bg-primary rounded-2xl py-8 px-2.5">
                <p class="body-15-sb text-secondary">
                  이 뒤에 {node.attrs.__data.counts.images}개의 사진이 더 있어요!
                </p>
                <p class="body-16-eb">{comma(node.attrs.price)}P</p>
                <Button
                  size="lg"
                  on:click={() => {
                    if (!$query.me) {
                      loginRequireOpen = true;
                      return;
                    }

                    if (node.attrs.__data.point < node.attrs.price) {
                      pointPurchaseOpen = true;
                    } else {
                      postPurchaseOpen = true;
                    }
                  }}
                >
                  유료분량 구매하기
                </Button>
              </div>
            </div>
          {/if}
          <button
            bind:this={swiperPrevElem}
            class="opacity-0 absolute top-50% left-2 square-10 rounded-6 bg-alphagray-50 flex center p-3 transition sm:left-5"
            type="button"
            on:click={() => {
              if (swiperEl.swiper.clickedIndex === $query.post.revision.content.length - 1) {
                swiperEl.swiper.slideTo(swiperEl.swiper.clickedIndex, 500);
              } else {
                swiperEl.swiper.slidePrev(500);
              }
              swiperEl.swiper.update();
            }}
          >
            <i class="i-lc-chevron-left square-6 text-white" />
          </button>
          <button
            bind:this={swiperNextElem}
            class="opacity-0 absolute top-50% right-2 square-10 rounded-6 bg-alphagray-50 flex center p-3 transition sm:right-5"
            type="button"
            on:click={() => {
              swiperEl.swiper.slideNext(500);
              swiperEl.swiper.update();
            }}
          >
            <i class="i-lc-chevron-right square-6 text-white" />
          </button>
        </swiper-slide>
      {/if}
    {/each}
  </swiper-container>

  <div bind:this={swiperPaginationElem} class="w-full flex center" />

  {#if $query.post.revision.content.content?.[0].type === 'paragraph'}
    <p class="bodylong-16-m whitespace-pre-wrap break-all mt-6 select-none">
      {$query.post.revision.content.content[0].content[0].text ?? ''}
    </p>
  {/if}
</div>

<LoginRequireModal bind:open={loginRequireOpen} />

<Modal size="sm" bind:open={pointPurchaseOpen}>
  <svelte:fragment slot="title">보유중인 포인트가 부족해요</svelte:fragment>
  <svelte:fragment slot="subtitle">보유중인 포인트 : {comma(data.attrs.__data.point)}P</svelte:fragment>

  <div slot="action" class="w-full flex gap-3">
    <Button class="w-full" color="secondary" size="xl" on:click={() => (pointPurchaseOpen = false)}>돌아가기</Button>
    <Button class="w-full" href="/point/purchase" size="xl" type="link">충전하기</Button>
  </div>
</Modal>

<Modal size="sm" bind:open={postPurchaseOpen}>
  <svelte:fragment slot="title">
    {comma(data.attrs.price)}P를 사용하여
    <br />
    포스트를 구매하시겠어요?
  </svelte:fragment>
  <svelte:fragment slot="subtitle">보유중인 포인트 : {comma(data.attrs.__data.point)}P</svelte:fragment>

  <div slot="action" class="w-full flex gap-3">
    <Button class="w-full" color="secondary" size="xl" on:click={() => (postPurchaseOpen = false)}>돌아가기</Button>
    <Button
      class="w-full"
      size="xl"
      on:click={async () => {
        await purchasePost({
          postId: $query.post.id,
          revisionId: $query.post.revision.id,
        });

        swiperEl.swiper.update();
        postPurchaseOpen = false;
      }}
    >
      구매하기
    </Button>
  </div>
</Modal>
