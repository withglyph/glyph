<script lang="ts">
  import Wordmark from '$assets/branding/wordmark.svg?component';
  import { Image } from '$lib/components';
  import { useQuery } from '$lib/houdini';
  import type { LayoutData } from './$houdini';

  export let data: LayoutData;
  $: query = useQuery(data.UserAuthLayout_Query);
</script>

<main class="flex grow center">
  {#if $query.authBackgroundImage}
    <Image
      class="pointer-events-none absolute inset-0 square-full object-cover"
      $image={$query.authBackgroundImage}
    />
  {/if}

  <a class="absolute left-4 top-4 z-1" href="/">
    <Wordmark class="h-6 text-white" />
  </a>

  <div class="z-1 rounded-xl bg-white p-12 shadow-2xl">
    <slot />
  </div>
</main>
