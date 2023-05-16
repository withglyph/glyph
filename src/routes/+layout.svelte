<script lang="ts">
  import 'virtual:uno.css'; // <!-- ! FIXME: remove after next unocss release -->
  import { beforeNavigate } from '$app/navigation';
  import { updated } from '$app/stores';
  import { setupAnalytics } from '$lib/analytics';
  import { Helmet } from '$lib/components';
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

<Helmet title="펜슬" />

<div class="min-h-screen flex flex-col">
  <slot />
</div>

<ToastLayer />

{#if !production}
  <BranchIndicator />
{/if}

<style global lang="scss" uno:safelist uno:preflights>
  @import '../styles/index.scss';
</style>
