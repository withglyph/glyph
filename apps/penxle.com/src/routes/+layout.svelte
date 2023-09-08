<script lang="ts">
  import 'virtual:uno.css';
  import '../styles/index.css';

  import { AutoUpdater, StackIndicator } from '@penxle/ui';
  import { ToastProvider } from '$lib/notification';
</script>

<div class="min-h-screen flex flex-col">
  <slot />
</div>

<AutoUpdater />
<StackIndicator />
<ToastProvider />
