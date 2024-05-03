<script lang="ts">
  import IconArrowBarToDown from '~icons/tabler/arrow-bar-to-down';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconShare2 from '~icons/tabler/share-2';
  import { browser } from '$app/environment';
  import { graphql } from '$bifrost';
  import { Icon } from '$lib/components';
  import { RingSpinner } from '$lib/components/spinners';
  import { Button, Modal } from '$lib/components/v2';
  import { toast } from '$lib/notification';
  import { dataurl2file } from '$lib/utils';
  import { css, cx } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  export let open = false;
  export let body: string;

  export let title: string;
  export let spaceName: string;

  let showShareTargetMenu = false;

  const fontFamilies = [
    { label: '프리텐타드', value: 'PNXL_Pretendard' },
    { label: '리디바탕', value: 'PNXL_RIDIBatang' },
  ] as const;
  let fontFamily: (typeof fontFamilies)[number]['value'] = fontFamilies[0].value;

  const fontSizes = [
    { label: '작은글씨', value: '14px' },
    { label: '중간글씨', value: '16px' },
    { label: '큰글씨', value: '20px' },
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
      PNXL_Pretendard: 'Pretendard',
      PNXL_RIDIBatang: 'RIDIBatang',
    } as const satisfies Record<(typeof fontFamilies)[number]['value'], string>;

    const fontSizeToInputFormat = {
      '14px': 'small',
      '16px': 'medium',
      '20px': 'large',
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
      toast('이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');

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
  };

  const share = () => {
    if (!generatedPostShareImage) throw new Error('이미지가 생성되지 않았습니다.');
    const file = dataurl2file(generatedPostShareImage, `${title} | ${spaceName}.png`);
    navigator.share({ title, text: '밑줄 이미지 공유', files: [file] });
  };

  const shareTargetMenuButtonWarpClassname = css({
    'position': 'relative',
    'display': 'flex',
    'flexDirection': 'column',
    'alignItems': 'center',
    'gap': '6px',

    '& > button': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      size: '60px',
      color: 'gray.500',
      backgroundColor: 'gray.50',
    },

    '& > label': {
      fontSize: '13px',
      fontWeight: 'medium',
      _after: {
        content: '""',
        position: 'absolute',
        inset: '0',
        cursor: 'pointer',
      },
    },
  });
</script>

<Modal
  style={css.raw({ paddingBottom: '0', maxWidth: 'screen' })}
  actionStyle={css.raw(showShareTargetMenu && { visibility: 'hidden' })}
  bind:open
