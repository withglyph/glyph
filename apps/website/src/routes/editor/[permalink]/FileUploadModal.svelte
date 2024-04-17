<script lang="ts">
  import FilePlusIcon from '~icons/tabler/file-plus';
  import { Icon } from '$lib/components';
  import { Modal } from '$lib/components/v2';
  import Button from '$lib/components/v2/Button.svelte';
  import { css } from '$styled-system/css';

  export let open = false;
</script>

<Modal bind:open>
  <svelte:fragment slot="title">파일 선택</svelte:fragment>
  <!-- <Button>기기에서 파일 선택</Button> -->
  <div
    class={css({
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '4px',
      width: 'full',
      height: '200px',
      borderWidth: '2px',
      borderStyle: 'dashed',
      borderColor: 'gray.300',
    })}
  >
    <Icon style={css.raw({ color: 'gray.500' })} icon={FilePlusIcon} size={32} />
    <div class={css({ fontSize: '14px', color: 'gray.500' })}>파일을 끌어다 놓거나 클릭해서 업로드해주세요</div>
  </div>

  <Button slot="action" style={css.raw({ width: 'full' })}>삽입</Button>
</Modal>
