<script lang="ts">
  import '../styles/index.css';
  // import 'uno.css';
  import { beforeNavigate } from '$app/navigation';
  import { updated } from '$app/stores';
  import { setupAnalytics } from '$lib/analytics';
  import { production } from '$lib/environment';
  import { ToastProvider } from '$lib/notification';
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

<ToastProvider />

{#if !production}
  <BranchIndicator />
{/if}