>
  <button
    slot="title-left"
    class={css({
      transition: 'opacity',
      _disabled: { opacity: '0', visibility: 'hidden' },
    })}
    disabled={!showShareTargetMenu}
    type="button"
    on:click={() => (showShareTargetMenu = false)}
  >
    <Icon icon={IconChevronLeft} size={24} />
  </button>
  <svelte:fragment slot="title">{showShareTargetMenu ? '공유 및 저장' : '이미지로 공유'}</svelte:fragment>
  <form id="share-content-as-image" class={flex({ direction: 'column' })}>
    <article
      class={css({
        position: 'sticky',
        top: '0',
        marginX: '-20px',
        paddingBottom: '16px',
        backgroundColor: 'gray.5',
        width: 'auto',
        flexGrow: '1',
        zIndex: '1',
      })}
    >
      <img
        class={css({
          borderWidth: '1px',
          borderColor: backgroundColor === '#FFFFFF' ? '[gray.900/10]' : 'transparent',
          marginX: 'auto',
          size: 'full',
          maxSize: '334px',
          aspectRatio: '1/1',
        })}
        alt="밑줄 이미지 미리보기"
        src={generatedPostShareImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"}
      />

      {#if showSpinner}
        <div class={center({ position: 'absolute', inset: '0', paddingX: '16px', paddingY: '8px' })}>
          <RingSpinner style={css.raw({ size: '80px', color: 'brand.400', opacity: '80' })} />
        </div>
      {/if}
    </article>

    <div class={css({ position: 'relative' })}>
      {#if showShareTargetMenu}
        <hr
          class={css({
            border: 'none',
            height: '8px',
            marginX: '-20px',
            backgroundColor: 'gray.50',
          })}
        />

        <section
          class={css({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            paddingTop: '32px',
            paddingBottom: '52px',
            size: 'full',
            backgroundColor: 'gray.5',
            transition: 'opacity',
          })}
        >
          <div class={shareTargetMenuButtonWarpClassname}>
            <button id="download-share-button" type="button" on:click={download}>
              <Icon icon={IconArrowBarToDown} size={28} />
            </button>
            <label for="download-share-button">이미지 저장</label>
          </div>
          <div class={shareTargetMenuButtonWarpClassname}>
            <button
              id="etc-share-button"
              class={cx('peer', css({ _disabled: { color: 'gray.300' } }))}
              disabled={typeof navigator !== 'undefined' && !navigator.share}
              type="button"
              on:click={share}
            >
              <Icon icon={IconShare2} size={24} />
            </button>
            <label class={css({ _peerDisabled: { color: 'gray.300' } })} for="etc-share-button">SNS 공유</label>
          </div>
        </section>
      {:else}
        <section
          class={flex({
            align: 'center',
            gap: '8px',
            marginBottom: '14px',
            overflowX: 'auto',
            scrollbar: 'hidden',
          })}
        >
          {#each backgroundColors as bgColor (bgColor)}
            <label class={css({ position: 'relative', flex: 'none', size: '46px', cursor: 'pointer' })}>
              <input
                name="background-color-{bgColor}"
                class={cx('peer', css({ appearance: 'none', visibility: 'hidden' }))}
                type="radio"
                value={bgColor}
                bind:group={backgroundColor}
              />
              <div
                style:background={bgColor}
                class={css(
                  {
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    size: '46px',
                    backgroundColor: 'gray.900',
                    userSelect: 'none',
                    _peerChecked: { borderWidth: '2px', borderColor: 'brand.400' },
                  },
                  bgColor === '#FFFFFF' && { borderWidth: '1px', borderColor: 'gray.200' },
                )}
              />
            </label>
          {/each}
        </section>

        <hr class={css({ border: 'none', height: '8px', marginX: '-20px', backgroundColor: 'gray.50' })} />

        <section class={flex({ align: 'center', gap: '16px', paddingY: '14px' })} role="group">
          {#each fontFamilies as family (family)}
            <button
              style:font-family={family.value}
              class={css({
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '3px',
                paddingX: '5px',
                height: '34px',
                _hover: { backgroundColor: 'gray.100' },
                _focus: { backgroundColor: 'gray.100' },
                _pressed: { color: 'brand.400' },
              })}
              aria-pressed={fontFamily === family.value}
              type="button"
              on:click={() => (fontFamily = family.value)}
            >
              {family.label}
            </button>
          {/each}
        </section>
        <section
          class={flex({
            align: 'center',
            gap: '16px',
            borderTopWidth: '1px',
            borderTopColor: 'gray.100',
            marginX: '-20px',
            paddingX: '20px',
            paddingY: '14px',
          })}
          role="group"
        >
          {#each fontSizes as size (size)}
            <button
              style:font-size={size.value}
              class={css({
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: '3px',
                paddingX: '5px',
                height: '34px',
                _hover: { backgroundColor: 'gray.100' },
                _focus: { backgroundColor: 'gray.100' },
                _pressed: { fontWeight: 'bold', color: 'brand.400' },
              })}
              aria-pressed={fontSize === size.value}
              type="button"
              on:click={() => (fontSize = size.value)}
            >
              {size.label}
            </button>
          {/each}
        </section>

        <Button
          style={css.raw({ marginY: '20px', width: 'full' })}
          disabled={generatedPostShareImage === null}
          size="lg"
          on:click={() => (showShareTargetMenu = true)}
        >
          다음
        </Button>
      {/if}
    </div>
  </form>
</Modal>
