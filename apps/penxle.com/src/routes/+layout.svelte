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

<div class="min-h-screen flex flex-col">
  <slot />
</div>

<AutoUpdater />
<StackIndicator />
<ToastProvider />
