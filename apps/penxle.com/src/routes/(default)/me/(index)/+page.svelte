<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    if (window.innerWidth >= 800) {
      goto('/me/drawer');
    }
  });
</script>
