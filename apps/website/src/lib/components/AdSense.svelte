<script lang="ts">
  import { onMount } from 'svelte';
  import IconHelpLine from '~icons/glyph/help-line';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import Icon from './Icon.svelte';
  import Link from './Link.svelte';
  import Tooltip from './Tooltip.svelte';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let slotId: string;

  onMount(() => {
    // @ts-expect-error - Google AdSense
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  });
</script>

<div class={css({ position: 'relative', backgroundColor: 'gray.200' }, style)}>
  <ins
    style="display:block"
    class="adsbygoogle"
    data-ad-client="ca-pub-4449202773959958"
    data-ad-format="auto"
    data-ad-slot={slotId}
    data-full-width-responsive="true"
  ></ins>

  <div
    class={flex({
      position: 'absolute',
      top: '0',
      right: '0',
      justify: 'flex-end',
      align: 'center',
      gap: '2px',
      translate: 'auto',
      translateY: '-full',
    })}
  >
    <Link class={css({ fontSize: '12px', color: 'gray.400' })} external href="https://withglyph.com/glyph/1109158689">
      광고 테스트를 진행하고 있어요
    </Link>
    <Tooltip message="일부 이용자 대상으로 5월 22일까지 랜덤하게 노출돼요">
      <Icon
        style={css.raw({ 'color': 'gray.400', 'size': '14px', '& *': { strokeWidth: '[1]' } })}
        icon={IconHelpLine}
      />
    </Tooltip>
  </div>
</div>
