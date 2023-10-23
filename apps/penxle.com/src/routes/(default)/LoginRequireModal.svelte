<script lang="ts">
  import { Button, Modal } from '$lib/components';

  export let open = false;
</script>

<Modal size="sm" bind:open>
  <svelte:fragment slot="title">로그인이 필요한 기능이에요</svelte:fragment>
  <svelte:fragment slot="subtitle">로그인 하고 펜슬의 더 다양한 기능을 사용해 보세요!</svelte:fragment>

  <div slot="action" class="flex w-full gap-3">
    <Button class="w-full" color="secondary" size="xl" on:click={() => (open = false)}>취소</Button>
    <Button class="w-full" href="/login" size="xl" type="link">로그인</Button>
  </div>
</Modal>
