<script lang="ts">
  import ky from 'ky';
  import { createEventDispatcher } from 'svelte';
  import { graphql } from '$glitch';
  import { Button, Modal } from '$lib/components';
  import { trackable } from '$lib/svelte/store';
  import { isValidImageFile, validImageMimes } from '$lib/utils';
  import { css } from '$styled-system/css';
  import Thumbnailer from './Thumbnailer.svelte';
  import type { ImageBounds } from '$lib/utils';

  let fileEl: HTMLInputElement;

  let file: File | null = null;
  let src: string | null = null;
  export let bounds: ImageBounds | undefined = undefined;
  let draftBounds = bounds;
  let open = false;
  export let keepBoundsWhenClosed = false;

  export let ratio: 'square' | 'collection' | 'post' | undefined = undefined;

  $: if (!open) {
    if (!keepBoundsWhenClosed) {
      bounds = undefined;
    }

    draftBounds = bounds;
  }

  const uploading = trackable();
  const dispatch = createEventDispatcher<{ change: { id: string; name: string } }>();

  export const show = (_src?: string) => {
    if (_src) {
      src = _src;
      open = true;
      return;
    }
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
        name
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
  class={css({ display: 'none' })}
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
  <Modal actionStyle={css.raw({ paddingTop: '0' })} size="sm" bind:open>
    <svelte:fragment slot="title">
      <slot name="title">위치 조정</slot>
    </svelte:fragment>
    <Thumbnailer {...props} {ratio} bind:bounds={draftBounds} />
    <Button slot="action" style={css.raw({ width: 'full' })} loading={$uploading} size="lg" on:click={upload}>
      <slot name="save">저장</slot>
    </Button>
  </Modal>
{/if}
