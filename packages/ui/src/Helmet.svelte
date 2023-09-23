<script lang="ts">
  import { page } from '$app/stores';

  export let title: string;
  export let description: string | undefined = undefined;
  export let image: string | { src: string; size: 'small' | 'large' } | undefined = undefined;

  $: ({
    url: { href },
  } = $page);
</script>

<svelte:head>
  <title>{title}</title>
  <meta content={title} property="og:title" />
  {#if description}
    <meta name="description" content={description} />
    <meta content={description} property="og:description" />
  {/if}
  {#if typeof image === 'string'}
    <meta content={image} property="og:image" />
    <meta content="summary" property="twitter:card" />
  {:else if typeof image === 'object'}
    <meta content={image.src} property="og:image" />
    {#if image.size === 'large'}
      <meta content="summary_large_image" property="twitter:card" />
    {:else}
      <meta content="summary" property="twitter:card" />
    {/if}
  {/if}
  <link {href} rel="canonical" />
  <meta content={href} property="og:url" />
  <meta content="website" property="og:type" />
  <meta content="@penxle" property="twitter:site" />
</svelte:head>
