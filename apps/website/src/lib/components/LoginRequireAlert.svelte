<script lang="ts">
  import { css } from '$styled-system/css';
  import Alert from './Alert.svelte';
  import Button from './Button.svelte';

  export let open = false;
</script>

<Alert bind:open>
  <p slot="title" class={css({ textAlign: 'left' })}>로그인이 필요한 기능이에요</p>

  <p slot="content" class={css({ textAlign: 'left' })}>로그인하고 다양한 기능을 편리하게 이용해보세요</p>

  <svelte:fragment slot="action">
    <Button style={css.raw({ hideFrom: 'sm' })} size="lg" variant="gray-sub-fill" on:click={() => (open = false)}>
      취소
    </Button>
    <Button style={css.raw({ hideBelow: 'sm' })} size="lg" variant="gray-outline" on:click={() => (open = false)}>
      취소
    </Button>
    <Button href="/login" size="lg" type="link">로그인</Button>
  </svelte:fragment>
</Alert>
