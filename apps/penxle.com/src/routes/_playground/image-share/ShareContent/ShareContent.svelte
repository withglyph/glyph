<script lang="ts">
  import clsx from 'clsx';
  import * as htmlToImage from 'html-to-image';
  import { onMount } from 'svelte';
  import Logo from '$assets/branding/logo-chalk-transparent.svg?component';
  import Wordmark from '$assets/branding/wordmark.svg?component';
  import { Button, Image, Modal } from '$lib/components';
  import { toast } from '$lib/notification';
  import { TiptapRenderer } from '$lib/tiptap/components';
  import { dataurl2file } from '$lib/utils';
  import ColorPicker from './ColorPicker.svelte';
  import type { JSONContent } from '@tiptap/core';
  import type { Image_image } from '$glitch';

  export let open = false;
  export let content: JSONContent | null = null;

  export let title: string;
  export let spaceName: string;
  export let spaceIcon: Image_image;

  export let protectContent: boolean;

  let captureEl: HTMLElement;

  const backgroundColorClassnames = [
    'bg-gray-90 bg-none!',
    'bg-primary bg-none!',
    'bg-gray-70 bg-none!',
    'bg-gray-90',
    'bg-gray-80',
    'bg-gray-20',
    'bg-green-60',
    'bg-blue-60 bg-none!',
    'bg-#F66062 bg-none!',
    'bg-yellow-50 bg-none!',
    'bg-purple-60 bg-none!',
  ] as const;

  let backgroundColorClassname: (typeof backgroundColorClassnames)[number] = backgroundColorClassnames[0];

  const textColorFromBackgroundColor = {
    [backgroundColorClassnames[0]]: { body: 'text-darkprimary', logo: 'color-gray-10 op-50' },
    [backgroundColorClassnames[1]]: { body: 'text-primary', header: 'text-secondary' },
    [backgroundColorClassnames[2]]: {
      body: 'color-bg-primary',
      header: 'text-darkprimary',
      logo: 'color-gray-10 op-50',
    },
    [backgroundColorClassnames[3]]: { body: 'text-darkprimary', header: 'text-disabled' },
    [backgroundColorClassnames[4]]: { body: 'color-bg-primary', header: 'text-darkprimary' },
    [backgroundColorClassnames[5]]: { body: 'text-primary', header: 'text-secondary' },
    [backgroundColorClassnames[6]]: {
      body: 'color-bg-primary',
      header: 'text-darkprimary',
      logo: 'color-gray-10 op-50',
    },
    [backgroundColorClassnames[7]]: { body: 'text-darkprimary', logo: 'color-gray-10 op-50' },
    [backgroundColorClassnames[8]]: { body: 'text-darkprimary', logo: 'color-gray-10 op-50' },
    [backgroundColorClassnames[9]]: { body: 'text-primary', logo: 'color-gray-90 op-50' },
    [backgroundColorClassnames[10]]: {
      body: 'color-bg-primary',
      header: 'text-darkprimary',
      logo: 'color-gray-10 op-50',
    },
  };

  $: color = textColorFromBackgroundColor[backgroundColorClassname];

  onMount(() => {
    // ref PR: #830
    // Safari 환경에서 두번째 호출 이후에야 이미지 변환이 제대로 작동해서 마운트 직후 한번 실행하도록 했습니다.
    htmlToImage.toCanvas(captureEl);
  });

  async function onSubmit(event: Event) {
    event.preventDefault();

    const canvas = await htmlToImage.toCanvas(captureEl);
    const dataUrl = canvas.toDataURL();

    const file = dataurl2file(dataUrl, `${title}.png`);

    if (navigator.share) {
      navigator.share({ title, text: '밑줄 공유', files: [file] });
      return;
    }

    if (typeof ClipboardItem === 'undefined') {
      const link = document.createElement('a');
      link.download = `${title}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('이미지가 다운로드되었어요');
      return;
    }
    navigator.clipboard.write([new ClipboardItem({ 'image/png': file })]);
    toast.success('클립보드에 이미지가 복사되었어요');
  }
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">밑줄 공유</svelte:fragment>
  <svelte:fragment slot="subtitle">포스트에서 인상깊었던 내용을 공유할 수 있어요</svelte:fragment>
  <form id="share-content-as-image" class="flex flex-col items-center" on:submit={onSubmit}>
    <article
      bind:this={captureEl}
      class={clsx(
        'relative flex flex-col justify-between h-24.875rem w-full max-w-24.875rem p-6 rounded-3 border-(1px solid color-alphagray-10) rounded-xl background-gradient',
        backgroundColorClassname,
        color.body,
      )}
    >
      {#if content}
        <TiptapRenderer
          class="font-(size-1.5625rem 600) [&_.ProseMirror]:(line-height-152% overflow-hidden line-clamp-7) flex-grow"
          {content}
          options={{ paragraphIndent: 0, paragraphSpacing: 0, protectContent }}
        />
      {/if}
      <header class={('header' in color && color.header) || color.body}>
        <h1 class="body-16-b mb-xs">{title}</h1>
        <div class="flex gap-2 items-center">
          <Image class="square-6 rounded-0.31581rem border-0.5 border-alphagray-30" $image={spaceIcon} />
          <span class="body-14-sb">{spaceName}</span>
        </div>
        <div
          class={clsx(
            'absolute bottom-1.26rem right-1.5rem flex gap-0.26rem items-center',
            'logo' in color && color.logo,
          )}
          aria-label="펜슬 로고"
        >
          <Logo class="h-0.86094rem" aria-hidden />
          <Wordmark class="h-0.76156rem" aria-hidden />
        </div>
      </header>
    </article>
    <ColorPicker
      class="mt-6"
      label="테마 선택"
      options={backgroundColorClassnames}
      bind:value={backgroundColorClassname}
    />
  </form>
  <Button slot="action" class="flex-grow" form="share-content-as-image" size="xl" type="submit">공유하기</Button>
</Modal>

<style>
  .background-gradient {
    --border-width: 0.025rem;
    --border-color: rgba(190, 190, 190, 20%);
    --box-size: 1.25rem;
    background-image: linear-gradient(var(--border-color) var(--border-width), transparent var(--border-width)),
      linear-gradient(to right, var(--border-color) var(--border-width), transparent var(--border-width));
    background-size: var(--box-size) var(--box-size);
  }
</style>
