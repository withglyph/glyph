<script lang="ts">
  import IconHelpLine from '~icons/glyph/help-line';
  import { Icon, Tooltip } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import type { PostTagKind } from '$glitch';

  type TagInput = {
    name: string;
    kind: PostTagKind;
  };

  export let tags: TagInput[] = [];

  $: challengeTag = tags.find((tag) => tag.kind === 'CHALLENGE');
</script>

<div>
  <h3
    class={flex({
      align: 'center',
      gap: '4px',
      paddingBottom: '8px',
      fontSize: '14px',
    })}
  >
    챌린지 참여
    <Tooltip style={center.raw()} message="챌린지 태그를 추가해 챌린지에 참여해보세요" placement="top">
      <Icon
        style={css.raw({ 'color': 'gray.400', 'size': '14px', '& *': { strokeWidth: '[1]' } })}
        icon={IconHelpLine}
        size={12}
      />
    </Tooltip>
  </h3>

  <div class={flex({ align: 'center', gap: '8px', marginTop: '8px' })}>
    <button
      class={css({
        borderWidth: '1px',
        borderColor: { base: 'gray.100', _pressed: 'brand.400' },
        paddingY: '7px',
        paddingX: '12px',
        width: '86px',
        fontSize: '14px',
        fontWeight: 'medium',
        color: { base: 'gray.500', _pressed: 'brand.400' },
        backgroundColor: { base: 'gray.100', _pressed: 'brand.50' },
      })}
      aria-pressed={!challengeTag}
      type="button"
      on:click={() => {
        tags = tags.filter((tag) => tag.kind !== 'CHALLENGE');
      }}
    >
      미참여
    </button>
    <button
      class={css({
        borderWidth: '1px',
        borderColor: { base: 'gray.100', _pressed: 'brand.400' },
        paddingY: '7px',
        paddingX: '12px',
        width: '86px',
        fontSize: '14px',
        fontWeight: 'medium',
        color: { base: 'gray.500', _pressed: 'brand.400' },
        backgroundColor: { base: 'gray.100', _pressed: 'brand.50' },
      })}
      aria-pressed={!!challengeTag}
      type="button"
      on:click={() => {
        if (!challengeTag) tags = [...tags, { kind: 'CHALLENGE', name: '주간창작_6월_3주차' }];
      }}
    >
      참여
    </button>
  </div>

  {#if !!challengeTag}
    <div class={css({ marginTop: '42px' })}>
      <h4 class={css({ marginBottom: '8px', fontSize: '14px', color: 'brand.400' })}>
        {challengeTag.name === '주간창작_6월_3주차' ? '이번주' : '참여한'} 챌린지 태그
      </h4>

      <ul class={flex({ align: 'center', gap: '8px' })}>
        <li
          class={css({
            paddingY: '7px',
            paddingX: '12px',
            fontSize: '14px',
            fontWeight: 'medium',
            color: 'brand.400',
            backgroundColor: 'brand.50',
          })}
        >
          {challengeTag ? challengeTag.name : '주간창작_6월_3주차'}
        </li>
      </ul>
    </div>
  {/if}
</div>
