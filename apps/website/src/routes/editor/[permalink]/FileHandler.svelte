<script lang="ts">
  import ky from 'ky';
  import { writable } from 'svelte/store';
  import { graphql } from '$glitch';
  import { RingSpinner } from '$lib/components/spinners';
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

  const uploadImage = async (file: File) => {
    try {
      uploadingCount.update((count) => count + 1);

      const { key, presignedUrl } = await prepareImageUpload();
      await ky.put(presignedUrl, { body: file });
      const resp = await finalizeImageUpload({ key, name: file.name });

      return resp.id;
    } finally {
      uploadingCount.update((count) => count - 1);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      uploadingCount.update((count) => count + 1);

      const { key, presignedUrl } = await prepareFileUpload();
      await ky.put(presignedUrl, { body: file });
      const resp = await finalizeFileUpload({ key, name: file.name });

      return resp.id;
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
      const id = await uploadImage(images[0]);
      $state.editor.commands.insertContentAt(pos, { type: 'image', attrs: { id } });
    } else if (images.length > 1) {
      const ids = await Promise.all(images.map((v) => uploadImage(v)));
      $state.editor.commands.insertContentAt(pos, { type: 'gallery', attrs: { ids } });
    }

    if (others.length > 0) {
      await Promise.all(
        others.map((v) =>
          uploadFile(v).then((id) => {
            $state.editor?.commands.insertContentAt(pos, { type: 'file', attrs: { id } });
          }),
        ),
      );
    }
  };
</script>

{#if $uploadingCount > 0}
  <div
    class={css({
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderWidth: '1px',
      borderColor: 'gray.300',
      paddingX: '20px',
      paddingY: '14px',
      backgroundColor: 'gray.5',
      boxShadow: '[2 3px 8px 0 {colors.gray.900/8}]',
      zIndex: '50',
    })}
  >
    <RingSpinner style={css.raw({ color: 'gray.300', size: '32px' })} />

    <div>
      <p class={css({ marginBottom: '2px', fontSize: '14px', fontWeight: 'semibold' })}>파일을 업로드하고 있어요</p>
      <div class={css({ fontSize: '13px', color: 'gray.500' })}>
        <mark class={css({ color: 'brand.400' })}>{$uploadingCount}개</mark>
        업로드 중
      </div>
    </div>
  </div>
{/if}
