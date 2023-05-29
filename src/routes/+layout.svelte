<script lang="ts">
  import 'uno.css';
  import { beforeNavigate } from '$app/navigation';
  import { updated } from '$app/stores';
  import { setupAnalytics } from '$lib/analytics';
  import { production } from '$lib/environment';
  import { ToastLayer } from '$lib/notification';
  import BranchIndicator from './BranchIndicator.svelte';

  if (production) {
    setupAnalytics();
  }

  beforeNavigate(({ willUnload, to }) => {
    if ($updated && !willUnload && to?.url) {
      location.href = to.url.href;
    }
  });
</script>

<div class="min-h-screen flex flex-col">
  <slot />
</div>

<ToastLayer />

{#if !production}
  <BranchIndicator />
{/if}

<style global lang="scss">
  @import '../styles/index.scss';
</style>
