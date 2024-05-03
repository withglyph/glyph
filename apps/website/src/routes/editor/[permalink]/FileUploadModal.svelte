<script lang="ts">
  import ky from 'ky';
  import { nanoid } from 'nanoid';
  import { writable } from 'svelte/store';
  import IconCircleCheck from '~icons/tabler/circle-check';
  import IconFileSymlink from '~icons/tabler/file-symlink';
  import IconTrash from '~icons/tabler/trash';
  import { graphql } from '$glitch';
  import { Icon } from '$lib/components';
  import { RingSpinner } from '$lib/components/spinners';
  import { Button, Modal } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import { getEditorContext } from './context';

  export let open = false;

  const prepareFileUpload = graphql(`
    mutation Editor_FileUploadModal_PrepareFileUpload_Mutation {
      prepareFileUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeFileUpload = graphql(`
    mutation Editor_FileUploadModal_FinalizeFileUpload_Mutation($input: FinalizeFileUploadInput!) {
      finalizeFileUpload(input: $input) {
        id
      }
    }
  `);

  const { state } = getEditorContext();

  let inputEl: HTMLInputElement;
  let files: { ref: string; file: File; id?: string; loading: boolean }[] = [];

  let uploadingCount = writable(0);
  let dragging: EventTarget | null = null;

  const handleSelect = () => {
    if (!inputEl.files?.length) {
      return;
    }

    const f = [...inputEl.files];
    inputEl.files = null;

    for (const file of f) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      uploadingCount.update((count) => count + 1);

      const ref = nanoid();
      files = [...files, { ref, file, loading: true }];

      const { key, presignedUrl } = await prepareFileUpload();
      await ky.put(presignedUrl, { body: file });
      const resp = await finalizeFileUpload({ key, name: file.name });

      files = files.map((f) => (f.ref === ref ? { ...f, id: resp.id } : f));
    } finally {
      uploadingCount.update((count) => count - 1);
      files = files.map((f) => (f.file === file ? { ...f, loading: false } : f));
    }
  };

  const handleInsert = () => {
    if (!$state.editor) {
      return;
    }

    const chain = $state.editor.chain();
    for (const { id } of files) {
      if (id) {
        chain.setFile(id);
      }
    }
    chain.run();

    files = [];
    open = false;
  };
</script>

<Modal
  style={css.raw({ paddingTop: '0' })}
  actionStyle={css.raw({ borderTopWidth: '1px', borderTopColor: 'gray.100' })}
  bind:open
>
  <svelte:fragment slot="title">파일 선택</svelte:fragment>

  <div
    class={css({
      position: 'sticky',
      top: '0',
      marginX: '-20px',
      paddingTop: '16px',
      paddingX: '20px',
      paddingBottom: '8px',
      backgroundColor: 'gray.5',
      width: 'auto',
      flexGrow: '1',
    })}
  >
    <div
      class={css(
        {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          borderWidth: '1px',
          borderStyle: 'dashed',
          borderColor: 'brand.400',
          paddingX: '34px',
          backgroundColor: 'gray.50',
          width: 'full',
          height: '200px',
          transition: 'common',
        },
        dragging && { backgroundColor: 'brand.200' },
      )}
      role="button"
      tabindex="-1"
      on:dragenter|preventDefault|stopPropagation={({ target, dataTransfer }) => {
        if (dataTransfer?.types.includes('Files')) dragging = target;
      }}
      on:dragover|preventDefault|stopPropagation={({ dataTransfer }) => {
        if (dataTransfer) {
          dataTransfer.dropEffect = dataTransfer.types.includes('Files') ? 'copy' : 'none';
        }
      }}
      on:drop|preventDefault|stopPropagation={async ({ dataTransfer }) => {
        dragging = null;
        if (dataTransfer) {
          const f = [...dataTransfer.files];

          for (const file of f) {
            uploadFile(file);
          }
        }
      }}
      on:dragleave|preventDefault|stopPropagation={({ target }) => {
        if (target === dragging) dragging = null;
      }}
    >
      <Icon style={css.raw({ color: 'brand.400' })} icon={IconFileSymlink} size={32} />
      <p class={css({ fontSize: '14px', color: 'gray.500' })}>파일을 드래그해 업로드해주세요</p>
      <span class={css({ fontSize: '13px', color: 'gray.400' })}>또는</span>
      <Button
        style={css.raw({ backgroundColor: 'gray.5' })}
        size="sm"
        variant="gray-outline"
        on:click={() => inputEl.click()}
      >
        파일 업로드
      </Button>
    </div>

    <!-- prettier-ignore -->
    <p class={css({ marginTop: '16px', fontSize: '13px' })}>
      총 <mark class={css({ color: 'brand.400' })}>{files.length}</mark>개의 파일
      {#if $uploadingCount > 0}
        <span class={css({ color: 'gray.400' })}>({$uploadingCount}개의 파일 업로드중..)</span>
      {/if}
    </p>
  </div>

  <ul class={css({ overflowY: 'auto', scrollbar: 'hidden' })}>
    {#each files as { ref: key, file, loading } (key)}
      <li
        class={flex({
          align: 'center',
          justify: 'space-between',
          gap: '16px',
          paddingY: '12px',
          fontSize: '13px',
          truncate: true,
        })}
      >
        <div class={flex({ align: 'center', gap: '4px', truncate: true })}>
          {#if loading}
            <RingSpinner style={css.raw({ size: '16px', color: 'gray.300' })} />
          {:else}
            <Icon style={css.raw({ color: 'brand.400' })} icon={IconCircleCheck} />
          {/if}
          <p class={css({ truncate: true })}>{file.name}</p>
        </div>

        <button
          class={css({ flex: 'none' })}
          type="button"
          on:click={() => {
            files = files.filter((f) => f.ref !== key);
          }}
        >
          <Icon style={css.raw({ color: 'gray.600' })} icon={IconTrash} size={20} />
        </button>
      </li>
    {/each}
  </ul>

  <input bind:this={inputEl} class={css({ display: 'none' })} multiple type="file" on:change={handleSelect} />

  <Button slot="action" style={css.raw({ width: 'full' })} loading={$uploadingCount > 0} on:click={handleInsert}>
    삽입
  </Button>
</Modal>
