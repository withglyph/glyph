<script lang="ts">
  import { toast } from '$lib/notification';
  import type { Nullable } from '$lib/types';

  export let files: File[];

  const validTypes = ['image/jpeg', 'image/png'];
  const maxSize = 32 * 1024 * 1024; // 32MB

  let dragging: EventTarget | null;

  const isValidFile = (file: File) => {
    return validTypes.includes(file.type) && file.size <= maxSize;
  };

  const addFiles = (newFiles: Nullable<FileList>) => {
    if (!newFiles) {
      return;
    }

    const validFiles: File[] = [];
    for (const file of newFiles) {
      if (!isValidFile(file)) {
        toast.error(`${file.name} 파일은 업로드할 수 없어요.`);
        continue;
      }
      validFiles.push(file);
    }

    files = [...files, ...validFiles];
  };
</script>

<svelte:window
  on:dragenter={({ target }) => (dragging = target)}
  on:dragleave={({ target }) => {
    if (dragging === target) {
      dragging = null;
    }
  }}
  on:dragover|preventDefault
  on:drop|preventDefault={({ dataTransfer }) => {
    dragging = null;
    addFiles(dataTransfer?.files);
  }}
/>

<input
  id="file"
  class="hidden"
  accept={validTypes.join(',')}
  type="file"
  on:change={({ currentTarget }) => {
    addFiles(currentTarget.files);
    currentTarget.value = '';
  }}
/>

{#if dragging}
  <div class="fixed inset-0 z-100 square-full bg-black" />
{/if}
