<script lang="ts">
  import { computePosition, flip, offset, shift } from '@floating-ui/dom';
  import clsx from 'clsx';
  import { init, Picker } from 'emoji-mart';
  import { onMount, tick } from 'svelte';
  import { afterNavigate } from '$app/navigation';
  import { portal } from '$lib/svelte/actions';
  import data from './data.json';
  import i18n from './i18n.json';
  import type { Emoji } from '@emoji-mart/data';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let picker: any;
  let open = false;
  let exceptEmojis: string[] = [];

  let targetEl: HTMLButtonElement;
  let pickerEl: HTMLDivElement;

  const update = async () => {
    await tick();

    const position = await computePosition(targetEl, pickerEl, {
      placement: 'top-start',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    });

    Object.assign(pickerEl.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });
  };

  $: if (open) {
    void update();
  }

  afterNavigate(() => {
    open = false;
  });

  onMount(async () => {
    picker = new Picker({
      autoFocus: true,
      data,
      previewPosition: 'none',
      skinTonePosition: 'none',
      locale: 'kr',
      i18n,
      onEmojiSelect: (emoji: Emoji) => {
        exceptEmojis.push(emoji.id);
        exceptEmojis = exceptEmojis;
        open = false;
      },
      exceptEmojis,
      perLine: 8,
      maxFrequentRows: 3,
    });

    pickerEl.append(picker);
  });

  $: if (picker) {
    init({ data, i18n, exceptEmojis });
  }

  afterNavigate(() => {
    open = false;
  });
</script>

<button
  bind:this={targetEl}
  class="square-6 rounded-lg border border-secondary hover:border-primary flex center p-0.5"
  type="button"
  on:click={() => (open = true)}
>
  <i class="i-lc-plus square-3.5" />
</button>

{#if open}
  <div
    class="fixed inset-0 z-49"
    role="button"
    tabindex="-1"
    on:click={() => (open = false)}
    on:keypress={null}
    use:portal
  />
{/if}

<div bind:this={pickerEl} class={clsx('z-50 absolute h-100', !open && 'hidden')} />

<style>
  :global(em-emoji-picker) {
    --uno: h-100;
  }
</style>
