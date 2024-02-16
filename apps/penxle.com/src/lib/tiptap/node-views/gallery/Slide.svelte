<script lang="ts">
  import clsx from 'clsx';
  import { register } from 'swiper/element/bundle';
  import IsomorphicImage from './IsomorphicImage.svelte';
  import type { SwiperContainer, SwiperSlide } from 'swiper/element-bundle';
  import type { Image_image } from '$glitch';

  type IsomorphicImage = { id: string } & (
    | { kind: 'file'; __file: File }
    | { kind: 'data'; __data: { id: string; name: string } & Image_image }
  );

  export let isomorphicImages: IsomorphicImage[];
  export let slidesPerPage: number;

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
      'absolute top-50% -left-40px flex center z-100 i-lc-chevron-left square-6 text-gray-500 disabled:text-gray-300!',
      isomorphicImages.length === 0 && 'hidden!',
    )}
    type="button"
  />
  <swiper-container bind:this={swiperEl} class="square-full relative" init="false" scrollbar-hide="true">
    {#each isomorphicImages as image (image)}
      <swiper-slide bind:this={swiperSlideEl}>
        <IsomorphicImage class="object-cover" {image} />
      </swiper-slide>
    {/each}
  </swiper-container>
  <button
    bind:this={swiperNextElem}
    class={clsx(
      'absolute top-50% -right-40px flex center z-100 i-lc-chevron-right square-6 text-gray-500 disabled:text-gray-300',
      isomorphicImages.length === 0 && 'hidden!',
    )}
    type="button"
  />

  <div
    bind:this={swiperPaginationElem}
    class={clsx('mt-2 text-right w-full text-10-m text-gray-400', isomorphicImages.length === 0 && 'hidden')}
  />
</div>
