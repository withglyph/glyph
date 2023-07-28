<script context="module" lang="ts">
  type Point = { clientX: number; clientY: number };
</script>

<script lang="ts">
  import { clsx } from 'clsx';
  import { onDestroy } from 'svelte';
  import { Button, Modal } from '$lib/components';
  import { clamp } from '$lib/utils';
  import type { Artwork, Translation } from './types';
  import type { MouseEventHandler, TouchEventHandler } from 'svelte/elements';

  let open = false;
  let translation: Translation = { translateX: 0, translateY: 0 };

  export let artwork: Artwork;

  const src = URL.createObjectURL(artwork.file);

  let targetEl: HTMLDivElement | undefined;
  let imgEl: HTMLImageElement | undefined;

  let naturalWidth = 0;
  let naturalHeight = 0;

  let origin: { img: Translation; cursor: Point } | null = null;

  $: if (!open) {
    translation = { ...artwork.thumbnail };
  }

  const transform = (t: Translation) =>
    `translate(${t.translateX * 100}%, ${t.translateY * 100}%)`;

  const move = ({ clientX, clientY }: Point) => {
    if (!origin || !imgEl || !targetEl) {
      return;
    }

    const img = imgEl.getBoundingClientRect();
    const target = targetEl.getBoundingClientRect();

    const thresholdX = (img.width / 2 - target.width / 2) / img.width;
    const thresholdY = (img.height / 2 - target.height / 2) / img.height;

    const dx = clientX - origin.cursor.clientX;
    const dy = clientY - origin.cursor.clientY;
    const x = origin.img.translateX + dx / img.width;
    const y = origin.img.translateY + dy / img.height;

    const translateX = clamp(x, -thresholdX, thresholdX);
    const translateY = clamp(y, -thresholdY, thresholdY);

    translation = { translateX, translateY };
  };

  const setOrigin = ({ clientX, clientY }: Point) => {
    origin = {
      img: { ...translation },
      cursor: { clientX, clientY },
    };
  };

  const onMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    setOrigin(event);
  };

  const onMouseMove: MouseEventHandler<Window> = (event) => {
    move(event);
  };

  const onTouchDown: TouchEventHandler<HTMLDivElement> = (event) => {
    if (event.touches.length === 1) {
      setOrigin(event.touches[0]);
    }
  };

  const onTouchMove: TouchEventHandler<Window> = (event) => {
    if (event.touches.length === 1) {
      event.preventDefault();
      move(event.touches[0]);
    }
  };

  onDestroy(() => {
    URL.revokeObjectURL(src);
  });
</script>

<svelte:window
  on:mouseup={() => (origin = null)}
  on:touchend={() => (origin = null)}
  on:mousemove={origin ? onMouseMove : undefined}
  on:touchmove|nonpassive={origin ? onTouchMove : undefined}
/>

<button
  class="absolute bottom-4 right-4 square-20 flex center overflow-hidden rounded ring-4 ring-brand-50"
  type="button"
  on:click={() => (open = true)}
>
  <img
    style:transform={transform(artwork.thumbnail)}
    class={clsx(
      'pointer-events-none',
      naturalWidth > naturalHeight ? 'h-full max-w-none' : 'w-full max-h-none',
    )}
    alt=""
    {src}
    bind:naturalWidth
    bind:naturalHeight
  />
</button>

<Modal bind:open>
  <svelte:fragment slot="title">섬네일 위치 조정하기</svelte:fragment>
  <div class="square-100 overflow-hidden bg-black p-16">
    <div class="relative square-full flex select-none center">
      <img
        bind:this={imgEl}
        style:transform={transform(translation)}
        class={clsx(
          'select-none cursor-move',
          naturalWidth > naturalHeight
            ? 'h-full max-w-none'
            : 'w-full max-h-none',
        )}
        alt=""
        role="presentation"
        {src}
        on:mousedown={onMouseDown}
        on:touchstart={onTouchDown}
        on:dragstart|preventDefault={() => null}
      />
      <div
        bind:this={targetEl}
        class="pointer-events-none absolute inset-0 square-full rounded outline-10000 outline-white/80 outline-offset-4 outline-solid ring-4 ring-brand-50"
      />
    </div>
  </div>
  <Button
    slot="action"
    on:click={() => {
      artwork = { ...artwork, thumbnail: { ...translation } };
      open = false;
    }}
  >
    적용
  </Button>
</Modal>
