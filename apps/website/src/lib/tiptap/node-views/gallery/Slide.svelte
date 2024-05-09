<script lang="ts">
  import { register } from 'swiper/element/bundle';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
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

  let activeIndex = 0;
  let totalIndex = isomorphicImages.length;

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

    on: {
      slideChangeTransitionEnd: () => {
        activeIndex = swiperEl.swiper.activeIndex;
      },
    },
  };

  register();

  $: if (swiperEl) {
    Object.assign(swiperEl, swiperParams);
    swiperEl.initialize();
    swiperEl.swiper.update();
  }

  let timeout: NodeJS.Timeout;

  const revealElement = (element: HTMLElement) => {
    element.style.display = 'flex';
  };

  const hideElement = (element: HTMLElement) => {
    element.style.display = 'none';
  };
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
  role="presentation"
  on:mouseenter={() => {
    revealElement(swiperPrevElem);
    revealElement(swiperNextElem);
    revealElement(swiperPaginationElem);
    timeout = setTimeout(() => {
      hideElement(swiperPrevElem);
      hideElement(swiperNextElem);
      hideElement(swiperPaginationElem);
    }, 1500);
  }}
  on:mousemove={() => {
    revealElement(swiperPrevElem);
    revealElement(swiperNextElem);
    revealElement(swiperPaginationElem);
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      hideElement(swiperPrevElem);
      hideElement(swiperNextElem);
      hideElement(swiperPaginationElem);
    }, 1500);
  }}
  on:mouseleave={() => {
    hideElement(swiperPrevElem);
    hideElement(swiperNextElem);
    hideElement(swiperPaginationElem);
    clearTimeout(timeout);
  }}
>
  <div
    bind:this={swiperPaginationElem}
    class={css(
      {
        position: 'absolute',
        top: '14px',
        left: '14px',
        display: 'none',
        gap: '1px',
        borderRadius: 'full',
        paddingY: { base: '1px', sm: '3px' },
        paddingX: { base: '8px', sm: '10px' },
        fontSize: { base: '11px', sm: '13px' },
        color: 'gray.5',
        backgroundColor: 'gray.900/20',
        zIndex: '2',
      },
      isomorphicImages.length === 0 && { display: 'none' },
    )}
  />

  <button
    bind:this={swiperPrevElem}
    class={css(
      {
        position: 'absolute',
        top: '1/2',
        translate: 'auto',
        translateY: '-1/2',
        left: '14px',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        color: { base: 'gray.50', _disabled: 'gray.300' },
        backgroundColor: { base: 'gray.800/20', _disabled: 'gray.800/10' },
        size: '24px',
        zIndex: '2',
      },
      isomorphicImages.length === 0 && { display: 'none' },
    )}
    type="button"
  >
    <Icon icon={IconChevronLeft} size={20} />
  </button>
  <swiper-container bind:this={swiperEl} class={css({ position: 'relative', size: 'full' })} init="false">
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
        translate: 'auto',
        translateY: '-1/2',
        right: '14px',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        color: { base: 'gray.50', _disabled: 'gray.300' },
        backgroundColor: { base: 'gray.800/20', _disabled: 'gray.800/10' },
        size: '24px',
        zIndex: '2',
      },
      isomorphicImages.length === 0 && { display: 'none' },
    )}
    type="button"
  >
    <Icon icon={IconChevronRight} size={20} />
  </button>

  <div
    class={flex({
      align: 'center',
      gap: '6px',
      marginTop: '8px',
      paddingTop: '8px',
      paddingX: '4px',
      paddingBottom: '10px',
    })}
  >
    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
    {#each Array.from( { length: Math.ceil(totalIndex / slidesPerPage) > 5 ? 5 : Math.ceil(totalIndex / slidesPerPage) }, ) as _, i (i)}
      {@const index = i * slidesPerPage}
      {@const minus = Math.floor(totalIndex / slidesPerPage) > 5 ? 5 : Math.floor(totalIndex / slidesPerPage)}
      <div
        class={css(
          { size: '6px', backgroundColor: 'gray.300', borderRadius: 'full' },
          ((i < 2 && index === activeIndex) ||
            (i === 2 && activeIndex - index >= 0 && activeIndex - index <= totalIndex - minus) ||
            (i === 3 && activeIndex - index >= 0 && activeIndex - index === totalIndex - minus) ||
            (i === 4 && activeIndex - index >= 0 && activeIndex - index === totalIndex - minus)) && {
            size: '8px',
            backgroundColor: 'gray.800',
          },
        )}
      />
    {/each}
  </div>
</div>

<style>
  swiper-slide {
    height: auto;
  }
</style>
