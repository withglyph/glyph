<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { Avatar } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import PublishButton from './PublishButton.svelte';
  import type {
    SpacePublishArtworkPage_Header_query,
    SpacePublishArtworkPage_Header_space,
  } from '$glitch';
  import type { Artwork } from './types';

  export let _query: SpacePublishArtworkPage_Header_query;
  export let _space: SpacePublishArtworkPage_Header_space;
  export let artworks: Artwork[];

  $: query = fragment(
    _query,
    graphql(`
      fragment SpacePublishArtworkPage_Header_query on Query {
        me @_required {
          id

          profile {
            id
            ...Avatar_profile
          }
        }
      }
    `),
  );

  $: space = fragment(
    _space,
    graphql(`
      fragment SpacePublishArtworkPage_Header_space on Space {
        name
        ...SpacePublishArtworkPage_PublishButton_space
      }
    `),
  );
</script>

<div class="sticky top-0 z-50 bg-white py-4">
  <div class="mx-auto w-4xl flex items-center gap-4">
    <Logo class="square-8" />
    <div class="text-sm text-gray-50">
      {$space.name}에 새 그림 게시중...
    </div>
    <div class="grow" />
    <PublishButton _space={$space} bind:artworks />
    <Avatar class="square-8" _profile={$query.me.profile} />
  </div>
</div>
