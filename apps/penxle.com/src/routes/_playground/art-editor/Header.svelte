<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { Avatar } from '$lib/components';
  import { Logo } from '$lib/components/branding';
  import PublishButton from './PublishButton.svelte';
  import type { SpacePublishArtworkPage_Header_query } from '$glitch';
  import type { Artwork } from './types';

  let _query: SpacePublishArtworkPage_Header_query;
  export { _query as $query };
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
</script>

<div class="sticky top-0 z-50 bg-white py-4">
  <div class="mx-auto w-4xl flex items-center gap-4">
    <Logo class="square-8" />
    <div class="grow" />
    <PublishButton bind:artworks />
    <Avatar class="square-8" $profile={$query.me.profile} />
  </div>
</div>
