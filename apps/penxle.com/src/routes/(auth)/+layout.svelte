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
  <Image
    style={css.raw({ position: 'fixed', inset: '0', size: 'full', objectFit: 'cover' })}
    $image={$query.authLayoutBackgroundImage}
  />
{:else}
  <div class={css({ position: 'fixed', inset: '0', size: 'full', backgroundColor: 'gray.100' })} />
{/if}

<main class={center({ margin: 'auto', width: 'full' })}>
  <div
    class={flex({
      flexDirection: 'column',
      paddingX: { base: '20px', sm: '32px' },
      width: 'full',
      height: { base: 'screen', sm: '524px' },
      backgroundColor: 'gray.5',
      zIndex: '1',
      sm: {
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
