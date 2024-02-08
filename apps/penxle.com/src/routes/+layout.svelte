<script lang="ts">
  import '../styles/index.css';
  import 'virtual:uno.css';

  import { AutoUpdater, StackIndicator } from '@penxle/ui';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { toast, ToastProvider } from '$lib/notification';

  $: query = graphql(`
    query RootLayout_Query {
      me {
        id
        email

        profile {
          id
          name

          avatar {
            id
            url
          }
        }
      }

      flash {
        type
        message
      }
    }
  `);

  $: if (browser && $query.me) {
    mixpanel.identify($query.me.id);
    mixpanel.people.set({
      $email: $query.me.email,
      $name: $query.me.profile.name,
      $avatar: $query.me.profile.avatar.url,
    });
  }

  onMount(() => {
    if ($query.flash) {
      toast[$query.flash.type as 'success' | 'error']($query.flash.message);
    }
  });
</script>

<svelte:head>
  <script data-domain="penxle.com" defer src="https://plausible.io/js/script.js"></script>
</svelte:head>

<div class="relative flex flex-col min-h-100dvh">
  <slot />
</div>

<AutoUpdater />
<StackIndicator />
<ToastProvider />
