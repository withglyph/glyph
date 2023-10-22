<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<Helmet title={data.meta.title} />

<article>
  <h1 class="text-2xl font-bold">{data.meta.title}</h1>

  <hr class="mb-4 mt-2" />

  <div class="prose">
    <svelte:component this={data.content} />
  </div>
</article>
