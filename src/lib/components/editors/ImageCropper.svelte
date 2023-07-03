<script lang="ts">
  import clsx from 'clsx';
  import { onMount } from 'svelte';
  import { clamp } from '$lib/utils';
  import type { MouseEventHandler, TouchEventHandler } from 'svelte/elements';

  let top = 0;
  let left = 0;
  let width = 100;
  let height = 100;

  let containerEl: HTMLDivElement;
  let targetEl: HTMLDivElement;

  type Point = { clientX: number; clientY: number };
  type Rect = Point & { width: number; height: number };
  let origin: { target: Rect; cursor: Point; position: string } | null = null;

  let blink = false;

  const handle = ({ clientX, clientY }: Point) => {
    if (!origin) {
      return;
    }

    const container = containerEl.getBoundingClientRect();
    const { position, target, cursor } = origin;

    let dx = clientX - cursor.clientX;
    let dy = clientY - cursor.clientY;

    if (position === 'center') {
      // move
      const absoluteX = target.clientX + dx;
      const absoluteY = target.clientY + dy;

      const relativeX = absoluteX - container.left;
      const relativeY = absoluteY - container.top;

      top = clamp(relativeY, 0, container.height - height);
      left = clamp(relativeX, 0, container.width - width);
    } else {
      // resize
      dx *= position.includes('left') ? -1 : 1;
      dy *= position.includes('top') ? -1 : 1;

      const d = Math.max(dx, dy);

      const newLeft = position.includes('left')
        ? target.clientX - d - container.left
        : left;
      const newTop = position.includes('top')
        ? target.clientY - d - container.top
        : top;

      const newWidth = target.width + d;
      const newHeight = target.height + d;

      if (
        newLeft + newWidth > container.width ||
        newTop + newHeight > container.height
      ) {
        return;
      }

      top = newTop;
      left = newLeft;
      width = newWidth;
      height = newHeight;
    }
  };

  const setOrigin = ({
    target,
    clientX,
    clientY,
  }: Point & { target: EventTarget | null }) => {
    const { x, y, width, height } = targetEl.getBoundingClientRect();
    origin = {
      position: (target as HTMLElement).dataset.pos ?? 'center',
      target: { clientX: x, clientY: y, width, height },
      cursor: { clientX, clientY },
    };
  };

  const onMouseDown: MouseEventHandler<HTMLDivElement> = (event) => {
    setOrigin(event);
  };

  const onMouseMove: MouseEventHandler<Window> = (event) => {
    handle(event);
  };

  const onTouchDown: TouchEventHandler<HTMLDivElement> = (event) => {
    if (event.touches.length === 1) {
      setOrigin(event.touches[0]);
    }
  };

  const onTouchMove: TouchEventHandler<Window> = (event) => {
    if (event.touches.length === 1) {
      event.preventDefault();
      handle(event.touches[0]);
    }
  };

  onMount(() => {
    const interval = setInterval(() => {
      blink = !blink;
    }, 500);

    return () => clearInterval(interval);
  });
</script>

<svelte:window
  on:mouseup={() => (origin = null)}
  on:touchend={() => (origin = null)}
  on:mousemove={origin ? onMouseMove : undefined}
  on:touchmove|nonpassive={origin ? onTouchMove : undefined}
/>

<div
  bind:this={containerEl}
  class="relative square-100 select-none overflow-hidden"
>
  <img
    class="pointer-events-none square-full select-none object-cover"
    alt=""
    src="https://pnxl.net/i/L/Lg/Lg3283-f4h67a0C6itqpn.avif/640"
  />
  <div
    bind:this={targetEl}
    style:top={`${top}px`}
    style:left={`${left}px`}
    style:width={`${width}px`}
    style:height={`${height}px`}
    style:border-image-source="url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+CiAgPHBhdGggZD0iTTEgMGgydjFIMXYySDBWMGgxWm0wIDdIMHYzaDNWOUgxVjdabTctN0g3djFoMnYyaDFWMEg4Wm0xIDlIN3YxaDNWN0g5djJaIi8+CiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgM2gxdjRIMFYzWm05IDB2NGgxVjNIOVpNMyAxaDRWMEgzdjFabTAgOWg0VjlIM3YxWiIvPgo8L3N2Zz4K)"
    style:border-image-repeat="repeat"
    style:border-image-slice="10%"
    class="absolute square-50 cursor-move border outline-10000 outline-black/50 outline-solid"
    role="presentation"
    on:mousedown={onMouseDown}
    on:touchstart={onTouchDown}
  >
    <div
      class={clsx(
        'absolute square-2 border border-white/80 -left-1 -top-1 cursor-nwse-resize',
        blink ? 'bg-black/20' : 'bg-black/50'
      )}
      data-pos="top-left"
    />
    <div
      class={clsx(
        'absolute square-2 border border-white/80 -right-1 -top-1 cursor-nesw-resize',
        blink ? 'bg-black/20' : 'bg-black/50'
      )}
      data-pos="top-right"
    />
    <div
      class={clsx(
        'absolute square-2 border border-white/80 -right-1 -bottom-1 cursor-nwse-resize',
        blink ? 'bg-black/20' : 'bg-black/50'
      )}
      data-pos="bottom-right"
    />
    <div
      class={clsx(
        'absolute square-2 border border-white/80 -left-1 -bottom-1 cursor-nesw-resize',
        blink ? 'bg-black/20' : 'bg-black/50'
      )}
      data-pos="bottom-left"
    />
  </div>
</div>
