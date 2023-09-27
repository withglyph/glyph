<script lang="ts">
  import { debounce, zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core';
  import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
  import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
  import { clsx } from 'clsx';
  import TextInput from './TextInput.svelte';
  import type { ComponentProps } from 'svelte';

  type $$Props = ComponentProps<TextInput> & {
    showStrength?: boolean;
  };

  export let showStrength = false;

  let value: $$Props['value'];
  let reveal = false;
  let score: number | undefined;

  zxcvbnOptions.setOptions({
    dictionary: {
      ...zxcvbnCommonPackage.dictionary,
      ...zxcvbnEnPackage.dictionary,
    },

    graphs: zxcvbnCommonPackage.adjacencyGraphs,
    useLevenshteinDistance: true,
  });

  const zxcvbn = debounce(async () => {
    const result = await zxcvbnAsync(value);
    score = result.score;
  }, 100);

  $: if (showStrength && value) {
    zxcvbn();
  }
</script>

<TextInput type={reveal ? 'text' : 'password'} {...$$restProps} bind:value>
  <div slot="right-label">
    {#if value && score !== undefined}
      <span
        class={clsx(
          'rounded-1 py-1 px-1.5 flex center font-bold text-xs',
          score < 2 && 'bg-red-10 text-red-50',
          score === 2 && 'bg-orange-10 text-orange-50',
          score > 2 && 'bg-green-10 text-green-50',
        )}
      >
        {#if score < 2}
          위험
        {:else if score === 2}
          주의
        {:else if score > 2}
          안전
        {/if}
      </span>
    {/if}
  </div>
  <button
    slot="right-icon"
    class={clsx('square-4 text-gray-30 transition hover:text-gray-40', reveal ? 'i-lc-eye-off' : 'i-lc-eye')}
    tabindex="-1"
    type="button"
    on:click={() => (reveal = !reveal)}
  />
</TextInput>
