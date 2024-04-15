<script lang="ts">
  import { Button, Modal } from '$lib/components';
  import { css } from '$styled-system/css';

  export let open = false;
</script>

<Modal size="sm" bind:open>
  <svelte:fragment slot="title">준비중인 기능이에요</svelte:fragment>
  <svelte:fragment slot="subtitle">아직 준비 중인 기능이에요. 조금만 기다려주세요!</svelte:fragment>

  <Button slot="action" style={css.raw({ width: 'full' })} size="xl" on:click={() => (open = false)}>닫기</Button>
</Modal>
