<script lang="ts">
  import { useQuery } from '$lib/houdini';
  import type { LayoutData } from './$houdini';

  export let data: LayoutData;

  $: useQuery(data.SpacePublishLayout_Query);
</script>

<slot />
