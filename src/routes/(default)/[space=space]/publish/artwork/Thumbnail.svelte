<script lang="ts">
  import clsx from 'clsx';
  import { clamp } from '$lib/utils';
  import type { MouseEventHandler, TouchEventHandler } from 'svelte/elements';

  let translateX = 0;
  let translateY = 0;

  let canvasEl: HTMLCanvasElement;
  let targetEl: HTMLDivElement;
  let imgEl: HTMLImageElement;

  let naturalWidth: number;
  let naturalHeight: number;

  type Point = { clientX: number; clientY: number };
  type Translation = { translateX: number; translateY: number };
  let origin: { img: Translation; cursor: Point } | null = null;

  const move = ({ clientX, clientY }: Point) => {
    if (!origin) {
      return;
    }

    const img = imgEl.getBoundingClientRect();
    const target = targetEl.getBoundingClientRect();

    const thresholdX = img.width / 2 - target.width / 2;
    const thresholdY = img.height / 2 - target.height / 2;

    let dx = clientX - origin.cursor.clientX;
    let dy = clientY - origin.cursor.clientY;

    translateX = clamp(origin.img.translateX + dx, -thresholdX, thresholdX);
    translateY = clamp(origin.img.translateY + dy, -thresholdY, thresholdY);

    const ratioX = naturalWidth / img.width;
    const ratioY = naturalHeight / img.height;

    const canvas = canvasEl.getBoundingClientRect();
    const context = canvasEl.getContext('2d')!;

    canvasEl.width = canvas.width;
    canvasEl.height = canvas.height;

    const crop = {
      x: Math.round(ratioX * (thresholdX - translateX)),
      y: Math.round(ratioY * (thresholdY - translateY)),
      width: Math.round(ratioX * target.width),
      height: Math.round(ratioY * target.height),
    };

    console.log(crop);

    context.drawImage(
      imgEl,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      canvas.width,
      canvas.height
    );
  };

  const setOrigin = ({
    clientX,
    clientY,
  }: Point & { target: EventTarget | null }) => {
    origin = {
      img: { translateX, translateY },
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
</script>

<svelte:window
  on:mouseup={() => (origin = null)}
  on:touchend={() => (origin = null)}
  on:mousemove={origin ? onMouseMove : undefined}
  on:touchmove|nonpassive={origin ? onTouchMove : undefined}
/>

<div class="square-100 overflow-hidden bg-black p-16">
  <div class="relative square-full flex select-none center">
    <img
      bind:this={imgEl}
      style:transform={`translate(${translateX}px, ${translateY}px)`}
      class={clsx(
        'select-none cursor-move',
        (!naturalWidth || !naturalHeight) && 'hidden',
        naturalWidth > naturalHeight ? 'h-full max-w-none' : 'w-full max-h-none'
      )}
      alt=""
      role="presentation"
      src="https://pnxl.net/i/I/IK/IKcSp2nCLghfhpozWkBOe.avif/full"
      bind:naturalWidth
      bind:naturalHeight
      on:mousedown={onMouseDown}
      on:touchstart={onTouchDown}
      on:dragstart|preventDefault
    />
    <div
      bind:this={targetEl}
      class="pointer-events-none absolute inset-0 square-full rounded outline-10000 outline-white/80 outline-offset-4 outline-solid ring-4 ring-brand-500"
    />
  </div>
</div>

<canvas bind:this={canvasEl} class="square-100" />
