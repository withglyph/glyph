<script lang="ts">
  import { RingSpinner } from '@penxle/ui/spinners';
  import clsx from 'clsx';
  import { browser } from '$app/environment';
  import { graphql } from '$glitch';
  import { Tooltip } from '$lib/components';
  import { Button, Modal } from '$lib/components/v2';
  import { toast } from '$lib/notification';
  import { dataurl2file } from '$lib/utils';

  export let open = false;
  export let body: string;

  export let title: string;
  export let spaceName: string;

  let showShareTargetMenu = false;
  const shareTargetMenuButtonWarpClassname =
    "flex flex-col gap-0.38rem items-center relative [&>button]:(square-4rem flex center bg-gray-50 color-gray-500) [&>label]:(text-13-m color-gray-600 leading-150% after:(absolute content-[''] inset-0 cursor-pointer))";

  const fontFamilies = [
    { label: '프리텐타드', value: 'font-sans' },
    { label: '리디바탕', value: 'font-serif' },
  ] as const;
  let fontFamily: (typeof fontFamilies)[number]['value'] = fontFamilies[0].value;

  const fontSizes = [
    {
      label: '작은글씨',
      value: 'text-12-r!',
    },
    {
      label: '중간글씨',
      value: 'text-16-r!',
    },
    {
      label: '큰글씨',
      value: 'text-20-r!',
    },
  ] as const;
  let fontSize: (typeof fontSizes)[number]['value'] = fontSizes[1].value;

  const backgroundColors = [
    '#FFFFFF',
    '#D4D4D8',
    '#18181B',
    '#115E59',
    '#1E3A8A',
    '#4C1D95',
    '#9F1239',
    '#F66062',
    '#A16207',
  ] as const;

  let backgroundColor: (typeof backgroundColors)[number] = backgroundColors[0];

  const textColorFromBackgroundColor = {
    [backgroundColors[0]]: '#09090B',
    [backgroundColors[1]]: '#09090B',
    [backgroundColors[2]]: '#FFFFFF',
    [backgroundColors[3]]: '#FFFFFF',
    [backgroundColors[4]]: '#FFFFFF',
    [backgroundColors[5]]: '#FFFFFF',
    [backgroundColors[6]]: '#FFFFFF',
    [backgroundColors[7]]: '#FFFFFF',
    [backgroundColors[8]]: '#FFFFFF',
  } as const;

  $: color = textColorFromBackgroundColor[backgroundColor];

  let showSpinner = false;
  let generatedPostShareImage: string | null = null;

  const generatePostShareImage = graphql(`
    mutation ShareContent_GeneratePostShareImage_Mutation($input: GeneratePostShareImageInput!) {
      generatePostShareImage(input: $input)
    }
  `);

  $: if (browser && backgroundColor && fontFamily && fontSize) {
    handleShare();
  }

  const handleShare = async () => {
    const fontFamilyToInputFormat = {
      'font-sans': 'Pretendard',
      'font-serif': 'RIDIBatang',
    } as const satisfies Record<(typeof fontFamilies)[number]['value'], string>;

    const fontSizeToInputFormat = {
      'text-12-r!': 'small',
      'text-16-r!': 'medium',
      'text-20-r!': 'large',
    } as const satisfies Record<(typeof fontSizes)[number]['value'], string>;

    showSpinner = true;

    try {
      generatedPostShareImage = await generatePostShareImage({
        title,
        space: spaceName,
        body,
        background: backgroundColor,
        color,
        font: fontFamilyToInputFormat[fontFamily],
        size: fontSizeToInputFormat[fontSize],
      });
    } catch (err) {
      toast.error('이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');

      // 더미 값 할당으로 무한 루프를 방지함
      generatedPostShareImage = '';

      throw err;
    }
    showSpinner = false;
  };

  const download = () => {
    if (!generatedPostShareImage) throw new Error('이미지가 생성되지 않았습니다.');
    const link = document.createElement('a');
    link.download = `${title} | ${spaceName}.png`;
    link.href = generatedPostShareImage;
    link.click();
    toast.success('이미지가 다운로드되었어요');
  };

  const share = () => {
    if (!generatedPostShareImage) throw new Error('이미지가 생성되지 않았습니다.');
    const file = dataurl2file(generatedPostShareImage, `${title} | ${spaceName}.png`);
    navigator.share({ title, text: '밑줄 이미지 공유', files: [file] });
  };
</script>

