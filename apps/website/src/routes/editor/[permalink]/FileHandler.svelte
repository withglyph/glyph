<script lang="ts">
  import ky from 'ky';
  import { writable } from 'svelte/store';
  import { graphql } from '$glitch';
  import { fileMime } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { getEditorContext } from './context';

  const prepareImageUpload = graphql(`
    mutation Editor_FileHandler_PrepareImageUpload_Mutation {
      prepareImageUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeImageUpload = graphql(`
    mutation Editor_FileHandler_FinalizeImageUpload_Mutation($input: FinalizeImageUploadInput!) {
      finalizeImageUpload(input: $input) {
        id
        ...Image_image
      }
    }
  `);

  const prepareFileUpload = graphql(`
    mutation Editor_FileHandler_PrepareFileUpload_Mutation {
      prepareFileUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeFileUpload = graphql(`
    mutation Editor_FileHandler_FinalizeFileUpload_Mutation($input: FinalizeFileUploadInput!) {
      finalizeFileUpload(input: $input) {
        id
      }
    }
  `);

  const { state } = getEditorContext();
  const uploadingCount = writable(0);

  const uploadImage = async (pos: number, file: File) => {
    try {
      uploadingCount.update((count) => count + 1);

      const { key, presignedUrl } = await prepareImageUpload();
      await ky.put(presignedUrl, { body: file });
      const resp = await finalizeImageUpload({ key, name: file.name });

      $state.editor?.commands.insertContentAt(pos, { type: 'image', attrs: { id: resp.id } });
    } finally {
      uploadingCount.update((count) => count - 1);
    }
  };

  const uploadFile = async (pos: number, file: File) => {
    try {
      uploadingCount.update((count) => count + 1);

      const { key, presignedUrl } = await prepareFileUpload();
      await ky.put(presignedUrl, { body: file });
      const resp = await finalizeFileUpload({ key, name: file.name });

      $state.editor?.commands.insertContentAt(pos, { type: 'file', attrs: { id: resp.id } });
    } finally {
      uploadingCount.update((count) => count - 1);
    }
  };

  $state.fileHandler = async (as: 'auto' | 'image' | 'file', files: File[], pos?: number) => {
    if (!$state.editor) {
      return;
    }

    const extMimes = files.map((v) => v.type);
    const magicMimes = await Promise.all(files.map((v) => fileMime(v)));

    pos ??= $state.editor.view.state.selection.from;

    const images: File[] = [];
    const others: File[] = [];

    // eslint-disable-next-line unicorn/prefer-switch
    if (as === 'auto') {
      for (const [i, v] of files.entries()) {
        if (extMimes[i].startsWith('image/') && magicMimes[i].startsWith('image/')) {
          images.push(v);
        } else {
          others.push(v);
        }
      }
    } else if (as === 'image') {
      images.push(...files);
    } else if (as === 'file') {
      others.push(...files);
    }

    if (images.length === 1) {
      await uploadImage(pos, images[0]);
    } else if (images.length > 1) {
      // TODO: show image editor
    }

    if (others.length > 0) {
      await Promise.all(others.map((v) => uploadFile(pos, v)));
    }
  };
</script>

{#if $uploadingCount > 0}
  <div
    class={css({
      position: 'fixed',
      inset: '0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '32px',
      fontWeight: 'bold',
      color: 'gray.50',
      backgroundColor: 'gray.900/50',
      zIndex: '50',
    })}
  >
    파일 {$uploadingCount}개 업로드 중...
  </div>
{/if}
