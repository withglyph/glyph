<script lang="ts">
  import ky from 'ky';
  import { nanoid } from 'nanoid';
  import { writable } from 'svelte/store';
  import FilePlusIcon from '~icons/tabler/file-plus';
  import { graphql } from '$bifrost';
  import { Icon } from '$lib/components';
  import { Modal } from '$lib/components/v2';
  import Button from '$lib/components/v2/Button.svelte';
  import { css } from '$styled-system/css';
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
  let files: { ref: string; file: File; id?: string }[] = [];

  let uploadingCount = writable(0);

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
      files = [...files, { ref, file }];

      const { key, presignedUrl } = await prepareFileUpload();
      await ky.put(presignedUrl, { body: file });
      const resp = await finalizeFileUpload({ key, name: file.name });

      files = files.map((f) => (f.ref === ref ? { ...f, id: resp.id } : f));
    } finally {
      uploadingCount.update((count) => count - 1);
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

    open = false;
  };
</script>

<Modal bind:open>
  <svelte:fragment slot="title">파일 선택</svelte:fragment>
  <button
    class={css({
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '4px',
      width: 'full',
      height: '200px',
      borderWidth: '2px',
      borderStyle: 'dashed',
      borderColor: 'gray.300',
    })}
    type="button"
    on:click={() => inputEl.click()}
  >
    <Icon style={css.raw({ color: 'gray.500' })} icon={FilePlusIcon} size={32} />
    <div class={css({ fontSize: '14px', color: 'gray.500' })}>파일을 끌어다 놓거나 클릭해서 업로드해주세요</div>
  </button>

  {#each files as { ref: key, file } (key)}
    <div>{file.name}</div>
  {/each}

  <input bind:this={inputEl} class={css({ display: 'none' })} type="file" on:change={handleSelect} />

  <Button slot="action" style={css.raw({ width: 'full' })} disabled={$uploadingCount > 0} on:click={handleInsert}>
    삽입
  </Button>
</Modal>
