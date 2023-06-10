<script lang="ts">
  import { Helmet } from '$lib/components';
  import { graphql, useQuery } from '$lib/houdini';
  import { absolutePath } from '$lib/utils';

  $: query = useQuery(
    graphql(`
      query IndexPage_Query @load {
        greeting
      }
    `)
  );
</script>

<Helmet
  description="펜슬은 개인 창작자들을 위한 자유롭고 즐거운 창작 공간이에요."
  image={{ src: absolutePath('/images/og.png'), size: 'large' }}
  title="펜슬 - 창작을 즐겁게"
/>

<code>{$query.greeting}</code>
