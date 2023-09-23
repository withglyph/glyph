<script lang="ts">
  import { Button } from '$lib/components';
  import { toast } from '$lib/notification';

  let successMessage = '포스트를 게시했어요';
  let errorMessage = '알 수 없는 오류가 발생했어요';
</script>

<div class="flex flex-col grow center gap-4">
  <div class="flex gap-2 w-1/2">
    <input class="grow border px-4" type="text" bind:value={successMessage} />
    <Button color="primary" on:click={() => toast.success(successMessage)}>toast.success</Button>
  </div>

  <div class="flex gap-2 w-1/2">
    <input class="grow border px-4" type="text" bind:value={errorMessage} />
    <Button color="primary" on:click={() => toast.error(errorMessage, { title: '실패!' })}>toast.error</Button>
  </div>
</div>
