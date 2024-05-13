<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import IconX from '~icons/tabler/x';
  import { beforeNavigate } from '$app/navigation';
  import { Icon } from '$lib/components';
  import { portal, scrollLock } from '$lib/svelte/actions';
  import { css, sva } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import type { RecipeVariant, SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
  export let open: boolean;
  export let size: Variants['size'] = 'md';

  beforeNavigate(() => {
    open = false;
  });

  type Variants = RecipeVariant<typeof recipe>;
  const recipe = sva({
    slots: ['root', 'container', 'action'],
    base: {
      root: { position: 'absolute', display: 'flex', inset: '0', pointerEvents: 'none' },
      container: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '16px',
        width: 'full',
        maxHeight: 'full',
        backgroundColor: 'gray.0',
        pointerEvents: 'auto',
        userSelect: 'text',
      },
      action: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center' },
    },
    variants: {
      size: {
        sm: {
          root: { justifyContent: 'center', alignItems: 'center', padding: '20px' },
          container: { padding: '16px', paddingTop: '32px', maxWidth: '368px' },
          action: { marginTop: '16px' },
        },
        md: {
          root: {
            justifyContent: 'center',
            alignItems: 'flex-end',
            width: 'full',
            sm: { padding: '24px', alignItems: 'center' },
          },
          container: {
            paddingX: '24px',
            paddingTop: '16px',
            paddingBottom: '22px',
            borderBottomRadius: '0',
            sm: { maxWidth: '430px', borderRadius: '16px' },
          },
          action: { marginTop: '24px' },
        },
        lg: {
          root: {
            justifyContent: 'center',
            alignItems: 'flex-end',
            width: 'full',
            sm: { padding: '36px', alignItems: 'center' },
          },
          container: {
            padding: '28px',
            paddingTop: '20px',
            borderBottomRadius: '0',
            sm: { maxWidth: '748px', borderRadius: '16px' },
          },
          action: { marginTop: '16px' },
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
      class={css({
        position: 'absolute',
        inset: '0',
        backgroundColor: 'gray.900/50',
        backdropFilter: 'auto',
        backdropBlur: '8px',
      })}
      role="button"
      tabindex="-1"
      on:click={() => (open = false)}
      on:keypress={null}
      transition:fade={{ duration: 150 }}
    />

    <div class={classes.root}>
      <div class={classes.container} use:scrollLock in:fly={{ y: '10%', duration: 150 }} out:fade={{ duration: 150 }}>
        <div
          class={css(
            { display: 'flex', flexDirection: 'column', width: 'full', overflowY: 'auto' },
            size === 'sm' && { maxWidth: '368px' },
            style,
          )}
          data-scroll-lock-ignore
        >
          {#if $$slots.title}
            <div
              class={css(
                { display: 'flex', justifyContent: 'space-between', paddingY: '12px' },
                size === 'sm'
                  ? { justifyContent: 'center', textAlign: 'center' }
                  : { paddingTop: '16px', paddingBottom: '0' },
              )}
            >
              <div
                class={css(
                  { display: 'flex', flexDirection: 'column', wordBreak: 'break-all' },
                  size !== 'sm' && { paddingRight: '36px', marginTop: '16px', marginBottom: '16px' },
                  size !== 'sm' && 'text' in $$slots && { marginBottom: '8px' },
                )}
              >
                <h3
                  class={css(
                    { wordBreak: 'keep-all' },
                    size === 'sm' ? { fontSize: '18px', fontWeight: 'bold' } : { fontSize: '20px', fontWeight: 'bold' },
                  )}
                >
                  <slot name="title" />
                </h3>
                {#if $$slots.subtitle}
                  <div
                    class={css(
                      {
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '4px',
                        fontSize: '16px',
                        fontWeight: 'medium',
                        color: 'gray.500',
                      },
                      size === 'sm' && { justifyContent: 'center', textAlign: 'center' },
                    )}
                  >
                    <h4>
                      <slot name="subtitle" />
                    </h4>
                  </div>
                {/if}
              </div>
              {#if size !== 'sm'}
                <button
                  class={center({
                    position: 'absolute',
                    borderRadius: '4px',
                    right: '24px',
                    size: '28px',
                    color: 'gray.500',
                    transition: 'common',
                    zIndex: '1',
                    _hover: { backgroundColor: 'gray.100', color: 'gray.600' },
                  })}
                  type="button"
                  on:click={() => (open = false)}
                >
                  <Icon icon={IconX} size={24} />
                </button>
              {/if}
            </div>
          {:else}
            <button
              class={center({
                position: 'absolute',
                borderRadius: '4px',
                right: '24px',
                size: '28px',
                color: 'gray.500',
                transition: 'common',
                zIndex: '1',
                _hover: { backgroundColor: 'gray.100', color: 'gray.600' },
              })}
              type="button"
              on:click={() => (open = false)}
            >
              <Icon icon={IconX} size={24} />
            </button>
          {/if}

          <slot name="text" />
          <slot />

          {#if $$slots.action}
            <div class={classes.action}>
              <slot name="action" />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  * {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */

    & ::-webkit-scrollbar {
      display: none;
    }
  }
</style>
