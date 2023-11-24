<script lang="ts">
  import clsx from 'clsx';
  import { onDestroy, tick } from 'svelte';
  import { Slider } from '$lib/components/forms';
  import { clamp } from '$lib/utils';
  import type { PointerEventHandler } from 'svelte/elements';
  import type { ImageBounds } from '$lib/utils';

  export let file: File;
  export let bounds: ImageBounds = { top: 0, left: 0, width: 0, height: 0 };
  export let rounded = false;
  let _class: string | undefined = undefined;
  export { _class as class };

  const src = URL.createObjectURL(file);

  let imgEl: HTMLImageElement;
  let boxEl: HTMLDivElement;

  let naturalWidth: number;
  let naturalHeight: number;

  let translateX = 0;
  let translateY = 0;
  let scale = 1;
  $: transform = `translate(${translateX}%, ${translateY}%) scale(${scale})`;

  let originX: number | null = null;
  let originY: number | null = null;

  $: if (scale) {
    update();
  }

  const handler: PointerEventHandler<HTMLElement> = async (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId) || originX === null || originY === null) {
      return;
    }

    const { width: imgWidth, height: imgHeight } = imgEl.getBoundingClientRect();
    const { clientX: pointerX, clientY: pointerY } = e;

    const dx = (pointerX - originX) * scale;
    const dy = (pointerY - originY) * scale;

    translateX += (dx / imgWidth) * 100;
    translateY += (dy / imgHeight) * 100;

    originX = pointerX;
    originY = pointerY;

    await update();
  };

  const update = async () => {
    await tick();

    if (!boxEl || !imgEl) {
      return;
    }

    const { width: boxWidth, height: boxHeight } = boxEl.getBoundingClientRect();
    const { width: imgWidth, height: imgHeight } = imgEl.getBoundingClientRect();

    if (imgWidth === 0 || imgHeight === 0) {
      return;
    }

    const thresholdX = ((imgWidth / 2 - boxWidth / 2) / imgWidth) * 100 * scale;
    const thresholdY = ((imgHeight / 2 - boxHeight / 2) / imgHeight) * 100 * scale;

    translateX = clamp(translateX, -thresholdX, thresholdX);
    translateY = clamp(translateY, -thresholdY, thresholdY);

    bounds = {
      left: Math.round((((thresholdX - translateX) / 100) * naturalWidth) / scale),
      top: Math.round((((thresholdY - translateY) / 100) * naturalHeight) / scale),
      width: Math.round((boxWidth / imgWidth) * naturalWidth),
      height: Math.round((boxHeight / imgHeight) * naturalHeight),
    };
  };

  onDestroy(() => {
    URL.revokeObjectURL(src);
  });
</script>

<div class={_class}>
  <div class="relative overflow-hidden p-8 flex center aspect-1/1 w-full">
    <img
      bind:this={imgEl}
      style:transform
      class={clsx(
        'max-w-none cursor-move touch-none',
        naturalWidth > naturalHeight && 'h-full',
        naturalWidth < naturalHeight && 'w-full',
        naturalWidth === naturalHeight && 'w-full h-full',
        (!naturalWidth || !naturalHeight) && 'hidden',
      )}
      alt=""
      {src}
      bind:naturalWidth
      bind:naturalHeight
      on:load={update}
      on:dragstart|preventDefault
      on:pointerdown={(e) => {
        originX = e.clientX;
        originY = e.clientY;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      on:pointermove|preventDefault={handler}
      on:pointerup={(e) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        originX = null;
        originY = null;
      }}
    />

    <div
      bind:this={boxEl}
      class={clsx(
        'pointer-events-none absolute inset-8 border-4 border-white outline-10000 outline-solid outline-black/50',
        rounded && 'rounded-full',
      )}
    />
  </div>

  <div class="flex gap-4 items-center mt-4 mx-4">
    <span class="i-lc-zoom-out text-gray-50 square-5" />
    <Slider class="w-full" max={8} min={1} bind:value={scale} />
    <span class="i-lc-zoom-in text-gray-50 square-5" />
  </div>
</div>
