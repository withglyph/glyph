<script lang="ts">
  import { Button, Helmet, Image, Modal } from '$lib/components';
  import { uploadImage } from '$lib/utils';

  let open = false;
  let loading = false;
  let files: FileList | undefined;
  let image: Awaited<ReturnType<typeof uploadImage>> | undefined;

  const handleUpload = async () => {
    try {
      loading = true;
      image = await uploadImage(files![0]);
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

  {#if image}
    <Image
      class="aspect-1/1 w-full rounded-xl"
      $image={image}
      fit="contain"
      size={400}
    />
  {/if}

  <Button slot="action" on:click={() => (open = false)}>닫기</Button>
</Modal>
