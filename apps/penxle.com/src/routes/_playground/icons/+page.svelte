<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';

  $: query = graphql(`
    query PlaygroundIconsPage_Query {
      randomIcons
    }
  `);
</script>

<Helmet title="스페이스 아이콘 플레이그라운드" />

<div class="flex grow center">
  <div class="w-150 flex flex-col center gap-4">
    <div class="grid grid-cols-4 gap-4">
      {#each $query.randomIcons as icon, idx (idx)}
        <img class="square-full border rounded-3xl" alt="" src={`data:image/png;base64,${icon}`} />
      {/each}
    </div>

    <Button color="primary" size="md" on:click={() => query.refetch()}>재생성</Button>
  </div>
</div>
