<script lang="ts">
  import clsx from 'clsx';
  import { Tag } from '$lib/components';

  export let tags: string[] = [];
  let open = false;
</script>

<div class="max-h-full fixed w-full z-1 bottom-0">
  <div class="flex flex-col items-center">
    <button
      class={clsx(
        'w-16 h-7.5 rounded-1.5 rounded-b-none flex center bg-white shadow-[0px_-5px_16px_-8px_rgba(0,0,0,0.15)]',
        !open && 'fixed z-1 bottom-54px',
      )}
      type="button"
      on:click={() => (open = !open)}
    >
      <i class={clsx('i-lc-chevron-down square-4 text-secondary', !open && 'transform rotate-180')} />
    </button>
  </div>

  <div
    class={clsx(
      'overflow-y-scroll max-h-80vh bg-white shadow-[0_4px_16px_0px_rgba(0,0,0,0.15)] px-4',
      !open && 'fixed w-full top-[calc(100vh-54px)]',
    )}
  >
    <div class="w-full max-w-300 flex items-center gap-4 flex-wrap pt-3 pb-4">
      <span class="body-13-b">게시글 태그</span>

      {#each tags as tag (tag)}
        <Tag size="sm">
          {tag}
          <button class="i-lc-trash" type="button" on:click={() => (tags = tags.filter((t) => t !== tag))} />
        </Tag>
      {/each}

      <label class="flex items-center px-3 bg-primary rounded-8 body-13-b before:(content-['#'] mr-1)">
        <input
          class="body-13-b h-6.5"
          maxlength={50}
          placeholder="게시글에 추가될 태그를 입력하세요"
          type="text"
          on:keydown={(e) => {
            if (e.key !== ' ' && e.key !== 'Spacebar' && e.key !== 'Enter') return;

            const { value } = e.currentTarget;

            if (tags.includes(value)) return;
            const escapedValue = value.replaceAll(' ', '');

            if (escapedValue.length === 0) return;

            if (e.isComposing === false) {
              tags.push(escapedValue);
              tags = tags;
              e.currentTarget.value = '';
            }
          }}
        />
      </label>
    </div>

    <div class="w-full max-w-300 flex items-center gap-4 flex-wrap bg-primary p-4">
      <div class="square-21.25 rounded-2xl border border-primary bg-surface-primary" />
    </div>
  </div>
</div>
