<script lang="ts">
  import '../app.css';

  import { datadogRum } from '@datadog/browser-rum';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { toast, ToastProvider } from '$lib/notification';
  import { flex } from '$styled-system/patterns';
  import AutoUpdater from './AutoUpdater.svelte';
  import Datadog from './Datadog.svelte';
  import StackIndicator from './StackIndicator.svelte';

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

    datadogRum.setUser({
      id: $query.me.id,
      email: $query.me.email,
      name: $query.me.profile.name,
    });
  }

  onMount(() => {
    if ($query.flash) {
      toast($query.flash.message);
    }
  });
</script>

<svelte:head>
  <script data-domain="withglyph.com" defer src="https://plausible.io/js/script.js"></script>
  <script
    async
    crossorigin="anonymous"
    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4449202773959958"
  ></script>
</svelte:head>

<div class={flex({ direction: 'column', position: 'relative', minHeight: 'dvh' })}>
  <slot />
</div>

<AutoUpdater />
<Datadog />
<StackIndicator />
<ToastProvider />
