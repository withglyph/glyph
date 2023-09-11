<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import DeleteSpaceModal from './DeleteSpaceModal.svelte';

  $: query = graphql(`
    query SpaceDashboardPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name

        meAsMember {
          id
          role
        }

        ...SpaceDashboardPage_DeleteSpaceModal_space
      }
    }
  `);

  let openDeleteSpace = false;
</script>

<Helmet title={`대시보드 | ${$query.space.name}}`} />

<a
  class="flex items-center text-sm text-gray-50"
  href={`/${$query.space.slug}`}
>
  {$query.space.name}
  <span class="i-lc-chevron-right" />
</a>
<div class="text-2xl font-bold">대시보드</div>

{#if $query.space.meAsMember?.role === 'OWNER'}
  <button
    class="rounded px-4 py-2 font-medium text-red-50 hover:bg-red-5"
    type="button"
    on:click={() => (openDeleteSpace = true)}
  >
    스페이스 삭제하기
  </button>

  <DeleteSpaceModal $space={$query.space} bind:open={openDeleteSpace} />
{/if}
