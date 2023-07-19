<script lang="ts">
  import { fragment, graphql } from '$houdini';
  import { Button } from '$lib/components';
  import { useMutation } from '$lib/houdini';
  import { trackable } from '$lib/svelte/store';
  import type { Artwork } from './types';
  import type { SpacePublishArtworkPage_PublishButton_space } from '$houdini';

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

  const prepareImageUpload = useMutation(
    graphql(`
      mutation SpacePublishArtworkPage_PublishButton_PrepareImageUpload_Mutation(
        $input: PrepareImageUploadInput!
      ) {
        prepareImageUpload(input: $input) {
          key
          presignedUrl
        }
      }
    `),
  );

  const finalizeImageUpload = useMutation(
    graphql(`
      mutation SpacePublishArtworkPage_PublishButton_FinalizeImageUpload_Mutation(
        $input: FinalizeImageUploadInput!
      ) {
        finalizeImageUpload(input: $input) {
          id
        }
      }
    `),
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const doUpload = async (file: File) => {
    const { key, presignedUrl } = await prepareImageUpload({
      name: file.name,
    });

    await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
    });

    return await finalizeImageUpload({ key });
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

<Button loading={$loading} on:click={doPublish}>게시하기</Button>
