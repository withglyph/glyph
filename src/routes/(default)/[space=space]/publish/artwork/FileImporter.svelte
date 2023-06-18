<script lang="ts">
  import { toast } from '$lib/notification';
  import { fileMime } from '$lib/utils';
  import type { Nullable } from '$lib/types';

  export let files: File[];

  const validMimes = ['image/jpeg', 'image/png'];
  const maxSize = 32 * 1024 * 1024; // 32MB

  let dragging: EventTarget | null;

  const isValidFile = async (file: File) => {
    if (file.size > maxSize) {
      toast.error(`32MB를 초과하는 파일은 업로드할 수 없어요 (${file.name})`);
      return false;
    }

    const mime = await fileMime(file);
    if (!validMimes.includes(mime)) {
      toast.error(`허용되지 않는 파일 타입이에요 (${file.name})`);
      return false;
    }

    return true;
  };

  const addFiles = async (newFiles: Nullable<FileList>) => {
    if (!newFiles) {
      return;
    }

    const validFiles: File[] = [];
    for (const file of newFiles) {
      if (await isValidFile(file)) {
        validFiles.push(file);
      }
    }

    files = [...files, ...validFiles];
  };
</script>

<svelte:window
  on:dragenter={({ target, dataTransfer }) => {
    if (dataTransfer?.types.includes('Files')) {
      dragging = target;
    }
  }}
  on:dragleave={({ target }) => {
    if (dragging === target) {
      dragging = null;
    }
  }}
  on:dragover|preventDefault={({ dataTransfer }) => {
    if (dataTransfer) {
      dataTransfer.dropEffect = dataTransfer.types.includes('Files')
        ? 'copy'
        : 'none';
    }
  }}
  on:drop|preventDefault={async ({ dataTransfer }) => {
    dragging = null;
    await addFiles(dataTransfer?.files);
  }}
/>

<input
  id="file"
  class="hidden"
  accept={validMimes.join(',')}
  type="file"
  on:change={async ({ currentTarget }) => {
    await addFiles(currentTarget.files);
    currentTarget.value = '';
  }}
/>

{#if dragging}
  <div class="fixed inset-0 z-100 square-full bg-black" />
{/if}
