<script lang="ts">
  import ky from 'ky';
  import { createEventDispatcher } from 'svelte';
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { trackable } from '$lib/svelte/store';
  import { isValidImageFile, validImageMimes } from '$lib/utils';
  import Thumbnailer from './Thumbnailer.svelte';
  import type { ImageBounds } from '$lib/utils';

  let fileEl: HTMLInputElement;

  let file: File | null = null;
  let bounds: ImageBounds | undefined = undefined;
  let open = false;

  const uploading = trackable();
  const dispatch = createEventDispatcher<{ change: { id: string } }>();

  export const show = () => {
    fileEl.showPicker();
  };

  const prepareImageUpload = graphql(`
    mutation ThumbnailPicker_PrepareImageUpload_Mutation {
      prepareImageUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeImageUpload = graphql(`
    mutation ThumbnailPicker_FinalizeImageUpload_Mutation($input: FinalizeImageUploadInput!) {
      finalizeImageUpload(input: $input) {
        id
        ...Image_image
      }
    }
  `);

  const upload = async () => {
    await uploading.track(async () => {
      if (!file) {
        return;
      }

      const { key, presignedUrl } = await prepareImageUpload();
      await ky.put(presignedUrl, { body: file });
      const resp = await finalizeImageUpload({ key, name: file.name, bounds });

      file = null;

      dispatch('change', resp);
    });
  };
</script>

<input
  bind:this={fileEl}
  class="hidden"
  accept={validImageMimes.join(',')}
  type="file"
  on:change={async (e) => {
    const f = e.currentTarget.files?.[0];

    if (f && (await isValidImageFile(f))) {
      file = f;
      open = true;
    }

    fileEl.value = '';
  }}
/>

{#if file}
  <Modal size="md" bind:open>
    <svelte:fragment slot="title">위치 조정</svelte:fragment>
    <Thumbnailer class="w-full" {file} bind:bounds />
    <Button slot="action" class="w-full mt-4" loading={$uploading} size="xl" on:click={upload}>저장</Button>
  </Modal>
{/if}
