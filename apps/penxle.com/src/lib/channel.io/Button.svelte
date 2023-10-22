<script lang="ts">
  import * as ChannelService from '@channel.io/channel-web-sdk-loader';
  import { onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { PUBLIC_CHANNEL_IO_PLUGIN_KEY } from '$env/static/public';
  import { fragment, graphql } from '$glitch';
  import type { ChannelIOButton_query } from '$glitch';

  let _query: ChannelIOButton_query;
  export { _query as $query };

  $: query = fragment(
    _query,
    graphql(`
      fragment ChannelIOButton_query on Query {
        me {
          id
          channelIOMemberHash
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
      }
    `),
  );

  $: if (browser && $query) {
    if ($query.me) {
      ChannelService.boot({
        pluginKey: PUBLIC_CHANNEL_IO_PLUGIN_KEY,
        memberId: $query.me.id,
        memberHash: $query.me.channelIOMemberHash,
        profile: {
          avatarUrl: $query.me.profile.avatar.url,
          name: $query.me.profile.name,
          email: $query.me.email,
        },
      });
    } else {
      ChannelService.boot({
        pluginKey: PUBLIC_CHANNEL_IO_PLUGIN_KEY,
      });
    }

    ChannelService.showChannelButton();
  }

  onDestroy(() => {
    if (browser) {
      ChannelService.hideChannelButton();
    }
  });
</script>
