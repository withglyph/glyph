<script lang="ts">
  import { getFormContext } from '$lib/form';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import FormValidationMessage from './FormValidationMessage.svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import type { SystemStyleObject } from '$styled-system/types';

  export let name: HTMLInputAttributes['name'] = undefined;
  export let value: HTMLInputAttributes['value'] = undefined;
  export let style: SystemStyleObject | undefined = undefined;

  type $$Props = HTMLInputAttributes & { style?: SystemStyleObject };

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }

  $: value = value?.replaceAll(/\D/g, '');

  const length = 6;
</script>

<div class={css({ position: 'relative', paddingY: '10px', width: 'fit', overflow: 'clip' }, style)}>
  <div class={center({ gap: '8px' })} role="presentation">
    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
    {#each Array.from({ length }) as _, i (i)}
      <div class={css({ borderWidth: '1px', borderColor: 'gray.200', size: '50px' })} />
    {/each}
  </div>
  <input
    id={name}
    {name}
    class={css({
      // magic number 설명
      // 50px = 각 자리 상자 크기
      // 8px = 상자간 간격
      position: 'absolute',
      top: '0',
      bottom: '0',
      left: '0',
      right: '[calc(((50px - 1ch) / 2 + 8px) * -1)]', // 마지막 글자의 letter spacing으로 인한 오버플로우를 방지하는 여유 공간
      fontSize: '20px',
      fontWeight: 'semibold',
      fontStyle: 'normal',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: '[1.5]',
      letterSpacing: '[calc(50px - 1ch + 8px)]',
      textIndent: '[calc((50px - 1ch) / 2)]',
      zIndex: '0',
    })}
    autocomplete="one-time-code"
    inputmode="numeric"
    maxlength={length}
    pattern="\d*"
    type="text"
    on:input
    bind:value
    {...$$restProps}
  />
</div>

{#if name}
  <div
    class={css({
      fontSize: '13px',
      lineHeight: '[18px]',
      color: 'red.600',
      minHeight: '18px',
    })}
  >
    <FormValidationMessage for={name} let:message>
      * {message}
    </FormValidationMessage>
  </div>
{/if}
