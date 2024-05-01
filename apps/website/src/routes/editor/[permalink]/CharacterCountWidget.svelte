<script lang="ts">
  import { Tooltip } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { Placement } from '@floating-ui/dom';
  import type { Editor } from '@tiptap/core';
  import type { SystemStyleObject } from '$styled-system/types';

  export let editor: Editor | undefined;
  export let style: SystemStyleObject | undefined = undefined;
  export let offset: number;
  export let placement: Placement;

  $: doc = editor?.state.doc;
  $: text = doc?.textBetween(0, doc.content.size, '\n');
  $: countWithWhitespace = text?.length ?? 0;
  $: countWithoutWhitespace = text?.replaceAll(/\s/g, '').length ?? 0;

  const listStyle = flex({
    'fontSize': '13px',
    'gap': '9px',
    'justifyContent': 'space-between',
    '&>dt': { color: 'gray.600' },
    '&>dd': { color: 'gray.900' },
  });
</script>

<Tooltip {style} {offset} {placement}>
  <span class={css({ color: 'gray.500' })}>
    {countWithWhitespace}자
  </span>
  <svelte:fragment slot="message">
    <dl class={listStyle}>
      <dt>공백 미포함</dt>
      <dd>{countWithoutWhitespace}자</dd>
    </dl>
    <div class={listStyle}>
      <span>공백 포함</span>
      <span>{countWithWhitespace}자</span>
    </div>
  </svelte:fragment>
</Tooltip>
