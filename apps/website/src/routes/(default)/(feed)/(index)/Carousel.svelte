<script lang="ts">
  import { DragGesture } from '@use-gesture/vanilla';
  import qs from 'query-string';
  import { onMount } from 'svelte';
  import { expoInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import IconArrowLeft from '~icons/tabler/arrow-left';
  import IconArrowRight from '~icons/tabler/arrow-right';
  import { fragment, graphql } from '$glitch';
  import { Icon } from '$lib/components';
  import { css, cx } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type { Carousel_slides } from '$glitch';

  let _query: Carousel_slides;
  export { _query as $query };

  $: slides = fragment(
    _query,
    graphql(`
      fragment Carousel_slides on Query {
        banners {
          id
          title
          subtitle
          bottomline
          color
          backgroundImageUrl
          href
        }
      }
    `),
  );

  const nl2br = (html: string) => {
    return html
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll(String.raw`\n`, '<br>');
  };

  // type Slide = {
  //   title: string;
  //   subtitle: string;
  //   bottomline?: string;
  //   color: string;
  //   backgroundImageUrl: string;
  //   href: string;
  // };

  // const slides: Slide[] = [
  // {
  //   title: '주간창작 챌린지!',
  //   subtitle: '주간창작 챌린지와 함께 꾸준히 창작해요!',
  //   color: '#1717175A',
  //   backgroundImageUrl: 'https://glyph.pub/images/_/banner_challenge_3.png',
  //   href: '/glyph/1181236146',
  // },
  //   {
  //     title: '6월 18일 업데이트 노트',
  //     subtitle: '유료 콘텐츠를 원하는\n방식으로 배포하는 새로운 방법: 리딤코드',
  //     color: '#1717175A',
  //     backgroundImageUrl: 'https://glyph.pub/images/_/banner_updates_2.png',
  //     href: '/glyph/1680725636',
  //   },
  //   {
  //     title: '<정산 기능 업데이트>',
  //     subtitle: '창작자를 위한 정산 수수료 0%',
  //     color: '#1717175A',
  //     backgroundImageUrl: 'https://glyph.pub/images/_/banner_settlement.png',
  //     href: '/glyph/1858282558',
  //   },
  //   {
  //     title: '펜슬이 글리프로 바뀌었어요',
  //     subtitle: '리브랜딩 이야기',
  //     color: '#504C575A',
  //     backgroundImageUrl: 'https://glyph.pub/images/_/banner_rebranding_2.png',
  //     href: '/glyph/1433497915',
  //   },
  //   {
  //     title: '시즌 2 컴백!\n<나의 밤을 그대에게>',
  //     subtitle: '신을 섬기는 기사와, 그를 사랑하게 된 악마',
  //     bottomline: 'ⓒ유씨',
  //     color: '#9FAAA8',
  //     backgroundImageUrl: 'https://glyph.pub/images/_/banner_uc2.png',
  //     // spell-checker:disable-next-line
  //     href: '/uc/collections/xlcu0otv80zl6z47',
  //   },
  //   {
  //     title: '트위터 프로필 연동하고\n포인트 받아가세요',
  //     subtitle: '2000P 적립 이벤트',
  //     color: '#124B8E5A',
  //     backgroundImageUrl: 'https://glyph.pub/images/_/banner_twitter_events_2.png',
  //     href: '/glyph/677483040',
  //   },
  // ];

  $: repeatableSlides = [...$slides.banners, $slides.banners[0], $slides.banners[1 % $slides.banners.length]];

  const value = tweened(0, { duration: 1000, easing: expoInOut });
  $: currentIdx = Math.floor($value);
  $: progress = $value - currentIdx;

  let containerEl: HTMLDivElement;
  let timer: NodeJS.Timeout | null = null;

  onMount(() => {
    const gesture = new DragGesture(
      containerEl,
      (state) => {
        const movement = state.movement[0];
        const velocity = state.velocity[0];

        if (velocity < 0.5) {
          return;
        }

        if (movement >= 50) {
          previous();
        } else if (movement <= -50) {
          next();
        }
      },
      { axis: 'x' },
    );

    setTimer();

    return () => {
      gesture.destroy();

      if (timer) {
        clearTimeout(timer);
      }
    };
  });

  const setTimer = () => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setInterval(next, 10_000);
  };

  let transitioning = false;
  const transition = async (fn: () => Promise<void>) => {
    if (transitioning) {
      return;
    }

    transitioning = true;
    try {
      await fn();
      setTimer();
    } finally {
      transitioning = false;
    }
  };

  const next = async () => {
    await transition(async () => {
      await value.update((v) => (v + 1) % repeatableSlides.length);
      if ($value === repeatableSlides.length - 2) {
        await value.set(0, { duration: 0 });
      }
    });
  };

  const previous = async () => {
    await transition(async () => {
      if ($value === 0) {
        await value.set(repeatableSlides.length - 2, { duration: 0 });
      }
      await value.update((v) => (v - 1 + repeatableSlides.length) % repeatableSlides.length);
    });
  };
</script>

<div
  class={css({
    position: 'relative',
    marginX: '-4px', // 캐러셀에 생기는 좌우 마진 4px씩 역보정
    smDown: { marginRight: '-20px' }, // 상위 컨테이너에서 주는 패딩 20px 무시하고 스크린 끝까지 width 확보
  })}
