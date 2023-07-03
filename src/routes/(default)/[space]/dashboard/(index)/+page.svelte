<script lang="ts">
  import { Helmet } from '$lib/components';
  import { graphql, useQuery } from '$lib/houdini';
  import DeleteSpaceModal from './DeleteSpaceModal.svelte';

  $: query = useQuery(
    graphql(`
      query SpaceDashboardPage_Query($slug: String!) @load {
        space(slug: $slug) {
          id
          slug
          name

          meAsMember {
            canAdministrate
          }

          ...SpaceDashboardPage_DeleteSpaceModal_space
        }
      }
    `)
  );

  let openDeleteSpace = false;
</script>

<Helmet title={`대시보드 | ${$query.space.name}}`} />

<a
  class="flex items-center text-sm text-gray-500"
  href={`/${$query.space.slug}`}
>
  {$query.space.name}
  <span class="i-lc-chevron-right" />
</a>
<div class="text-2xl font-bold">대시보드</div>

{#if $query.space.meAsMember?.canAdministrate}
  <button
    class="rounded px-4 py-2 font-medium text-red-500 hover:bg-red-50"
    type="button"
    on:click={() => (openDeleteSpace = true)}
  >
    스페이스 삭제하기
  </button>

  <DeleteSpaceModal _space={$query.space} bind:open={openDeleteSpace} />
{/if}
