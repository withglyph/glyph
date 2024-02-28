<script lang="ts">
  import clsx from 'clsx';
  import { register } from 'swiper/element/bundle';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { Icon } from '$lib/components';
  import IsomorphicImage from './IsomorphicImage.svelte';
  import type { SwiperContainer, SwiperSlide } from 'swiper/element-bundle';
  import type { Image_image } from '$glitch';

  type IsomorphicImage = { id: string } & (
    | { kind: 'file'; __file: File }
    | { kind: 'data'; __data: { id: string; name: string; color: string } & Image_image }
  );

  export let isomorphicImages: IsomorphicImage[];
  export let slidesPerPage: number;
  export let spacing: boolean;

  let swiperEl: SwiperContainer;
  let swiperSlideEl: SwiperSlide;
  let swiperNextElem: HTMLElement;
  let swiperPrevElem: HTMLElement;
  let swiperPaginationElem: HTMLElement;

  $: swiperParams = {
    navigation: {
      nextEl: swiperNextElem,
      prevEl: swiperPrevElem,
    },
    pagination: {
      el: swiperPaginationElem,
      type: 'fraction',
    },
    slidesPerView: slidesPerPage,
    slidesPerGroup: slidesPerPage,
    grabCursor: true,
    spaceBetween: spacing ? 6 : 0,
  };

  register();

  $: if (swiperEl) {
    Object.assign(swiperEl, swiperParams);
    swiperEl.initialize();
    swiperEl.swiper.update();

    register();
  }
</script>

<div class={clsx('relative flex flex-col center square-full', isomorphicImages.length === 0 && 'hidden!')}>
  <button
    bind:this={swiperPrevElem}
    class={clsx(
      'absolute top-50% -left-40px flex center text-gray-500 disabled:text-gray-300! <sm:hidden',
      isomorphicImages.length === 0 && 'hidden!',
    )}
    type="button"
  >
    <Icon class="square-6" icon={IconChevronLeft} />
  </button>
  <swiper-container bind:this={swiperEl} class="square-full relative" init="false" scrollbar-hide="true">
    {#each isomorphicImages as image (image)}
      <swiper-slide bind:this={swiperSlideEl}>
        <div style:background-color={image.kind === 'data' ? image.__data.color : undefined} class="square-full">
          <IsomorphicImage class="object-contain square-full" {image} />
        </div>
      </swiper-slide>
    {/each}
    {#if slidesPerPage === 2 && isomorphicImages.length % 2 === 1}
      {@const image = isomorphicImages.at(-1)}
      {#if image}
        <swiper-slide bind:this={swiperSlideEl}>
          <div style:background-color={image.kind === 'data' ? image.__data.color : undefined} class="square-full" />
        </swiper-slide>
      {/if}
    {/if}
  </swiper-container>
  <button
    bind:this={swiperNextElem}
    class={clsx(
      'absolute top-50% -right-40px flex center text-gray-500 disabled:text-gray-300 <sm:hidden',
      isomorphicImages.length === 0 && 'hidden!',
    )}
    type="button"
  >
    <Icon class="square-6" icon={IconChevronRight} />
  </button>

  <div
    bind:this={swiperPaginationElem}
    class={clsx('mt-2 text-right w-full text-10-m text-gray-400', isomorphicImages.length === 0 && 'hidden')}
  />
</div>

<style>
  swiper-slide {
    height: auto;
  }
</style>
