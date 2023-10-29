<script lang="ts">
  import { onMount } from 'svelte';
  import { pageSubTitle } from '$lib/stores';

  onMount(async () => {
    pageSubTitle.set('독자 관리');
  });
</script>

차단한 사용자
