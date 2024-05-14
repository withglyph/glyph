<script lang="ts">
  import { register } from 'swiper/element/bundle';
  import IconArrowLeft from '~icons/tabler/arrow-left';
  import IconArrowRight from '~icons/tabler/arrow-right';
  import IconX from '~icons/tabler/x';
  import { Icon } from '$lib/components';
  import { portal, scrollLock } from '$lib/svelte/actions';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Image from './Image.svelte';
  import type { SwiperContainer } from 'swiper/element-bundle';
  import type { NodeViewProps } from '$lib/tiptap';

  export let open = false;
  export let node: NodeViewProps['node'];

  let swiperEl: SwiperContainer;
  let swiperNextElem: HTMLElement;
  let swiperPrevElem: HTMLElement;
  let swiperPaginationElem: HTMLElement;

  let activeIndex = 0;

  let headerEl: HTMLElement;
  let prevScrollpos = 0;
  let timer: NodeJS.Timeout;

  $: swiperParams = {
    navigation: {
      nextEl: swiperNextElem,
      prevEl: swiperPrevElem,
    },
    pagination: {
      el: swiperPaginationElem,
      type: 'fraction',
    },
    slidesPerView: node.attrs.layout === 'slide-2' ? 2 : 1,
    slidesPerGroup: node.attrs.layout === 'slide-2' ? 2 : 1,
    grabCursor: true,
    spaceBetween: 0,

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

  $: {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (headerEl) {
        headerEl.style.top = '-62px';
      }
    }, 1000);

    [prevScrollpos];
  }
</script>

{#if open}
  <div
    class={flex({
      direction: 'column',
      align: 'center',
      justify: 'flex-start',
      position: 'fixed',
      inset: '0',
      zIndex: '50',
      paddingX: { sm: '96px' },
      backgroundColor: '[#212121]',
      overflow: 'auto',
      scrollbar: 'hidden',
    })}
    data-scroll-lock-ignore
    role="presentation"
    on:scroll={(e) => {
      var currentScrollPos = e.currentTarget.scrollTop;

      headerEl.style.top = prevScrollpos > currentScrollPos ? '0' : '-62px';
      prevScrollpos = currentScrollPos;
    }}
    on:mousemove={() => {
      if (!headerEl) return;

      headerEl.style.top = '0';

      clearTimeout(timer);
      timer = setTimeout(() => {
        headerEl.style.top = '-62px';
      }, 1000);
    }}
    use:portal
    use:scrollLock
  >
    <div
      bind:this={headerEl}
      class={flex({
        align: 'center',
        justify: 'flex-end',
        position: 'fixed',
        top: '0',
        paddingX: '20px',
        paddingY: '15px',
        color: 'gray.300',
        backgroundColor: 'gray.900/50',
        width: 'full',
        height: '62px',
        zIndex: '10',
        transition: 'all',
      })}
    >
      {#if node.attrs.layout === 'slide-1' || node.attrs.layout === 'slide-2'}
        <div
          bind:this={swiperPaginationElem}
          class={css({
            marginRight: 'auto',
            fontSize: { base: '16px', sm: '20px' },
            fontWeight: 'semibold',
            color: 'gray.300',
          })}
        />
      {/if}
      <button type="button" on:click={() => (open = false)}>
        <Icon style={css.raw({ hideFrom: 'sm' })} icon={IconX} size={24} />
        <Icon style={css.raw({ hideBelow: 'sm' })} icon={IconX} size={32} />
      </button>
    </div>
    {#if node.attrs.layout === 'slide-1' || node.attrs.layout === 'slide-2'}
      <div
        class={css({
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          size: 'full',
        })}
        role="presentation"
      >
        <button
          bind:this={swiperPrevElem}
          class={css(
            {
              position: 'absolute',
              top: '1/2',
              left: '-52px',
              translate: 'auto',
              translateY: '-1/2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'full',
              backgroundColor: 'gray.0/40',
              size: '40px',
              zIndex: '10',
              hideBelow: 'sm',
            },
            activeIndex === 0 && { visibility: 'hidden' },
          )}
          type="button"
        >
          <Icon icon={IconArrowLeft} size={24} />
        </button>
        <swiper-container
          bind:this={swiperEl}
          class={css({ position: 'relative', size: 'full' })}
          init="false"
          role="presentation"
          on:keypress={null}
          on:click={() => {
            if (!headerEl) return;

            headerEl.style.top = '0';
            clearTimeout(timer);
            timer = setTimeout(() => {
              headerEl.style.top = '-62px';
            }, 1000);
          }}
        >
          {#each node.attrs.ids as id (id)}
            <swiper-slide>
              <Image {id} style={css.raw({ objectFit: 'contain', size: 'full' })} />
            </swiper-slide>
          {/each}
        </swiper-container>
        <button
          bind:this={swiperNextElem}
          class={css(
            {
              position: 'absolute',
              top: '1/2',
              right: '-52px',
              translate: 'auto',
              translateY: '-1/2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'full',
              backgroundColor: 'gray.0/40',
              size: '40px',
              zIndex: '10',
              hideBelow: 'sm',
            },
            activeIndex === node.attrs.ids.length - (node.attrs.layout === 'slide-2' ? 2 : 1) && {
              visibility: 'hidden',
            },
          )}
          type="button"
        >
          <Icon icon={IconArrowRight} size={24} />
        </button>
      </div>
    {:else}
      <div
        class={css(
          { marginY: 'auto' },
          node.attrs.layout === 'scroll' && { display: 'flex', flexDirection: 'column', alignItems: 'center' },
          node.attrs.layout === 'grid-2' && { display: 'grid', gridTemplateColumns: '2' },
          node.attrs.layout === 'grid-3' && { display: 'grid', gridTemplateColumns: '3' },
        )}
      >
        {#each node.attrs.ids as id (id)}
          <Image
            {id}
            style={css.raw(
              { width: 'full' },
              (node.attrs.layout === 'grid-2' || node.attrs.layout === 'grid-3') && {
                size: 'full',
                objectFit: 'cover',
              },
            )}
          />
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  swiper-slide {
    height: auto;
  }
</style>
