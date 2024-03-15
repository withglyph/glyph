<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import IconZoomIn from '~icons/tabler/zoom-in';
  import IconZoomOut from '~icons/tabler/zoom-out';
  import { Slider } from '$lib/components/forms';
  import { clamp } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import { Icon } from '..';
  import type { PointerEventHandler } from 'svelte/elements';
  import type { ImageBounds } from '$lib/utils';
  import type { SystemStyleObject } from '$styled-system/types';

  export let file: File | undefined = undefined;
  export let bounds: ImageBounds | undefined = undefined;
  export let rounded = false;
  export let style: SystemStyleObject | undefined = undefined;

  export let src: string | undefined = undefined;
  export let ratio: 'square' | 'rectangle' = 'square';

  $: {
    if (!file && !src) throw new Error('file or src props required');
    if (file) {
      src = URL.createObjectURL(file);
    }
  }

  let imgEl: HTMLImageElement;
  let boxEl: HTMLDivElement;

  let naturalWidth: number;
  let naturalHeight: number;

  let translateX = bounds?.translateX ?? 0;
  let translateY = bounds?.translateY ?? 0;
  let scale = bounds?.scale ?? 1;
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

      translateX,
      translateY,
      scale,
    };
  };

  onDestroy(() => {
    if (src?.startsWith('blob:')) {
      URL.revokeObjectURL(src);
    }
  });
</script>

<div class={css(style)}>
  <div
    class={center({
      position: 'relative',
      padding: '32px',
      width: 'full',
      overflow: 'hidden',
      aspectRatio: ratio === 'square' ? '1/1' : '[3/4]',
    })}
  >
    <img
      bind:this={imgEl}
      style:transform
      class={css(
        { maxWidth: '[none]', objectFit: 'contain', cursor: 'move', touchAction: 'none' },
        naturalWidth > naturalHeight && { height: 'full' },
        naturalWidth < naturalHeight && { width: 'full' },
        naturalWidth === naturalHeight && { size: 'full' },
        (!naturalWidth || !naturalHeight) && { display: 'none' },
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
      class={css(
        {
          position: 'absolute',
          inset: '32px',
          borderWidth: '4px',
          borderColor: 'white',
          outlineWidth: '[10000px]',
          outlineColor: 'black/50',
          pointerEvents: 'none',
        },
        rounded && { borderRadius: 'full' },
      )}
    />
  </div>

  <div class={flex({ align: 'center', gap: '16px', marginTop: '16px', marginX: '16px' })}>
    <Icon style={css.raw({ size: '20px', color: 'gray.500' })} icon={IconZoomOut} />
    <Slider style={css.raw({ width: 'full' })} max={8} min={1} bind:value={scale} />
    <Icon style={css.raw({ size: '20px', color: 'gray.500' })} icon={IconZoomIn} />
  </div>
</div>
