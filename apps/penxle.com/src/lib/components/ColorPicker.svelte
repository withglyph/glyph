<script lang="ts">
  import Color from 'color';
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { values } from '$lib/tiptap/values';
  import { css, cx } from '$styled-system/css';
  import { flex, grid } from '$styled-system/patterns';

  let colorBlock: HTMLCanvasElement;
  let colorCtx: CanvasRenderingContext2D | null;

  let drag = false;

  let hexInputEl: HTMLInputElement | undefined;
  let gradientSliderInputEl: HTMLInputElement | undefined;

  export let hex = '#000000';
  const dispatch = createEventDispatcher<{ input: { hex: string } }>();
  const dispatchInput = (color: Color) => {
    hex = color.hex().toString().toUpperCase();

    dispatch('input', { hex });
  };

  let rgb = Color(hex).rgb();

  $: if (hexInputEl) {
    hexInputEl.value = hex;
  }

  let x = 0;
  let y = 0;

  const fillGradient = () => {
    if (!colorCtx) throw new Error('colorCtx is null');

    let gradientH = colorCtx.createLinearGradient(0, 0, colorCtx.canvas.width, 0);
    gradientH.addColorStop(0, 'white');
    gradientH.addColorStop(1, rgb.toString());
    colorCtx.fillStyle = gradientH;
    colorCtx.fillRect(0, 0, colorCtx.canvas.width, colorCtx.canvas.height);

    let gradientV = colorCtx.createLinearGradient(0, 0, 0, colorCtx.canvas.height);
    gradientV.addColorStop(0, 'rgba(0,0,0,0)');
    gradientV.addColorStop(1, 'black');
    colorCtx.fillStyle = gradientV;
    colorCtx.fillRect(0, 0, colorCtx.canvas.width, colorCtx.canvas.height);
  };

  const updatePosition = () => {
    x = Math.max(0, Math.min(rgb.saturationl() * colorBlock.offsetWidth, colorBlock.offsetWidth));
    y = Math.max(0, Math.min((1 - rgb.lightness()) * colorBlock.offsetHeight, colorBlock.offsetHeight));
  };

  const onChangeColor = (e: MouseEvent | TouchEvent) => {
    if (!colorCtx) return;

    let _x: number, _y: number;

    if (typeof TouchEvent !== 'undefined' && e instanceof TouchEvent) {
      const rect = colorBlock.getBoundingClientRect();

      _x = e.targetTouches[0].pageX - rect.left;
      _y = e.targetTouches[0].pageY - rect.top;
    } else if (e instanceof MouseEvent) {
      _x = e.offsetX;
      _y = e.offsetY;
    } else {
      throw new TypeError('Invalid event type');
    }

    x = Math.max(0, Math.min(_x, colorBlock.offsetWidth));
    y = Math.max(0, Math.min(_y, colorBlock.offsetHeight));

    const imageData = colorCtx.getImageData(x, y, 1, 1).data;

    rgb = Color([imageData[0], imageData[1], imageData[2]]);
    dispatchInput(rgb);
  };

  const updateColor = (color: Color) => {
    rgb = color.rgb();
    dispatchInput(rgb);

    fillGradient();
    updatePosition();

    if (!gradientSliderInputEl) throw new Error('gradientSliderInputEl is undefined');
    gradientSliderInputEl.value = rgb.hue().toString();
  };

  const updateHistory = async () => {
    await tick();
    if (history.includes(hex)) return;

    history = [hex, ...history.slice(0, 4)];
  };

  onMount(() => {
    const initializeBoxGradient = () => {
      colorCtx = colorBlock.getContext('2d', { willReadFrequently: true });
      if (!colorCtx) throw new Error('colorCtx is null');

      colorCtx.rect(0, 0, colorBlock.width, colorBlock.height);
    };

    initializeBoxGradient();
    fillGradient();
    updatePosition();
  });

  const presets = [
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#6B7280',
    values.defaultColor,
    '#FFFFFF',
  ];

  let history: string[] = [];

  $: paddedHistory = [...history, ...Array.from({ length: 5 - history.length }).fill(null)] as (null | string)[];
</script>

<div
  class={flex({
    direction: 'column',
    borderWidth: '1px',
    borderColor: 'gray.200',
    borderBottomRadius: '8px',
    width: '192px',
    backgroundColor: 'gray.5',
    boxShadow: '[0 5px 22px 0 {colors.gray.900/6}]',
  })}
