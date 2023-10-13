<script lang="ts">
  import { onMount } from 'svelte';
  import { pageSubTitle } from '$lib/stores';

  onMount(async () => {
    pageSubTitle.set('포스트 관리');
  });
</script>

포스트 관리 - 컬렉션 관리 탭
