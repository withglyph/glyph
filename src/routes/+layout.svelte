<script lang="ts">
  import 'uno.css';
  import { beforeNavigate } from '$app/navigation';
  import { updated } from '$app/stores';
  import { setupAnalytics } from '$lib/analytics';
  import { production } from '$lib/environment';
  import { graphql, useQuery } from '$lib/houdini';
  import { ToastProvider } from '$lib/notification';
  import { session } from '$lib/stores';
  import BranchIndicator from './BranchIndicator.svelte';

  $: query = useQuery(
    graphql(`
      query Layout_Query @load {
        meOrNull {
          id
          user {
            id
          }
        }
      }
    `)
  );

  $: $session = $query.meOrNull
    ? {
        userId: $query.meOrNull.user.id,
        profileId: $query.meOrNull.id,
      }
    : null;

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

<style global lang="scss">
  @import '../styles/index.scss';
</style>
