<script lang="ts">
  import { Button, Modal } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  export let open = false;
</script>

<Modal size="sm" bind:open>
  <svelte:fragment slot="title">로그인이 필요한 기능이에요</svelte:fragment>

  <svelte:fragment slot="subtitle">
    <slot name="subtitle">로그인 하고 펜슬의 더 다양한 기능을 사용해 보세요!</slot>
  </svelte:fragment>

  <div slot="action" class={flex({ gap: '12px', width: 'full' })}>
    <slot name="action-secondary">
      <Button style={css.raw({ width: 'full' })} color="secondary" size="xl" on:click={() => (open = false)}>
        취소
      </Button>
    </slot>
    <Button style={css.raw({ width: 'full' })} href="/login" size="xl" type="link">로그인</Button>
  </div>
</Modal>
