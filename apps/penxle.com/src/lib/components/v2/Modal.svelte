<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import IconX from '~icons/tabler/x';
  import { Icon } from '$lib/components';
  import { portal, scrollLock } from '$lib/svelte/actions';
  import { css, sva } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let open: boolean;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let style: SystemStyleObject | undefined = undefined;
  export let titleStyle: SystemStyleObject | undefined = undefined;
  export let actionStyle: SystemStyleObject | undefined = undefined;

  const recipe = sva({
    slots: ['root', 'container'],
    base: {
      root: {
        position: 'absolute',
        inset: '0',
        display: 'flex',
        pointerEvents: 'none',
      },
      container: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '10px',
        width: 'full',
        maxHeight: { base: '540px', sm: '600px' },
        backgroundColor: 'gray.5',
        boxShadow: '[0 8px 24px 0 {colors.gray.900/28}]',
        pointerEvents: 'auto',
        userSelect: 'text',
      },
    },
    variants: {
      size: {
        sm: {
          root: {
            padding: '20px',
            justifyContent: 'center',
            alignItems: 'center',
          },
          container: {
            maxWidth: '368px',
          },
        },
        md: {
          root: {
            justifyContent: 'center',
            alignItems: 'flex-end',
            width: 'full',
            sm: { padding: '24px', alignItems: 'center' },
          },
          container: {
            smDown: { borderBottomRadius: '0' },
            sm: { borderRadius: '16px', maxWidth: '430px' },
          },
        },
        lg: {
          root: {
            justifyContent: 'center',
            alignItems: 'flex-end',
            width: 'full',
            sm: { padding: '36px', alignItems: 'center' },
          },
          container: {
            smDown: { borderBottomRadius: '0' },
            sm: { borderRadius: '16px', maxWidth: '748px' },
          },
        },
      },
    },
  });

  $: classes = recipe({ size });
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && (open = false)} />

{#if open}
  <div class={css({ position: 'fixed', inset: '0', zIndex: '50' })} use:portal>
    <div
      class={css({ position: 'absolute', inset: '0', backgroundColor: 'gray.900/40' })}
      role="button"
      tabindex="-1"
      on:click={() => (open = false)}
      on:keypress={null}
      transition:fade={{ duration: 150 }}
    />

    <div class={classes.root}>
      <div class={classes.container} use:scrollLock in:fly={{ y: 10 }} out:fade={{ duration: 150 }}>
        <header
          class={css(
            { position: 'relative', display: 'flex', alignItems: 'center' },
            size === 'sm' && { paddingTop: '24px', paddingX: '24px', sm: { paddingTop: '28px', paddingX: '28px' } },
            size !== 'sm' && {
              paddingX: '24px',
              paddingY: '14px',
              borderBottomWidth: '1px',
              borderBottomColor: 'gray.200',
            },
          )}
        >
          <slot name="title-left" />

          <h3
            class={css(
              { display: 'flex', flex: '1', marginRight: '32px', fontWeight: 'semibold', wordBreak: 'keep-all' },
              titleStyle,
            )}
          >
            <slot name="title" />
          </h3>

          {#if $$slots['title'] && size !== 'sm'}
            <slot name="title-right">
              <button
                class={css({ position: 'absolute', right: '0', paddingX: '24px' })}
                type="button"
                on:click={() => (open = false)}
              >
                <Icon style={css.raw({ size: '24px' })} icon={IconX} />
              </button>
            </slot>
          {/if}
        </header>

        <div
          class={css(
            {
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              borderBottomRadius: '[inherit]',
              width: 'full',
              overflowY: 'auto',
            },
            style,
          )}
          data-scroll-lock-ignore
        >
          <slot />

          {#if $$slots.action}
            <div
              class={css(
                {
                  position: 'sticky',
                  bottom: '0',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  borderTopWidth: '1px',
                  borderTopColor: 'gray.200',
                  borderBottomRadius: '[inherit]',
                  paddingX: '24px',
                  paddingY: '16px',
                  width: 'full',
                  backgroundColor: 'gray.5',
                },
                actionStyle,
              )}
            >
              <slot name="action" />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
