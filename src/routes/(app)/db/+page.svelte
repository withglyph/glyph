<script lang="ts">
  import { Helmet } from '$lib/components';

  export let data;
</script>

<Helmet title="Database" />

<code>{data.db}</code>
