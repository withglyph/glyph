<script lang="ts">
  import { load } from '$lib/api';
  import { Helmet, Image, Tooltip } from '$lib/components';
  import Test from './Test.svelte';

  const data = load((t) => t.test.greeting.query());
</script>

<Helmet
  description="펜슬은 개인 창작자들을 위한 자유롭고 즐거운 창작 공간이에요."
  image={{ src: 'https://pnxl.net/static/og.png', size: 'large' }}
  title="펜슬 - 창작을 즐겁게"
/>

<code>{$data}</code>
<Test />
<Test />
<Test />
<Test />
<Test />

<Tooltip message="OG Image" placement="top">
  <Image src="https://pnxl.net/static/og.png" />
</Tooltip>