<Modal actionClass={clsx(showShareTargetMenu && 'invisible')} titleClass="m-x-8 justify-center" bind:open>
  <button
    slot="title-left"
    class="absolute left-0 px-6 disabled:(invisible opacity-0) transition-opacity"
    disabled={!showShareTargetMenu}
    type="button"
    on:click={() => (showShareTargetMenu = false)}
  >
    <i class="i-tb-chevron-left square-6" />
  </button>
  <svelte:fragment slot="title">
    밑줄 이미지 편집
    <Tooltip
      class="flex items-center ml-1"
      message="포스트에서 인상깊었던 내용을 공유할 수 있어요"
      offset={10}
      placement="bottom-start"
    >
      <i class="i-tb-alert-circle square-3.5 text-gray-400" />
    </Tooltip>
  </svelte:fragment>
  <form id="share-content-as-image" class="flex flex-col">
    <article
      class={clsx(
        'relative m-x-5 m-t-5 m-b-4 square-24.875rem',
        backgroundColor === '#FFFFFF' && 'border-(1px solid color-alphagray-10)',
      )}
    >
      {#if generatedPostShareImage}
        <img alt="밑줄 이미지 미리보기" src={generatedPostShareImage} />
      {/if}

      {#if showSpinner}
        <div class="absolute inset-0 flex center px-4 py-2">
          <RingSpinner class="square-5rem color-teal-400 opacity-80" />
        </div>
      {/if}
    </article>

    <div class="relative">
      <section
        class={clsx(
          'flex gap-4 center absolute bg-white inset-0 square-full transition-opacity border-(t-0.5rem solid gray-100)',
          // 5.75rem = action button wrapper height
          'p-t-5.75rem',
          !showShareTargetMenu && 'invisible opacity-0 z--1',
        )}
      >
        <div class={shareTargetMenuButtonWarpClassname}>
          <button id="download-share-button" type="button" on:click={download}>
            <i class="square-1.875rem i-tb-arrow-bar-to-down" />
          </button>
          <label for="download-share-button">이미지 저장</label>
        </div>
        <div class={shareTargetMenuButtonWarpClassname}>
          <button
            id="etc-share-button"
            class="peer disabled:color-gray-300"
            disabled={typeof navigator !== 'undefined' && !navigator.share}
            type="button"
            on:click={share}
          >
            <i class="square-1.875rem i-tb-dots" />
          </button>
          <label class="peer-disabled:color-gray-300" for="etc-share-button">기타</label>
        </div>
      </section>
      <section class="flex gap-2 overflow-x-auto p-x-5 p-b-2 scrollbar">
        {#each backgroundColors as bgColor (bgColor)}
          <label>
            <input
              name="backgroundColorClassname"
              class="appearance-none peer"
              type="radio"
              value={bgColor}
              bind:group={backgroundColor}
            />
            <div
              style:background={bgColor}
              class={clsx(
                bgColor === '#FFFFFF' && 'border-(1px solid gray-200)',
                'square-2.875rem rounded-0.1875rem peer-checked:border-(2px solid teal-500) z--1',
              )}
            />
          </label>
        {/each}
      </section>
      <section class="flex p-x-5 p-y-0.88rem gap-4 items-center" role="group">
        {#each fontFamilies as family (family)}
          <button
            class={clsx(
              'inline-flex items-center p-x-0.31rem h-2.125rem text-16-r leading-160% rounded-0.1875rem hover:bg-gray-100 focus:bg-gray-100 aria-pressed:color-teal-500',
              family.value,
            )}
            aria-pressed={fontFamily === family.value}
            type="button"
            on:click={() => (fontFamily = family.value)}
          >
            {family.label}
          </button>
        {/each}
      </section>
      <section class="flex p-x-5 p-y-0.88rem gap-4 items-center border-(t-1px b-1px solid gray-200)" role="group">
        {#each fontSizes as size (size)}
          <button
            class={clsx(
              'inline-flex items-center p-x-0.31rem h-2.125rem text-16-r leading-160% rounded-0.1875rem hover:bg-gray-100 focus:bg-gray-100 aria-pressed:color-teal-500',
              size.value,
              'aria-pressed:font-bold',
            )}
            aria-pressed={fontSize === size.value}
            type="button"
            on:click={() => (fontSize = size.value)}
          >
            {size.label}
          </button>
        {/each}
      </section>
    </div>
  </form>

  <Button
    slot="action"
    class="flex-1 m-t-4"
    disabled={generatedPostShareImage === null}
    size="lg"
    on:click={() => (showShareTargetMenu = true)}
  >
    공유
  </Button>
</Modal>

<style>
  .scrollbar {
    &::-webkit-scrollbar {
      --uno: bg-none h-2;
    }

    &::-webkit-scrollbar-track {
      --uno: bg-gray-100;
    }

    /* This is necessary so you can still see the thumb even with the track hidden */
    &::-webkit-scrollbar-thumb {
      --uno: bg-gray-300 rounded-3;

      &:hover {
        --uno: bg-gray-400;
      }
    }

    scrollbar-width: thin;
    scrollbar-color: #888 rgb(244, 244, 225);
  }
</style>
