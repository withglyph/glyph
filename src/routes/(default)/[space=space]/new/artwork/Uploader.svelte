<script lang="ts">
  // import { Image } from '$lib/components';
  // import { graphql, useMutation } from '$lib/houdini';
  // import { trackable } from '$lib/svelte/store';
  import FileImage from './FileImage.svelte';
  // import type { Image_image } from '$houdini';
  import type { ChangeEventHandler, DragEventHandler } from 'svelte/elements';

  // const prepareImageUpload = useMutation(
  //   graphql(`
  //     mutation SpaceNewArtworkPage_Uploader_PrepareImageUpload_Mutation(
  //       $input: PrepareImageUploadInput!
  //     ) {
  //       prepareImageUpload(input: $input) {
  //         path
  //         presignedUrl
  //       }
  //     }
  //   `)
  // );

  // const finalizeImageUpload = useMutation(
  //   graphql(`
  //     mutation SpaceNewArtworkPage_Uploader_FinalizeImageUpload_Mutation(
  //       $input: FinalizeImageUploadInput!
  //     ) {
  //       finalizeImageUpload(input: $input) {
  //         id
  //         ...Image_image
  //       }
  //     }
  //   `)
  // );

  // let loading = trackable();
  let files: File[] = [];

  // const doUpload = async (file: File) => {
  //   await loading.track(async () => {
  //     const { path, presignedUrl } = await prepareImageUpload({
  //       name: file.name,
  //     });

  //     await fetch(presignedUrl, {
  //       method: 'PUT',
  //       body: file,
  //     });

  //     await finalizeImageUpload({ path });
  //   });
  // };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }

    files = [...files, file];
  };

  const handleDragOver: DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();
  };

  const handleDrop: DragEventHandler<HTMLLabelElement> = (event) => {
    event.preventDefault();

    const file = event.dataTransfer?.files[0];
    if (!file) {
      return;
    }

    files = [...files, file];
  };
</script>

<input
  id="file"
  class="hidden"
  accept="image/jpeg,image/png"
  type="file"
  on:change={handleChange}
/>

<div class="h-100 flex center gap-4 overflow-x-auto bg-gray-100">
  {#each files as file (file)}
    <div class="relative square-80 flex-none overflow-hidden rounded bg-white">
      <FileImage class="square-full object-contain" {file} />
      <button
        class="absolute right-2 top-2 square-8 flex center rounded-full bg-black/50"
        type="button"
        on:click={() => (files = files.filter((f) => f !== file))}
      >
        <span class="i-lc-x square-6 text-white" />
      </button>
    </div>
  {/each}

  <div class="square-80 flex-none border-4 rounded border-dashed">
    <label
      class="square-full flex cursor-pointer center bg-white text-sm transition hover:bg-gray-50"
      for="file"
      on:dragover={handleDragOver}
      on:drop={handleDrop}
    >
      <span class="i-lc-plus-circle square-8 text-gray-300" />
    </label>
  </div>
</div>
