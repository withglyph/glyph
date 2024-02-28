<script lang="ts">
  import { nanoid } from 'nanoid';
  import { Icon } from '$lib/components';
  import { css, cx, sva } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { ComponentType } from 'svelte';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let name: string;
  export let items: { label: string; value: string | number; icon?: ComponentType; checked: boolean; text?: string }[];

  export let variant: 'gallery' | 'list' = 'gallery';
  export let size: 'sm' | 'md' = 'md';

  const recipe = sva({
    slots: ['root', 'icon', 'item'],
    base: {
      root: {
        'position': 'relative',
        'display': 'flex',
        'justifyContent': 'center',
        'alignItems': 'center',
        'borderWidth': '1px',
        'borderColor': 'gray.100',
        'marginBottom': '6px',
        'backgroundColor': 'gray.50',
        '&:has(:checked)': {
          borderColor: 'teal.500',
          backgroundColor: 'teal.50',
        },
      },
      icon: {
        color: { base: 'gray.400', _peerChecked: 'teal.500' },
      },
      item: {
        _after: { content: '""', position: 'absolute', inset: '0', cursor: 'pointer' },
      },
    },
    variants: {
      variant: {
        gallery: {
          item: {
            textAlign: 'center',
            color: 'gray.400',
            fontWeight: 'medium',
          },
        },
        list: {
          root: {
            gap: '6px',
            borderRadius: '4px',
            marginBottom: '0',
            paddingLeft: '8px',
            paddingRight: '18px',
            width: 'full',
            height: '32px',
          },
          item: {
            flexGrow: '1',
            fontSize: '11px',
            fontWeight: 'medium',
            color: { base: 'gray.400', _peerChecked: 'teal.500' },
          },
        },
      },
      size: {
        sm: { icon: { size: '20px' } },
        md: { icon: { size: '32px' } },
      },
    },
    compoundVariants: [
      {
        variant: 'gallery',
        size: 'sm',
        css: {
          root: { size: '48px', borderRadius: '6px' },
          item: { fontSize: '11px' },
        },
      },
      {
        variant: 'gallery',
        size: 'md',
        css: {
          root: { size: '64px', borderRadius: '10px' },
          item: { fontSize: '13px' },
        },
      },
    ],
  });

  $: styles = recipe.raw({ variant, size });
</script>

<fieldset class={css({ display: 'flex', gap: '12px' }, variant === 'list' && { flexDirection: 'column' }, style)}>
  {#each items as item (item.value)}
    {@const id = nanoid()}
    <div class={center({ position: 'relative', flexDirection: 'column' })}>
      <div class={css(styles.root)}>
        <input
          {id}
          {name}
          class={cx('peer', css({ position: 'absolute', size: 'full', appearance: 'none' }))}
          checked={item.checked}
          type="radio"
          value={item.value}
          on:change
        />

        {#if item.icon}
          <Icon style={styles.icon} icon={item.icon} />
        {:else if item.text}
          <span
            class={css({
              fontSize: '18px',
              fontWeight: 'semibold',
              color: { base: 'gray.400', _peerChecked: 'teal.500' },
            })}
          >
            {item.text}
          </span>
        {/if}

        {#if variant === 'list'}
          <label class={css(styles.item)} for={id}>
            {item.label}
          </label>
        {/if}
      </div>
      {#if variant === 'gallery'}
        <label class={css(styles.item)} for={id}>
          {item.label}
        </label>
      {/if}
    </div>
  {/each}
</fieldset>