>
  <div class={css({ padding: '12px' })}>
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <form
      class={css({ position: 'relative', marginBottom: '8px', height: '84px', touchAction: 'none' })}
      on:mouseup={() => (drag = false)}
      on:touchend={() => (drag = false)}
      on:touchcancel={() => (drag = false)}
      on:mouseup={updateHistory}
      on:touchend={updateHistory}
      on:submit|preventDefault={updateHistory}
    >
      <button
        style:left={`${x}px`}
        style:top={`${y}px`}
        style:background-color={rgb.toString()}
        class={css({
          position: 'absolute',
          borderWidth: '2px',
          borderColor: 'gray.5',
          borderRadius: 'full',
          size: '14px',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          translate: 'auto',
          translateX: '-1/2',
          translateY: '-1/2',
        })}
        type="submit"
        on:keydown={(event) => {
          if (!colorCtx) throw new Error('colorCtx is null');

          switch (event.key) {
            case 'ArrowLeft': {
              x = Math.max(0, x - 1);
              break;
            }
            case 'ArrowRight': {
              x = Math.min(colorBlock.offsetWidth, x + 1);
              break;
            }
            case 'ArrowUp': {
              y = Math.max(0, y - 1);
              break;
            }
            case 'ArrowDown': {
              y = Math.min(colorBlock.offsetHeight, y + 1);
              break;
            }
            default: {
              return;
            }
          }

          const imageData = colorCtx.getImageData(x, y, 1, 1).data;
          rgb = Color([imageData[0], imageData[1], imageData[2]]);
          dispatchInput(rgb);
        }}
      />
      <canvas
        bind:this={colorBlock}
        class={css({ borderRadius: '4px', size: 'full', _hover: { cursor: 'crosshair' } })}
        on:click={onChangeColor}
        on:mousedown={() => (drag = true)}
        on:mousemove={(event) => {
          if (drag) {
            onChangeColor(event);
          }
        }}
        on:touchstart={() => (drag = true)}
        on:touchmove={(event) => {
          if (drag) {
            onChangeColor(event);
          }
        }}
      />
    </form>

    <input
      bind:this={gradientSliderInputEl}
      style={`--thumb-color: ${rgb.toString()}`}
      class={cx(
        'gradient-slider',
        css({ borderRadius: '2px', marginBottom: '12px', width: 'full', height: '8px', appearance: 'none' }),
      )}
      max="300"
      min="0"
      type="range"
      on:change={(event) => {
        const hue = event.currentTarget.valueAsNumber;

        updateColor(Color.hsl(hue, 100, 50));
        updateHistory();
      }}
    />

    <form
      class={flex({ align: 'center' })}
      on:submit|preventDefault={() => {
        if (!hexInputEl) throw new Error('hexInputEl is undefined');

        updateColor(Color(hexInputEl.value));
        updateHistory();
      }}
    >
      <input
        style:background-color={hex}
        class={css({
          borderWidth: '1px',
          borderColor: 'gray.200',
          borderRadius: 'full',
          marginRight: '12px',
          size: '22px',
        })}
        type="color"
        value={hex}
        on:input={(event) => {
          updateColor(Color(event.currentTarget.value));
        }}
        on:change={updateHistory}
      />

      <!-- eslint-disable svelte/no-useless-mustaches -->
      <input
        bind:this={hexInputEl}
        class={css({
          borderWidth: '1px',
          borderColor: 'gray.200',
          borderRadius: '4px',
          marginRight: '4px',
          paddingX: '8px',
          paddingY: '4px',
          width: '84px',
          fontSize: '12px',
        })}
        maxlength="7"
        pattern="#[0-9A-Fa-f]{'{'}6{'}'}"
        placeholder="#FFFFFF"
        type="text"
      />
      <!-- eslint-enable svelte/no-useless-mustaches -->

      <button
        class={css({
          flex: '1',
          borderWidth: '1px',
          borderColor: 'gray.200',
          borderRadius: '4px',
          paddingX: '8px',
          paddingY: '4px',
          height: 'full',
          fontSize: '12px',
          fontWeight: 'medium',
          color: 'gray.600',
          _hover: {
            borderColor: 'teal.400',
            color: 'teal.700',
            backgroundColor: 'teal.50',
          },
          _focus: {
            borderColor: 'teal.400',
            color: 'teal.700',
            backgroundColor: 'teal.50',
          },
        })}
        type="submit"
      >
        확인
      </button>
    </form>
  </div>
  <div
    class={grid({
      columns: 5,
      justifyContent: 'space-between',
      borderYWidth: '1px',
      borderYColor: 'gray.200',
      paddingX: '20px',
      paddingY: '12px',
    })}
  >
    {#each paddedHistory as color, index (color ?? index)}
      <button
        style:background-color={color}
        class={css(
          {
            borderRadius: 'full',
            size: '16px',
            _pressed: { boxShadow: '[0 0 0 2px #D4D4D8]' },
            _disabled: {
              borderWidth: '1px',
              borderStyle: 'dashed',
              borderColor: 'gray.300',
            },
          },
          color === '#FFFFFF' && { borderWidth: '1px', borderColor: '[#E4E4E7]' },
        )}
        aria-pressed={hex === color}
        disabled={!color}
        type="button"
        on:click={() => {
          if (!color) return;
          updateColor(Color(color));
        }}
      />
    {/each}
  </div>
  <div
    class={grid({ columns: 5, justifyContent: 'space-between', gap: '10px', paddingX: '20px', paddingY: '12px' })}
    role="group"
  >
    {#each presets as preset (preset)}
      <button
        style:background-color={preset}
        class={css(
          {
            borderRadius: 'full',
            size: '16px',
            _pressed: { boxShadow: '[0 0 0 2px #D4D4D8]' },
          },
          preset === '#FFFFFF' && { borderWidth: '1px', borderColor: '[#E4E4E7]' },
        )}
        aria-pressed={hex === preset}
        type="button"
        on:click={() => {
          updateColor(Color(preset));
          updateHistory();
        }}
      />
    {/each}
  </div>
</div>

<style>
  .gradient-slider {
    background: linear-gradient(
      to right,
      hsl(0, 100%, 50%) 0%,
      hsl(60, 100%, 50%) 20%,
      hsl(120, 100%, 50%) 40%,
      hsl(180, 100%, 50%) 60%,
      hsl(240, 100%, 50%) 80%,
      hsl(300, 100%, 50%) 100%
    );
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
    }

    &::-webkit-slider-thumb,
    &::-moz-range-thumb {
      border-radius: 0.5rem;
      height: 0.875rem;
      width: 0.5rem;
      background-color: var(--thumb-color);
      border: 2px solid #fff;
      box-shadow:
        0px 0px 3px 0px rgba(0, 0, 0, 0.2),
        0px 1px 10px 0px rgba(0, 0, 0, 0.08);
    }
  }

  input[type='color']::-moz-color-swatch,
  input[type='color']::-webkit-color-swatch {
    border: none;
  }
</style>
