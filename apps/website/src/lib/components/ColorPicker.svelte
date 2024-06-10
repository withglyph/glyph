<script lang="ts">
  import Color from 'color';
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { Button } from '$lib/components';
  import { values } from '$lib/tiptap/values';
  import { css } from '$styled-system/css';
  import { flex, grid } from '$styled-system/patterns';

  let initialized = false;

  let colorBlock: HTMLCanvasElement;
  let colorCtx: CanvasRenderingContext2D;

  let drag = false;

  let hexInputEl: HTMLInputElement;
  let hueGradientInputEl: HTMLInputElement;

  export let open: boolean;
  export let hex: string;

  const dispatch = createEventDispatcher<{ input: { hex: string } }>();
  const dispatchInput = (color: Color) => {
    dispatch('input', { hex: color.hex().toUpperCase() });
  };

  let x = 0;
  let y = 0;

  const fillBoxGradient = (hue: number) => {
    const gradientH = colorCtx.createLinearGradient(0, 0, colorCtx.canvas.width, 0);
    gradientH.addColorStop(0, `hsl(${hue}, 100%, 100%)`);
    gradientH.addColorStop(1, `hsl(${hue}, 100%, 50%)`);
    colorCtx.fillStyle = gradientH;
    colorCtx.fillRect(0, 0, colorCtx.canvas.width, colorCtx.canvas.height);

    const gradientV = colorCtx.createLinearGradient(0, 0, 0, colorCtx.canvas.height);
    gradientV.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradientV.addColorStop(1, `hsl(${hue}, 0%, 0%)`);
    colorCtx.fillStyle = gradientV;
    colorCtx.fillRect(0, 0, colorCtx.canvas.width, colorCtx.canvas.height);
  };

  const getColorAtBoxGradientPosition = () => {
    const [red, green, blue] = colorCtx.getImageData(x, y, 1, 1).data;
    return Color([red, green, blue]);
  };

  const updateHexInputValue = (value: string) => {
    hexInputEl.value = value.toUpperCase();
  };

  const onChangeBoxGradientPosition = (e: MouseEvent | TouchEvent) => {
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

    const color = getColorAtBoxGradientPosition();
    updateHexInputValue(color.hex());

    dispatchInput(color);
  };

  const updateColorFromHex = (value: string) => {
    const color = Color(value);
    const hue = color.hue();

    fillBoxGradient(hue);
    hueGradientInputEl.value = hue.toString();

    x = (color.saturationl() / 100) * colorBlock.offsetWidth;
    y = (1 - color.lightness() / 100) * colorBlock.offsetHeight;

    updateHexInputValue(value);

    dispatchInput(color);
  };

  const updateColorFromHue = (hue: number) => {
    fillBoxGradient(hue);

    const color = getColorAtBoxGradientPosition();
    updateHexInputValue(color.hex());

    dispatchInput(color);
  };

  const updateHistory = async () => {
    await tick();
    if (history.includes(hex)) return;

    history = [hex, ...history.slice(0, 4)];
  };

  onMount(() => {
    const initializeBoxGradient = () => {
      const context = colorBlock.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('colorBlock context not found');

      colorCtx = context;
      colorCtx.rect(0, 0, colorBlock.width, colorBlock.height);
    };

    initializeBoxGradient();
    initialized = true;
  });

  const resetColor = () => {
    updateColorFromHex(hex);
  };

  $: if (initialized && open) {
    resetColor();
  }

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
    width: '192px',
    backgroundColor: 'gray.0',
    boxShadow: '[0 5px 22px 0 {colors.gray.900/6}]',
    display: open ? 'block' : 'none',
  })}
>
  <div class={css({ padding: '12px' })}>
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <form
      class={css({
        position: 'relative',
        marginBottom: '8px',
        height: '84px',
        touchAction: 'none',
        overflow: 'hidden',
      })}
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
        style:background-color={hex}
        class={css({
          position: 'absolute',
          borderWidth: '2px',
          borderColor: 'gray.0',
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
          dispatchInput(Color([imageData[0], imageData[1], imageData[2]]));
        }}
      />
      <canvas
        bind:this={colorBlock}
        class={css({ size: 'full', _hover: { cursor: 'crosshair' } })}
        on:click={onChangeBoxGradientPosition}
        on:mousedown={() => (drag = true)}
        on:mousemove={(event) => {
          if (drag) {
            onChangeBoxGradientPosition(event);
          }
        }}
        on:touchstart={() => (drag = true)}
        on:touchmove={(event) => {
          if (drag) {
            onChangeBoxGradientPosition(event);
          }
        }}
      />
    </form>

    <input
      bind:this={hueGradientInputEl}
      style={`--thumb-color: ${hex}`}
      class="gradient-slider"
      max="360"
      min="0"
      type="range"
      on:input={(event) => {
        updateColorFromHue(event.currentTarget.valueAsNumber);
      }}
      on:change={updateHistory}
    />

    <form
      class={flex({ align: 'center' })}
      on:submit|preventDefault={() => {
        updateColorFromHex(hexInputEl.value);
        updateHistory();
      }}
    >
      <input
        style:background-color={hex}
        class={css({
          'borderWidth': '1px',
          'borderColor': 'gray.200',
          'borderRadius': 'full',
          'marginRight': '8px',
          'size': '22px',
          '&::-webkit-color-swatch-wrapper': {
            visibility: 'hidden',
          },
          '&::-moz-color-swatch': {
            borderStyle: 'none',
          },
        })}
        type="color"
        value={hex}
        on:input={(event) => {
          updateColorFromHex(event.currentTarget.value);
        }}
        on:change={updateHistory}
      />

      <!-- eslint-disable svelte/no-useless-mustaches -->
      <input
        bind:this={hexInputEl}
        class={css({
          borderWidth: '1px',
          borderColor: 'gray.200',
          marginRight: '4px',
          paddingX: '8px',
          paddingY: '4px',
          width: '76px',
          fontSize: '12px',
        })}
        maxlength="7"
        pattern="#[0-9A-Fa-f]{'{'}6{'}'}"
        placeholder="#FFFFFF"
        type="text"
      />
      <Button style={css.raw({ flex: '1' })} size="xs" type="submit" variant="gray-outline">확인</Button>
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
            _pressed: { boxShadow: '[0 0 0 2px {colors.gray.400}]' },
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
          updateColorFromHex(color);
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
            _pressed: { boxShadow: '[0 0 0 2px {colors.gray.400}]' },
          },
          preset === '#FFFFFF' && { borderWidth: '1px', borderColor: '[#E4E4E7]' },
        )}
        aria-pressed={hex === preset}
        type="button"
        on:click={() => {
          updateColorFromHex(preset);
          updateHistory();
        }}
      />
    {/each}
  </div>
</div>

<style>
  .gradient-slider {
    margin-bottom: 12px;
    width: 100%;
    height: 8px;
    appearance: none;

    background: linear-gradient(
      to right,
      hsl(0, 100%, 50%) 0%,
      hsl(60, 100%, 50%) 17%,
      hsl(120, 100%, 50%) 33%,
      hsl(180, 100%, 50%) 50%,
      hsl(240, 100%, 50%) 67%,
      hsl(300, 100%, 50%) 83%,
      hsl(360, 100%, 50%) 100%
    );
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      border-radius: 0.5rem;
      height: 0.875rem;
      width: 0.5rem;
      background-color: var(--thumb-color);
      border: 2px solid #fff;
      box-shadow:
        0px 0px 3px 0px rgba(0, 0, 0, 0.2),
        0px 1px 10px 0px rgba(0, 0, 0, 0.08);
    }

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
</style>
