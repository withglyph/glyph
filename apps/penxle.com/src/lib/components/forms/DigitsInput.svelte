<script lang="ts">
  import { clsx } from 'clsx';
  import { getFormContext } from '$lib/form';
  import type { HTMLInputAttributes } from 'svelte/elements';

  export let name: HTMLInputAttributes['name'] = undefined;
  export let value: HTMLInputAttributes['value'] = undefined;
  let _class: HTMLInputAttributes['class'] = undefined;
  export { _class as class };

  type $$Props = HTMLInputAttributes;

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }

  $: value = value?.replaceAll(/\D/g, '');

  const length = 6;
</script>

<div class={clsx('relative overflow-clip', _class)}>
  <div class="flex justify-center items-center gap-2" role="presentation">
    <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
    {#each Array.from({ length }) as _, i (i)}
      <div class="square-10 border border-rd-2.5 border-alphagray-10"></div>
    {/each}
  </div>
  <input
    id={name}
    {name}
    class={clsx(
      // NOTE: magic number 2.5rem = 상자 크기(square-10), 0.5rem = 상자 간격(gap-2)
      'absolute top-0 bottom-0 left-0 z-0',
      `right-[calc(((2.5rem-1ch)/2+0.5rem)*-1)]`, // NOTE: 마지막 글자의 letter spacing으로 인한 오버플로우를 방지하는 여유 공간
      'text-5 font-not-italic font-600 lh-normal',
      `tabular-nums tracking-[calc(2.5rem-1ch+0.5rem)]`,
      `indent-[calc((2.5rem-1ch)/2)]`,
    )}
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
