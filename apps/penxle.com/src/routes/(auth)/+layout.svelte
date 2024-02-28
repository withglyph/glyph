<script lang="ts">
  import { graphql } from '$glitch';
  import { Image } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center } from '$styled-system/patterns';
  import Header from './Header.svelte';

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

<Header />

<main class={center({ paddingX: { base: '4px', sm: '0' }, margin: 'auto', width: 'full' })}>
  <div
    class={center({
      flexDirection: 'column',
      paddingX: { base: '20px', sm: '40px' },
      paddingY: '28px',
      borderRadius: '16px',
      width: 'full',
      maxWidth: '430px',
      backgroundColor: 'white',
      zIndex: '1',
    })}
  >
    <slot />
  </div>
</main>
