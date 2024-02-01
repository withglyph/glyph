<script lang="ts">
  import ky from 'ky';
  import { createEventDispatcher } from 'svelte';
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { Thumbnailer } from '$lib/components/media';
  import { trackable } from '$lib/svelte/store';
  import { isValidImageFile, validImageMimes } from '$lib/utils';
  import type { ImageBounds } from '$lib/utils';

  let fileEl: HTMLInputElement;

  let file: File | null = null;
  let src: string | null = null;
  export let bounds: ImageBounds | undefined = undefined;
  let draftBounds = bounds;
  let open = false;
  export let keepBoundsWhenClosed = false;

  $: if (!open) {
    if (!keepBoundsWhenClosed) {
      bounds = undefined;
    }

    draftBounds = bounds;
  }

  const uploading = trackable();
  const dispatch = createEventDispatcher<{ change: { id: string } }>();

  export const show = (_src?: string) => {
    if (_src) {
      src = _src;
      open = true;
      return;
    }
    fileEl.showPicker();
  };

  const prepareImageUpload = graphql(`
    mutation Editor_ThumbnailPicker_PrepareImageUpload_Mutation {
      prepareImageUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeImageUpload = graphql(`
    mutation Editor_ThumbnailPicker_FinalizeImageUpload_Mutation($input: FinalizeImageUploadInput!) {
      finalizeImageUpload(input: $input) {
        id
        ...Image_image
      }
    }
  `);

  const upload = async () => {
    if (file) {
      await uploading.track(async () => {
        const { key, presignedUrl } = await prepareImageUpload();
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        await ky.put(presignedUrl, { body: file! });
        const resp = await finalizeImageUpload({ key, name: file!.name, bounds: draftBounds });
        /* eslint-enable @typescript-eslint/no-non-null-assertion */

        file = null;

        dispatch('change', resp);
      });
    }

    bounds = draftBounds;
    open = false;
  };

  let props: { src: string; file?: undefined } | { file: File; src?: undefined } | null;
  $: props = (src && { src }) || (file && { file });
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

{#if props}
  <Modal size="md" bind:open>
    <svelte:fragment slot="title">
      <slot name="title">위치 조정</slot>
    </svelte:fragment>
    <Thumbnailer class="w-full" {...props} bind:bounds={draftBounds} />
    <Button slot="action" class="w-full mt-4" loading={$uploading} size="xl" on:click={upload}>
      <slot name="save">저장</slot>
    </Button>
  </Modal>
{/if}
