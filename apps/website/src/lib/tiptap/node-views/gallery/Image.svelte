<script lang="ts">
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { Image } from '$lib/components';
  import { RingSpinner } from '$lib/components/spinners';
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  $: query = graphql(`
    query TiptapGalleryNodeView_Image_Query($id: ID!) @_manual {
      image(id: $id) {
        id
        ...Image_image
      }
    }
  `);

  onMount(() => {
    query.refetch({ id });
  });

  export let style: SystemStyleObject | undefined = undefined;
  export let id: string;
</script>

{#if $query}
  <Image {style} $image={$query.image} size="full" />
{:else}
  <div
    class={css(style, { display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'gray.50' })}
  >
    <RingSpinner style={css.raw({ size: '32px', color: 'brand.400' })} />
  </div>
{/if}
