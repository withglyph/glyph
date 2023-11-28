<script lang="ts">
  import { AutoUpdater, StackIndicator } from '@penxle/ui';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { toast, ToastProvider } from '$lib/notification';
  import type { BaseLayout_query } from '$glitch';

  let _query: BaseLayout_query;
  export { _query as $query };

  $: query = fragment(
    _query,
    graphql(`
      fragment BaseLayout_query on Query {
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
    `),
  );

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
