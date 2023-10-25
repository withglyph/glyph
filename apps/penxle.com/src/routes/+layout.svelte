<script lang="ts">
  import '../styles/index.css';
  import 'virtual:uno.css';

  import { AutoUpdater, StackIndicator } from '@penxle/ui';
  import { onMount } from 'svelte';
  import { graphql } from '$glitch';
  import { toast, ToastProvider } from '$lib/notification';

  $: query = graphql(`
    query RootLayout_Query {
      flash {
        type
        message
      }
    }
  `);

  onMount(() => {
    if ($query.flash) {
      toast[$query.flash.type as 'success' | 'error']($query.flash.message);
    }
  });
</script>

<div class="min-h-screen flex flex-col">
  <slot />
</div>

<AutoUpdater />
<StackIndicator />
<ToastProvider />
