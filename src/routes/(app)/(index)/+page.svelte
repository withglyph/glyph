<script lang="ts">
  import { Helmet, Tooltip } from '$lib/components';
  import type { PageData } from './$houdini';

  export let data: PageData;

  $: ({ IndexPage_Query } = data);
</script>

<Helmet
  description="펜슬은 개인 창작자들을 위한 자유롭고 즐거운 창작 공간이에요."
  image={{ src: 'https://pnxl.net/static/og.png', size: 'large' }}
  title="펜슬 - 창작을 즐겁게"
/>

<code>{$IndexPage_Query.data?.greeting}</code>

<Tooltip message="OG Image" placement="top">
  <img alt="" src="https://pnxl.net/static/og.png" />
</Tooltip>
