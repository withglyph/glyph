<script lang="ts">
  import { page } from '$app/stores';

  export let type = 'website';
  export let title: string;
  export let titleSuffix = ' | 글리프';
  export let description: string;
  export let image: string | { src: string; size: 'small' | 'large' } | undefined = undefined;
  export let struct: Record<string, unknown> | undefined = undefined;

  $: ({
    url: { href },
  } = $page);
</script>

<svelte:head>
  <title>{title}{titleSuffix}</title>
  <meta content={`${title}${titleSuffix}`} property="og:title" />
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
  <meta content="글리프" property="og:site_name" />
  <meta content={type} property="og:type" />
  <meta content="ko_KR" property="og:locale" />
  <meta content="@withglyph" property="twitter:site" />
  {#if struct}
    {@html '<script type="application/ld+json">' + JSON.stringify(struct) + '</script>'}
  {/if}
</svelte:head>
