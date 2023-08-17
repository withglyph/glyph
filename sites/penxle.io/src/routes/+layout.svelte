<script lang="ts">
  import '../styles/index.css';
  import 'virtual:uno.css';

  import { setupAnalytics } from '@penxle/lib/analytics';
  import { production } from '@penxle/lib/environment';
  import { BranchIndicator } from '@penxle/ui/dev';
  import { beforeNavigate } from '$app/navigation';
  import { updated } from '$app/stores';

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

{#if !production}
  <BranchIndicator />
{/if}
