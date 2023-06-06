<script lang="ts">
  import { Helmet } from '$lib/components';
  import { Tiptap } from '$lib/components/forms';

  let value: object;
</script>

<Helmet title="포스트" />

<div class="border rounded px-8 py-4">
  <Tiptap bind:value />
</div>

<pre class="whitespace-pre p-4 font-mono text-xs">
{JSON.stringify(value, null, 2)}
</pre>
