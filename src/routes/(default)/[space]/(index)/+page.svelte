<script lang="ts">
  import { Helmet } from '$lib/components';
  import { graphql, useQuery } from '$lib/houdini';

  $: query = useQuery(
    graphql(`
      query SpacePage_Query($slug: String!) @load {
        space(slug: $slug) {
          slug
          name

          meAsMember {
            __typename
          }
        }
      }
    `)
  );
</script>

<Helmet title={$query.space.name} />

<div class="flex items-center">
  <div class="grow text-2xl font-semibold">
    {$query.space.name}
  </div>
  {#if $query.space.meAsMember}
    <a
      class="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      href="/{$query.space.slug}/dashboard"
    >
      <span class="i-lc-mouse-pointer-click" />
      대시보드
    </a>
  {/if}
</div>
