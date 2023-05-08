<script lang="ts">
  import { page } from '$app/stores';

  export let title: string;
  export let description: string | undefined = undefined;
  export let image: string | undefined = undefined;
  export let twitterCard: 'summary' | 'summary_large_image' = 'summary';

  $: ({
    url: { href },
  } = $page);
</script>

<svelte:head>
  <title>{title} · PRIM</title>
  <meta content={title} property="og:title" />
  {#if description}
    <meta name="description" content={description} />
    <meta content={description} property="og:description" />
  {/if}
  {#if image}
    <meta content={image} property="og:image" />
    <meta content={image} property="twitter:image" />
  {/if}
  <link {href} rel="canonical" />
  <meta content={href} property="og:url" />
  <meta content="website" property="og:type" />
  <meta content={twitterCard} property="twitter:card" />
  <meta content="@primnow" property="twitter:site" />
</svelte:head>
