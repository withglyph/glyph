<script lang="ts">
  // import { graphql } from '$houdini';
  import { Button, Helmet, Image, Modal } from '$lib/components';
  import { uploadImage } from '$lib/utils';

  let open = false;
  let loading = false;
  let files: FileList | undefined;
  let src: string | undefined;
  let placeholder: string | undefined;

  const handleUpload = async () => {
    try {
      loading = true;
      const image = await uploadImage(files![0]);
      src = `https://pnxl.net/blob/${image.path}`;
      placeholder = image.placeholder;
      open = true;
    } finally {
      loading = false;
    }
  };
</script>

<Helmet title="Mutation" />

<div class="mt-4">
  <input type="file" bind:files />
  <Button
    class="mt-4"
    disabled={files?.length === 0}
    {loading}
    on:click={handleUpload}
  >
    Upload
  </Button>
</div>

<Modal bind:open>
  <svelte:fragment slot="title">Response</svelte:fragment>

  {#if src}
    <Image class="aspect-1/1 w-full object-contain" {placeholder} {src} />
  {/if}

  <Button slot="action" on:click={() => (open = false)}>닫기</Button>
</Modal>
