<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { trackable } from '$lib/svelte/store';
  import type { SpacePublishArtworkPage_PublishButton_space } from '$glitch';
  import type { Artwork } from './types';

  export let _space: SpacePublishArtworkPage_PublishButton_space;
  export let artworks: Artwork[];

  const loading = trackable();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  $: space = fragment(
    _space,
    graphql(`
      fragment SpacePublishArtworkPage_PublishButton_space on Space {
        id
      }
    `),
  );

  const prepareImageUpload = graphql(`
    mutation SpacePublishArtworkPage_PublishButton_PrepareImageUpload_Mutation {
      prepareImageUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeImageUpload = graphql(`
    mutation SpacePublishArtworkPage_PublishButton_FinalizeImageUpload_Mutation(
      $input: FinalizeImageUploadInput!
    ) {
      finalizeImageUpload(input: $input) {
        id
      }
    }
  `);

  const doUpload = async (file: File) => {
    const { key, presignedUrl } = await prepareImageUpload();

    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
    });

    return await finalizeImageUpload({
      key,
      name: file.name,
    });
  };

  const doPublish = async () => {
    await loading.track(async () => {
      const images = await Promise.all(
        artworks.map(async (v) => doUpload(v.file)),
      );
      console.log(images.map((v) => v.id));
    });
  };
</script>

<Button loading={$loading} size="md" on:click={doPublish}>게시하기</Button>
