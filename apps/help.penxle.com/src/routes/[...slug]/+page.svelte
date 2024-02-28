<script lang="ts">
  import { css } from '$styled-system/css';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<article>
  <h1 class={css({ fontSize: '24px', fontWeight: 'bold' })}>{data.meta.title}</h1>

  <hr class={css({ marginTop: '8px', marginBottom: '16px' })} />

  <div class="prose">
    <svelte:component this={data.content} />
  </div>
</article>
