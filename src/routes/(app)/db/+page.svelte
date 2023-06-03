<script lang="ts">
  import { Helmet } from '$lib/components';
  import type { PageData } from './$houdini';

  export let data: PageData;

  $: ({ DbPage_Query } = data);
</script>

<Helmet title="Database" />

<code>{$DbPage_Query.data?.db}</code>
