<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { Button } from '$lib/components';
  import { graphql, refetchQueries, useQuery } from '$lib/houdini';

  $: query = useQuery(
    graphql(`
      query AvatarsPage_Query @load {
        randomAvatars
      }
    `),
  );
</script>

<Helmet title="아바타 플레이그라운드" />

<div class="flex grow center">
  <div class="w-150 flex flex-col center gap-4">
    <div class="grid grid-cols-4 gap-4">
      {#each $query.randomAvatars as avatar (avatar)}
        <img
          class="square-full border rounded-full"
          alt=""
          src={`data:image/svg+xml;base64,${btoa(avatar)}`}
        />
      {/each}
    </div>

    <Button
      size="md"
      color="primary"
      on:click={async () => refetchQueries('AvatarsPage_Query')}
    >
      재생성
    </Button>
  </div>
</div>
