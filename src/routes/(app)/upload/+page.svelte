<script lang="ts">
  // import { graphql } from '$houdini';
  import { Button, Helmet, Image, Modal } from '$lib/components';
  import { uploadImage } from '$lib/utils';

  let open = false;
  let files: FileList | undefined;
  let src: string | undefined;

  const handleUpload = async () => {
    src = await uploadImage(files![0]);
    open = true;
  };
</script>

<Helmet title="Mutation" />

<div class="mt-4">
  <input type="file" bind:files />
  <Button class="mt-4" disabled={files?.length === 0} on:click={handleUpload}>
    Upload
  </Button>
</div>

<Modal bind:open>
  <svelte:fragment slot="title">Response</svelte:fragment>

  {#if src}
    <Image {src} />
  {/if}

  <Button slot="action" on:click={() => (open = false)}>닫기</Button>
</Modal>
