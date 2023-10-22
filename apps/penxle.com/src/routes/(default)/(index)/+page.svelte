<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { ChannelIOButton } from '$lib/channel.io';

  $: query = graphql(`
    query IndexPage_Query {
      ...ChannelIOButton_query
    }
  `);
</script>

<Helmet
  description="펜슬은 개인 창작자들을 위한 자유롭고 즐거운 창작 공간이에요."
  image={{
    src: 'https://c.pnxl.net/assets/opengraph/default-cover.png',
    size: 'large',
  }}
  title="펜슬 - 함께 그리는 반짝임"
/>

<code>Hello world!</code>

<ChannelIOButton {$query} />
