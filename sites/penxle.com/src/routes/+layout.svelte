<script lang="ts">
  import 'virtual:uno.css';
  import '../styles/index.css';

  import { setupAnalytics } from '@penxle/lib/analytics';
  import { production } from '@penxle/lib/environment';
  import { BranchIndicator } from '@penxle/ui/dev';
  import { beforeNavigate } from '$app/navigation';
  import { updated } from '$app/stores';
  import { ToastProvider } from '$lib/notification';

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
