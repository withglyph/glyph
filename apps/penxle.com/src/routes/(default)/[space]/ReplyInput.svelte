<script lang="ts">
  import clsx from 'clsx';
  import { Button } from '$lib/components/v2';

  let secret = true;
  export let open = false;
</script>

<form class="border-t border-gray-100 px-5 pt-5 pb-4 bg-gray-50" on:submit|preventDefault>
  <div class="flex gap-2.5">
    <i class="i-px2-reply-bar square-5 text-gray-400" />

    <textarea
      class="p-4 text-15-r resize-none h-80px rounded-1.5 w-full bg-white focus:(ring-1.5 ring-teal-500) <sm:p-2.5"
      placeholder="답글을 작성해보세요"
    />
  </div>

  <div class="flex items-center justify-between pt-2">
    <button
      class={clsx(
        'flex items-center gap-1 text-14-r text-gray-400 py-2 px-3 rounded hover:bg-gray-100',
        secret && 'text-teal-500',
      )}
      type="button"
      on:click={() => (secret = !secret)}
    >
      <i class={clsx('i-tb-lock square-6 block text-gray-400', secret && 'text-teal-500')} />
      비밀글
    </button>

    <div>
      <Button class="h-44px w-94px bg-white" size="lg" type="submit" variant="outline" on:click={() => (open = false)}>
        취소
      </Button>
      <Button class="h-44px w-94px" size="lg" type="submit" variant="secondary">등록</Button>
    </div>
  </div>
</form>