>
  <div
    class={cx(
      css({
        width: 'full',
        height: { base: '320px', sm: '380px' },
        overflow: 'hidden',
      }),
      'peer',
    )}
  >
    <div
      bind:this={containerEl}
      class={flex({
        height: 'full',
        smDown: { marginRight: '-80px' }, // 다음 슬라이드 100px에서 20px로 줄이기 (나머지 80px를 화면 밖으로 밀어냄)
        touchAction: 'pan-y',
        userSelect: 'none',
      })}
    >
      {#each repeatableSlides as slide, idx (idx)}
        <div
          style:flex-grow={idx === currentIdx ? `${1 - progress}` : idx === currentIdx + 1 ? `${progress}` : '0'}
          style:flex-basis={idx === currentIdx + 1 ? '100px' : idx === currentIdx + 2 ? `${100 * progress}px` : '0px'}
          class={css({ height: 'full', overflow: 'hidden' })}
        >
          <a
            class={css({
              position: 'relative',
              display: 'block',
              marginX: '4px',
              height: 'full',
            })}
            href={slide.href}
            on:click={(e) => {
              if (idx === currentIdx + 1) {
                e.preventDefault();
                next();
              }
            }}
          >
            <div
              class={css({
                position: 'absolute',
                inset: '0',
                display: 'flex',
                justifyContent: 'center',
                overflow: 'hidden',
                pointerEvents: 'none',
              })}
            >
              <img
                class={css({ minWidth: '1180px', objectFit: 'cover' })}
                alt={slide.title}
                sizes="(min-width: 62rem) 1180px, 100vw"
                src={qs.stringifyUrl({ url: slide.backgroundImageUrl, query: { s: 1180 } })}
                srcset={`${qs.stringifyUrl({ url: slide.backgroundImageUrl, query: { s: 1180 } })} 1180w, ${qs.stringifyUrl({ url: slide.backgroundImageUrl, query: { s: 2360 } })} 2360w, ${qs.stringifyUrl({ url: slide.backgroundImageUrl, query: { s: 3540 } })} 3540w`}
              />
            </div>

            <div
              style:--slide-color={slide.color}
              class={css({
                position: 'absolute',
                insetX: '0',
                bottom: '0',
                height: '200px',
                backgroundGradient: 'to-b',
                gradientFrom: 'transparent',
                gradientTo: 'var(--slide-color)',
              })}
            />

            <div
              style:--slide-color={slide.color}
              class={css({
                position: 'absolute',
                insetX: '0',
                bottom: '0',
                height: '200px',
                backgroundGradient: 'to-b',
                gradientFrom: 'transparent',
                gradientTo: 'var(--slide-color)',
              })}
            />

            <div
              style:opacity={idx === currentIdx ? `${1 - progress}` : idx === currentIdx + 1 ? `${progress}` : '0'}
              style:transform={idx === currentIdx ? `translateX(-${progress * 32}px)` : ''}
              class={css({
                position: 'absolute',
                left: { base: '18px', sm: '40px' },
                bottom: { base: '16px', sm: '34px' },
                width: '1000px',
                color: 'gray.0',
                whiteSpace: 'pre-line',
              })}
            >
              <div class={flex({ gap: '4px', direction: 'column' })}>
                <div class={flex({ gap: '2px', direction: 'column' })}>
                  <div
                    class={css({
                      fontSize: { base: '24px', sm: '32px' },
                      fontWeight: '[750]',
                      lineHeight: '[1.2]',
                    })}
                  >
                    {@html nl2br(slide.title)}
                  </div>

                  <div class={css({ fontSize: { base: '14px', sm: '16px' } })}>
                    {@html nl2br(slide.subtitle)}
                  </div>
                </div>

                {#if slide.bottomline}
                  <div class={css({ fontSize: '11px', fontWeight: 'light', opacity: '70' })}>
                    {slide.bottomline}
                  </div>
                {/if}
              </div>
            </div>

            <div
              style:opacity={idx === currentIdx ? `${1 - progress}` : idx === currentIdx + 1 ? `${progress}` : '0'}
              class={flex({
                position: 'absolute',
                right: { base: '16px', sm: '34px' },
                bottom: { base: '16px', sm: '34px' },
                gap: '2px',
                paddingX: '2px',
                paddingY: '2px',
                color: 'gray.0',
                fontSize: '11px',
              })}
            >
              <div class={css({ fontWeight: 'semibold' })}>
                {idx === $slides.banners.length ? 1 : idx + 1}
              </div>
              <div class={css({ opacity: '50' })}>/</div>
              <div class={css({ opacity: '70' })}>{$slides.banners.length}</div>
            </div>
          </a>
        </div>
      {/each}
    </div>
  </div>

  <div
    class={flex({
      position: 'absolute',
      insetX: '-16px',
      insetY: '0',
      justify: 'space-between',
      align: 'center',
      pointerEvents: 'none',
      hideBelow: 'sm',
      _peerHover: {
        '& > button': { visibility: 'visible' },
      },
      _hover: {
        '& > button': { visibility: 'visible' },
      },
    })}
  >
    <button
      class={center({
        borderRadius: 'full',
        size: '34px',
        backgroundColor: 'gray.0',
        filter: 'auto',
        dropShadow: '[drop-shadow(2px 2px 8px {colors.gray.900/15})]',
        pointerEvents: 'auto',
        visibility: 'hidden',
        _peerHover: {
          visibility: 'visible',
        },
      })}
      type="button"
      on:click={previous}
    >
      <Icon style={css.raw({ '& *': { strokeWidth: '[2]' } })} icon={IconArrowLeft} size={20} />
    </button>

    <button
      class={center({
        borderRadius: 'full',
        size: '34px',
        backgroundColor: 'gray.0',
        filter: 'auto',
        dropShadow: '[drop-shadow(2px 2px 8px {colors.gray.900/15})]',
        pointerEvents: 'auto',
        visibility: 'hidden',
        _peerHover: {
          visibility: 'visible',
        },
      })}
      type="button"
      on:click={next}
    >
      <Icon style={css.raw({ '& *': { strokeWidth: '[2]' } })} icon={IconArrowRight} size={20} />
    </button>
  </div>
</div>
