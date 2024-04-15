<script lang="ts">
  import FullLogo from '$assets/logos/full.svg?component';
  import { graphql } from '$glitch';
  import { Image } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  $: query = graphql(`
    query AuthLayout_Query {
      authLayoutBackgroundImage {
        id
        ...Image_image
      }
    }
  `);
</script>

{#if $query.authLayoutBackgroundImage}
  <div class={css({ position: 'fixed', size: 'full', inset: '0' })}>
    <Image
      style={css.raw({ size: 'full', objectFit: 'cover' })}
      $image={$query.authLayoutBackgroundImage}
      size="full"
    />
    <div
      class={css({
        position: 'absolute',
        inset: '0',
        backgroundColor: '[gray.900/40]',
      })}
    />
  </div>
{:else}
  <div class={css({ position: 'fixed', size: 'full', inset: '0' })}>
    <div class={css({ size: 'full', backgroundColor: 'gray.100' })} />
    <div
      class={css({
        position: 'absolute',
        inset: '0',
        backgroundColor: '[gray.900/40]',
      })}
    />
  </div>
{/if}

<main class={center({ margin: 'auto', width: 'full' })}>
  <div
    class={flex({
      flexDirection: 'column',
      paddingX: { base: '20px', sm: '32px' },
      width: 'full',
      height: { base: 'screen', sm: '536px' },
      backgroundColor: 'gray.5',
      zIndex: '1',
      overflowY: 'auto',
      sm: {
        borderWidth: '1px',
        borderColor: 'gray.600',
        paddingTop: '32px',
        maxWidth: '420px',
      },
    })}
  >
    <a class={css({ smDown: { marginTop: '120px', marginBottom: '70px' } })} href="/">
      <FullLogo class={css({ width: { base: 'full', sm: 'fit' }, height: { base: '38px', sm: '17px' } })} />
    </a>
    <slot />
  </div>
</main>
