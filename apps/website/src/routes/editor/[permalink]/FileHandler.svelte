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
  const filesCount = writable(0);
  const format = writable<'image' | 'file' | 'auto'>('auto');

  const uploadImage = async (pos: number, file: File, multiple: boolean) => {
    try {
      uploadingCount.update((count) => count + 1);

      const { key, presignedUrl } = await prepareImageUpload();
      await ky.put(presignedUrl, { body: file });
      const resp = await finalizeImageUpload({ key, name: file.name });

      if (!multiple) $state.editor?.commands.insertContentAt(pos, { type: 'image', attrs: { id: resp.id } });
      // TODO: 이미지 업로드
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

    filesCount.set(as === 'image' ? images.length : others.length);
    format.set(as);

    if (images.length === 1) {
      await uploadImage(pos, images[0], false);
    } else if (images.length > 1) {
      $state.editor?.chain().focus().setGallery().run();
      await Promise.all(images.map((v) => uploadImage(pos, v, true)));
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
      <p class={css({ marginBottom: '2px', fontSize: '14px', fontWeight: 'semibold' })}>
        {#if $format === 'file'}
          파일을
        {:else}
          이미지를
        {/if} 업로드하고 있어요
      </p>
      <div
        class={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          fontSize: '13px',
          color: 'gray.500',
        })}
      >
        <p>
          총 {$filesCount}개의 {#if $format === 'file'}
            파일
          {:else}
            이미지
          {/if} 중
          <mark class={css({ color: 'brand.400' })}>{$uploadingCount}개</mark>
          업로드 중
        </p>
        <!-- prettier-ignore -->
        <span>
          <mark class={css({ color: 'brand.400' })}>{$filesCount - $uploadingCount}</mark>/{$filesCount}
        </span>
      </div>
    </div>
  </div>
{/if}
