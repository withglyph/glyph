<script lang="ts">
  import { fragment, graphql } from '$houdini';
  import { Avatar } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import PublishButton from './PublishButton.svelte';
  import type { Artwork } from './types';
  import type { SpacePublishArtworkPage_Header_query } from '$houdini';

  export let _query: SpacePublishArtworkPage_Header_query;
  export let artworks: Artwork[];

  $: query = fragment(
    _query,
    graphql(`
      fragment SpacePublishArtworkPage_Header_query on Query
      @arguments(slug: { type: "String!" }) {
        me {
          ...Avatar_profile
        }

        space(slug: $slug) {
          name
          ...SpacePublishArtworkPage_PublishButton_space
        }
      }
    `),
  );
</script>

<div class="sticky top-0 z-50 bg-white py-4">
  <div class="mx-auto w-4xl flex items-center gap-4">
    <Logo class="square-8" />
    <div class="text-sm text-gray-500">
      {$query.space.name}에 새 그림 게시중...
    </div>
    <div class="grow" />
    <PublishButton _space={$query.space} bind:artworks />
    <Avatar class="square-8" _profile={$query.me} />
  </div>
</div>
