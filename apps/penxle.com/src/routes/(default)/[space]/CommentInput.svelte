<script lang="ts">
  import clsx from 'clsx';
  import { Button } from '$lib/components/v2';

  let secret = true;
</script>

<form class="border border-gray-200 rounded-2.5 px-5 pt-5 pb-4" on:submit|preventDefault>
  <textarea
    class="p-4 text-15-r resize-none h-80px rounded-1.5 w-full focus:(ring-1.5 ring-teal-500) <sm:p-2.5"
    placeholder="창작자에게 응원의 글을 남겨주세요"
  />

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

    <Button class="h-44px w-94px <sm:(h-34px text-12-sb w-69px) flex center" size="lg" type="submit" variant="outline">
      등록
    </Button>
  </div>
</form>
