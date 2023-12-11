<script lang="ts">
  import { Button, Modal } from '$lib/components';

  export let open = false;

  let modalOpened = false;

  $: if (open && !modalOpened) {
    modalOpened = true;
  }

  $: if (!open && modalOpened) {
    modalOpened = false;
    window.location.href = '/';
  }
</script>

<Modal size="sm" bind:open>
  <svelte:fragment slot="title">탈퇴가 완료되었어요</svelte:fragment>
  <svelte:fragment slot="subtitle">함께해줘서 고마웠어요!</svelte:fragment>

  <Button slot="action" class="w-full" href="/" size="xl" type="link">홈으로 가기</Button>
</Modal>

<!-- 모달 닫히면(esc/바깥영역 클릭) 자동으로 홈화면으로 이동시켜주기 -->
