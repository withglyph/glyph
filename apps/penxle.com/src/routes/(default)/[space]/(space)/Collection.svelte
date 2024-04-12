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
  <Image
    style={css.raw({
      borderWidth: '[0.8px]',
      borderColor: 'gray.100',
      width: 'full',
      aspectRatio: '4/5',
    })}
    $image={$spaceCollection.thumbnail}
    placeholder
  />
  <p class={css({ marginTop: '6px', fontSize: '15px', fontWeight: 'semibold' })}>{$spaceCollection.name}</p>
  <p class={css({ fontSize: '14px', color: 'gray.600' })}>포스트 {comma($spaceCollection.count)}개</p>
</a>
