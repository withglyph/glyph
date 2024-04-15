<script lang="ts">
  import { register } from 'swiper/element/bundle';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
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

<div
  class={css(
    {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      size: 'full',
    },
    isomorphicImages.length === 0 && { display: 'none' },
  )}
>
  <button
    bind:this={swiperPrevElem}
    class={css(
      {
        position: 'absolute',
        top: '1/2',
        left: '-40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: { base: 'gray.500', _disabled: 'gray.300' },
        hideBelow: 'sm',
      },
      isomorphicImages.length === 0 && { display: 'none' },
    )}
    type="button"
  >
    <Icon icon={IconChevronLeft} size={24} />
  </button>
  <swiper-container
    bind:this={swiperEl}
    class={css({ position: 'relative', size: 'full' })}
    init="false"
    scrollbar-hide="true"
  >
    {#each isomorphicImages as image (image)}
      <swiper-slide bind:this={swiperSlideEl}>
        <div
          style:background-color={image.kind === 'data' ? image.__data.color : undefined}
          class={css({ size: 'full' })}
        >
          <IsomorphicImage style={css.raw({ objectFit: 'contain', size: 'full' })} {image} />
        </div>
      </swiper-slide>
    {/each}
    {#if slidesPerPage === 2 && isomorphicImages.length % 2 === 1}
      {@const image = isomorphicImages.at(-1)}
      {#if image}
        <swiper-slide bind:this={swiperSlideEl}>
          <div
            style:background-color={image.kind === 'data' ? image.__data.color : undefined}
            class={css({ size: 'full' })}
          />
        </swiper-slide>
      {/if}
    {/if}
  </swiper-container>
  <button
    bind:this={swiperNextElem}
    class={css(
      {
        position: 'absolute',
        top: '1/2',
        right: '-40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: { base: 'gray.500', _disabled: 'gray.300' },
        hideBelow: 'sm',
      },
      isomorphicImages.length === 0 && { display: 'none' },
    )}
    type="button"
  >
    <Icon icon={IconChevronRight} size={24} />
  </button>

  <div
    bind:this={swiperPaginationElem}
    class={css(
      {
        marginTop: '8px',
        fontSize: '10px',
        fontWeight: 'medium',
        color: 'gray.400',
        textAlign: 'right',
        width: 'full',
      },
      isomorphicImages.length === 0 && { display: 'none' },
    )}
  />
</div>

<style>
  swiper-slide {
    height: auto;
  }
</style>
