<script generics="T" lang="ts">
  import { nanoid } from 'nanoid';
  import { Icon, Tooltip } from '$lib/components';
  import { css, cx, sva } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { ComponentType } from 'svelte';
  import type { RecipeVariant } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let name: string;
  export let items: {
    label: string;
    value: T;
    icon?: ComponentType;
    checked: boolean;
    text?: string;
    disabled?: boolean;
    errorMessage?: string;
  }[];
  export let style: SystemStyleObject | undefined = undefined;
  export let variant: Variants['variant'] = 'gallery';
  export let size: Variants['size'] = 'lg';

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = sva({
    slots: ['root', 'icon', 'item'],
    base: {
      root: {
        'position': 'relative',
        'display': 'flex',
        'justifyContent': 'center',
        'alignItems': 'center',
        'backgroundColor': 'gray.50',
        '&:has(:checked)': {
          backgroundColor: 'brand.400',
        },
      },
      icon: {
        color: { base: 'gray.400', _peerChecked: 'gray.0' },
      },
      item: {
        _after: { content: '""', position: 'absolute', inset: '0' },
      },
    },
    variants: {
      variant: {
        'gallery': {
          item: {
            textAlign: 'center',
            color: 'gray.400',
            fontWeight: 'medium',
          },
        },
        'icon-list': {
          root: {
            gap: '4px',
            paddingLeft: '10px',
            paddingRight: '12px',
            width: 'full',
            height: '32px',
          },
          item: {
            flexGrow: '1',
            fontSize: '11px',
            fontWeight: 'medium',
            color: { base: 'gray.500', _peerChecked: 'gray.0' },
          },
        },
      },
      size: {
        sm: {},
        lg: {},
      },
    },
    compoundVariants: [
      {
        variant: 'gallery',
        size: 'sm',
        css: {
          root: { size: '48px', marginBottom: '6px' },
          item: { fontSize: '12px' },
        },
      },
      {
        variant: 'gallery',
        size: 'lg',
        css: {
          root: { size: '60px', marginBottom: '6px' },
          item: { fontSize: '14px', fontWeight: 'medium' },
        },
      },
    ],
  });

  $: styles = recipe.raw({ variant, size });
</script>

<fieldset
  class={css(
    { display: 'flex', gap: '16px' },
    variant === 'gallery' && size === 'sm' && { gap: '12px' },
    variant === 'icon-list' && { flexDirection: 'column' },
    style,
  )}
>
  {#each items as item (item.value)}
    {@const id = nanoid()}
    <Tooltip enabled={item.disabled} message={item.errorMessage} offset={10} placement="top">
      <div class={center({ position: 'relative', flexDirection: 'column' })}>
        <div class={css(styles.root)}>
          <input
            {id}
            {name}
            class={cx('peer', css({ position: 'absolute', size: 'full', appearance: 'none' }))}
            checked={item.checked}
            disabled={item.disabled}
            type="radio"
            value={item.value}
            on:change
          />

          {#if item.icon}
            <Icon style={styles.icon} icon={item.icon} size={variant === 'gallery' ? (size === 'sm' ? 20 : 32) : 16} />
          {:else if item.text}
            <span
              class={css({
                fontSize: '18px',
                fontWeight: 'semibold',
                color: { base: 'gray.400', _peerChecked: 'gray.0' },
              })}
            >
              {item.text}
            </span>
          {/if}

          {#if variant === 'icon-list'}
            <label class={css(styles.item, !item.disabled && { cursor: 'pointer' })} for={id}>
              {item.label}
            </label>
          {/if}
        </div>
        {#if variant === 'gallery'}
          <label class={css(styles.item, !item.disabled && { cursor: 'pointer' })} for={id}>
            {item.label}
          </label>
        {/if}
      </div>
    </Tooltip>
  {/each}
</fieldset>
