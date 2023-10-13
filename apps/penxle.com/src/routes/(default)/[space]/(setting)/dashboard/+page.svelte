<script lang="ts">
  import { onMount } from 'svelte';
  import { pageSubTitle } from '$lib/stores';

  onMount(async () => {
    pageSubTitle.set('대시보드');
  });
</script>

dashboard
