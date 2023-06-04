<script lang="ts">
  import { Helmet } from '$lib/components';
  import type { PageData } from './$houdini';

  export let data: PageData;

  $: ({ IndexPage_Query: query } = data);
</script>

<Helmet
  description="펜슬은 개인 창작자들을 위한 자유롭고 즐거운 창작 공간이에요."
  image={{ src: 'https://pnxl.net/static/og.png', size: 'large' }}
  title="펜슬 - 창작을 즐겁게"
/>

<code>{$query.data?.greeting}</code>
