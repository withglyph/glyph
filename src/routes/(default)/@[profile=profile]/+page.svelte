<script lang="ts">
  import { page } from '$app/stores';
  import { Avatar, Helmet } from '$lib/components';
  import { graphql, useQuery } from '$lib/houdini';

  $: query = useQuery(
    graphql(`
      query ProfilePage_Query($handle: String!) @load {
        profile(handle: $handle) {
          name
          handle

          spaces {
            id
            slug
            name
          }

          ...Avatar_profile
        }
      }
    `)
  );
</script>

<Helmet title={$query.profile.name} />

<div class="flex items-center gap-4">
  <Avatar class="square-24" $profile={$query.profile} />
  <div class="flex grow flex-col gap-2">
    <div class="text-2xl font-semibold">
      {$query.profile.name}
    </div>
    <div class="flex items-center gap-2 text-sm text-gray-700">
      <span class="i-lc-link" />
      {$page.url.host}/@{$query.profile.handle}
    </div>
  </div>
</div>

<hr class="my-8" />

<div class="flex items-center gap-2 font-medium">
  <span class="i-lc-box text-gray-700" />
  스페이스
</div>

<div class="mt-4">
  {#each $query.profile.spaces as space (space.id)}
    <a class="block px-4 py-2 hover:bg-gray-100" href="/{space.slug}">
      {space.name}
    </a>
  {/each}
</div>
