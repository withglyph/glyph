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

  const urls = [
    'https://picsum.photos/1240/380?1',
    'https://picsum.photos/1240/380?2',
    'https://picsum.photos/1240/380?3',
    'https://picsum.photos/1240/380?4',
    'https://picsum.photos/1240/380?5',
  ];
  $: slides = [...urls, urls[0], urls[1]];

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
      await value.update((v) => (v + 1) % slides.length);
      if ($value === slides.length - 2) {
        await value.set(0, { duration: 0 });
      }
    });
  };

  const previous = async () => {
    await transition(async () => {
      if ($value === 0) {
        await value.set(slides.length - 2, { duration: 0 });
      }
      await value.update((v) => (v - 1 + slides.length) % slides.length);
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
      })}
    >
      {#each slides as url, idx (idx)}
        <div
          style:flex-grow={idx === currentIdx ? `${1 - progress}` : idx === currentIdx + 1 ? `${progress}` : '0'}
          style:flex-basis={idx === currentIdx + 1 ? '100px' : idx === currentIdx + 2 ? `${100 * progress}px` : '0px'}
          class={css({ height: 'full', overflow: 'hidden' })}
        >
          <div
            style:background-image={`url(${url})`}
            class={css({
              position: 'relative',
              marginX: '4px',
              height: 'full',
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
              style:opacity={idx === currentIdx ? `${1 - progress}` : idx === currentIdx + 1 ? `${progress}` : '0'}
              class={flex({
                position: 'absolute',
                right: '24px',
                bottom: '24px',
                align: 'center',
                gap: '2px',
                borderRadius: 'full',
                paddingX: '8px',
                paddingY: '2px',
                color: 'gray.5',
                fontSize: '12px',
                backgroundColor: 'gray.900/50',
              })}
            >
              <div class={css({ fontWeight: 'semibold' })}>
                {idx === urls.length ? 1 : idx + 1}
              </div>
              <div class={css({ opacity: '50' })}>/</div>
              <div class={css({ opacity: '50' })}>{urls.length}</div>
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
