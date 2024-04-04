<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { Image } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import type { SpacePage_Collection_space, SpacePage_Collection_spaceCollection } from '$glitch';

  let _space: SpacePage_Collection_space;
  let _spaceCollection: SpacePage_Collection_spaceCollection;
  export { _space as $space, _spaceCollection as $spaceCollection };

  $: space = fragment(
    _space,
    graphql(`
      fragment SpacePage_Collection_space on Space {
        id
        slug
      }
    `),
  );

  $: spaceCollection = fragment(
    _spaceCollection,
    graphql(`
      fragment SpacePage_Collection_spaceCollection on SpaceCollection {
        id
        name
        count

        thumbnail {
          id
          ...Image_image
        }
      }
    `),
  );
</script>

<a href="/{$space.slug}/collections/{$spaceCollection.id}">
  <!-- TODO: image placeholder -->
  {#if $spaceCollection.thumbnail}
    <Image
      style={css.raw({ width: { base: '161px', sm: '206px' }, aspectRatio: '4/5' })}
      $image={$spaceCollection.thumbnail}
    />
  {:else}
    <div class={css({ width: { base: '161px', sm: '206px' }, backgroundColor: 'gray.100', aspectRatio: '4/5' })} />
  {/if}
  <p class={css({ marginTop: '6px', fontWeight: 'semibold' })}>{$spaceCollection.name}</p>
  <p class={css({ fontSize: '14px', color: 'gray.600' })}>포스트 {comma($spaceCollection.count)}개</p>
</a>
