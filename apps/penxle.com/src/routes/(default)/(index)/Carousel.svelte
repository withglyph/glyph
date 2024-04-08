<script lang="ts">
  import { DragGesture } from '@use-gesture/vanilla';
  import { onMount } from 'svelte';
  import { expoInOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import IconArrowLeft from '~icons/tabler/arrow-left';
  import IconArrowRight from '~icons/tabler/arrow-right';
  import { Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  type Slide = {
    title: string;
    subtitle: string;
    bottomline?: string;
    color: string;
    backgroundImageUrl: string;
  };

  const slides: Slide[] = [
    {
      title: '시즌 2 컴백!\n<나의 밤을 그대에게>',
      subtitle: '신을 섬기는 기사와, 그를 사랑하게 된 악마',
      bottomline: 'ⓒ유씨',
      color: '#9FAAA8',
      backgroundImageUrl: 'https://pnxl.net/images/_/banner_uc2.png',
    },
    {
      title: '<유키의 백엔드 대모험>\n독점 연재 진행중',
      subtitle: '엘렐레 엘렐레',
      bottomline: 'ⓒ유키',
      color: '#6B879C',
      backgroundImageUrl: 'https://pnxl.net/images/_/banner_yuki.png',
    },
    {
      title: '<카일리의 좌충우돌\n프론트 개발기> 시작합니다',
      subtitle: '뚱인데요?',
      bottomline: 'ⓒ카일리',
      color: '#EDA303',
      backgroundImageUrl: 'https://pnxl.net/images/_/banner_kylie.png',
    },
  ];

  $: repeatableSlides = [...slides, slides[0], slides[1]];

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
    class={css({
      maxWidth: '1248px',
      width: 'full',
      height: { base: '320px', sm: '380px' },
      overflow: 'hidden',
    })}
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
          <div
            style:background-image={`url(${slide.backgroundImageUrl})`}
            class={css({
              position: 'relative',
              marginX: '4px',
              height: 'full',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              cursor: 'pointer',
            })}
            role="presentation"
            on:click={() => {
              if (idx === currentIdx + 1) {
                next();
              }
            }}
          >
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
                color: 'gray.5',
                whiteSpace: 'pre-line',
              })}
            >
              <div class={flex({ gap: '6px', direction: 'column' })}>
                <div>
                  <div class={css({ fontSize: { base: '24px', sm: '32px' }, fontWeight: 'bold', lineHeight: '[1.2]' })}>
                    {slide.title}
                  </div>

                  <div class={css({ fontSize: '14px' })}>
                    {slide.subtitle}
                  </div>
                </div>

                {#if slide.bottomline}
                  <div class={css({ fontSize: '12px', fontWeight: 'light', opacity: '80' })}>
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
                color: 'gray.5',
                fontSize: '11px',
              })}
            >
              <div class={css({ fontWeight: 'semibold' })}>
                {idx === slides.length ? 1 : idx + 1}
              </div>
              <div class={css({ opacity: '50' })}>/</div>
              <div class={css({ opacity: '70' })}>{slides.length}</div>
            </div>
          </div>
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
    })}
  >
    <button
      class={center({
        borderRadius: 'full',
        size: '48px',
        backgroundColor: 'gray.5/80',
        filter: 'auto',
        dropShadow: '[drop-shadow(2px 2px 8px {colors.gray.900/15})]',
        pointerEvents: 'auto',
      })}
      type="button"
      on:click={previous}
    >
      <Icon icon={IconArrowLeft} size={32} />
    </button>

    <button
      class={center({
        borderRadius: 'full',
        size: '48px',
        backgroundColor: 'gray.5/80',
        filter: 'auto',
        dropShadow: '[drop-shadow(2px 2px 8px {colors.gray.900/15})]',
        pointerEvents: 'auto',
      })}
      type="button"
      on:click={next}
    >
      <Icon icon={IconArrowRight} size={32} />
    </button>
  </div>
</div>
