<script lang="ts">
  import './driver.css';

  import { Semaphore } from 'async-mutex';
  import { driver as driverFn } from 'driver.js';
  import ky from 'ky';
  import { nanoid } from 'nanoid';
  import * as R from 'radash';
  import Sortable from 'sortablejs';
  import { onDestroy, setContext, tick } from 'svelte';
  import IconBookBothPage from '~icons/glyph/book-both-page';
  import IconBookSinglePage from '~icons/glyph/book-single-page';
  import IconContentScroll from '~icons/glyph/content-scroll';
  import IconContentSlide from '~icons/glyph/content-slide';
  import IconEmbedCompact from '~icons/glyph/embed-compact';
  import IconEmbedFull from '~icons/glyph/embed-full';
  import IconGrid from '~icons/glyph/grid';
  import IconGrid2Columns from '~icons/glyph/grid-2-columns';
  import IconGrid3Columns from '~icons/glyph/grid-3-columns';
  import IconHelpLine from '~icons/glyph/help-line';
  import IconArrowsExchange from '~icons/tabler/arrows-exchange';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconGripVertical from '~icons/tabler/grip-vertical';
  import IconLayoutGrid from '~icons/tabler/layout-grid';
  import IconPhoto from '~icons/tabler/photo';
  import IconPhotoUp from '~icons/tabler/photo-up';
  import IconPictureInPictureOff from '~icons/tabler/picture-in-picture-off';
  import IconPlus from '~icons/tabler/plus';
  import { graphql } from '$glitch';
  import { Alert, Icon, Link, Tooltip } from '$lib/components';
  import { Checkbox, Switch } from '$lib/components/forms';
  import { Button, Modal } from '$lib/components/v2';
  import { isValidImageFile, persisted, validImageMimes } from '$lib/utils';
  import { css, cx } from '$styled-system/css';
  import { center, flex, grid } from '$styled-system/patterns';
  import Display from './Display.svelte';
  import HorizontalScroll from './HorizontalScroll.svelte';
  import IsomorphicImage from './IsomorphicImage.svelte';
  import RadioGroup from './RadioGroup.svelte';
  import type { Image_image } from '$glitch';
  import type { NodeViewProps } from '$lib/tiptap';

  export let open = false;

  let standaloneAlertOpen = false;

  export let node: NodeViewProps['node'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  if (node.attrs.layout === 'initial') {
    updateAttributes({ layout: 'scroll' });
  }

  let sortable: Sortable;

  let sortableContainer: HTMLElement;
  let sortableGallery: HTMLElement;

  const reorderArray = (arr: (string | IsomorphicImage)[], newIndex: number, oldIndex: number) => {
    const draggedItem = arr[oldIndex];

    if (oldIndex > newIndex) {
      arr = [...arr.slice(0, newIndex), draggedItem, ...arr.slice(newIndex, oldIndex), ...arr.slice(oldIndex + 1)];
    } else {
      arr = [
        ...arr.slice(0, oldIndex),
        ...arr.slice(oldIndex + 1, newIndex + 1),
        draggedItem,
        ...arr.slice(newIndex + 1),
      ];
    }

    return arr;
  };

  let sortableOptions: Sortable.Options = {
    scroll: true,
    handle: '.image',
    animation: 150,
    delay: 0,
    forceAutoScrollFallback: true,
    scrollSensitivity: 100,
    scrollSpeed: 10,
    bubbleScroll: true,
    dragClass: 'dragging-item',
    onMove: (evt) => {
      if (evt.related.className.includes('prevent-dragging')) {
        return false;
      }
    },
    onEnd: ({ newIndex, oldIndex }) => {
      if (newIndex === undefined || oldIndex === undefined) return;

      const reorderedData = reorderArray(node.attrs.__data, newIndex, oldIndex);

      updateAttributes({ __data: reorderedData });
    },
  };

  $: if (sortableContainer) {
    sortable = Sortable.create(sortableContainer, sortableOptions);
  }

  $: if (sortableGallery) {
    sortable = Sortable.create(sortableGallery, sortableOptions);
  }

  const prepareImageUpload = graphql(`
    mutation TiptapGallery_PrepareImageUpload_Mutation {
      prepareImageUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeImageUpload = graphql(`
    mutation TiptapGallery_FinalizeImageUpload_Mutation($input: FinalizeImageUploadInput!) {
      finalizeImageUpload(input: $input) {
        id
        name
        color
        ...Image_image
      }
    }
  `);

  type IsomorphicImage = { id: string } & (
    | { kind: 'file'; __file: File }
    | { kind: 'data'; __data: { id: string; name: string } & Image_image }
  );

  $: updateAttributes({
    ids: node.attrs.__data.filter((i: IsomorphicImage) => i.kind === 'data').map((i: IsomorphicImage) => i.id),
  });

  let imageListOpen = false;
  let selectedImages: string[] = [];
  let selectedImageName: string | undefined;

  $: if (selectedImages.length > 0) {
    const selectedNode = node.attrs.__data.find((i: IsomorphicImage) => i.id === selectedImages[0]);
    selectedImageName = selectedNode?.kind === 'data' ? selectedNode.__data.name : selectedNode?.__file.name;
  }

  $: allSelected =
    node.attrs.__data.length > 0 &&
    R.diff(
      node.attrs.__data.map((i: IsomorphicImage) => i.id),
      selectedImages,
    ).length === 0;

  let visited = persisted('gallery-editor-visited', false);

  let onboardingAnchorElement1: HTMLElement | undefined;
  let onboardingAnchorElement2: HTMLElement | undefined;
  const onboardingAnchorLastDynamicId = 'image-list-view-first-item';

  let driver: ReturnType<typeof driverFn> | undefined;

  async function startDrive() {
    await tick();

    if (!onboardingAnchorElement1 || !onboardingAnchorElement2)
      throw new Error('onboardingAnchorElements is not ready');

    driver = driverFn({
      steps: [
        {
          element: onboardingAnchorElement1,
          popover: {
            popoverClass: 'onboarding-popover step-1',
            description: '이미지를 <mark>드래그해서 놓으면</mark> 순서를 변경할 수 있어요',
          },
        },
        {
          element: onboardingAnchorElement2,
          popover: {
            popoverClass: 'onboarding-popover step-2',
            description: '전체목록을 클릭하면 <mark>여러 장의 이미지를 편집</mark>할 수 있어요',
            onNextClick: async () => {
              imageListOpen = true;
              await tick();
              driver?.moveNext();
            },
          },
        },
        {
          element: '#' + onboardingAnchorLastDynamicId,
          popover: {
            popoverClass: 'onboarding-popover step-3',
            description: '이미지 편집과 동일하게 <mark>드래그해서 놓으면</mark> 순서를 변경할 수 있어요',
            onPrevClick: async () => {
              imageListOpen = false;
              await tick();
              driver?.movePrevious();
            },
          },
        },
      ],
      showProgress: true,
      showButtons: ['previous', 'next'],
      overlayOpacity: 0.2,
      stagePadding: 0,
      stageRadius: 4,
      prevBtnText: '이전',
      nextBtnText: '다음',
      doneBtnText: '완료',
      progressText: '<mark>{{current}}</mark><span class="divider">/</span>{{total}}',
    });

    driver.drive();

    // eslint-disable-next-line svelte/infinite-reactive-loop
    $visited = true;
  }

  $: firstIsomorphicImageIsUploading = node.attrs.__data.length > 0 && node.attrs.__data[0].kind === 'data';
  $: if (open && !$visited && firstIsomorphicImageIsUploading) {
    // eslint-disable-next-line svelte/infinite-reactive-loop, unicorn/prefer-top-level-await
    startDrive();
  }

  onDestroy(() => {
    if (driver) {
      driver.destroy();
    }

    if (sortable) {
      sortable.destroy();
    }
  });

  const semaphore = new Semaphore(20);

  const upload = async (file: File) => {
    return await semaphore.runExclusive(async () => {
      const { key, presignedUrl } = await prepareImageUpload();
      await ky.put(presignedUrl, { body: file });
      return await finalizeImageUpload({ key, name: file.name });
    });
  };

  const handleInsertImage = () => {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = validImageMimes.join(',');
    picker.multiple = true;

    picker.addEventListener('change', async () => {
      const files = picker.files;

      if (!files) {
        return;
      }

      const images: IsomorphicImage[] = [];
      for (const file of files) {
        if (!(await isValidImageFile(file))) {
          continue;
        }

        const id = nanoid();
        images.push({ id, kind: 'file', __file: file });
      }

      await updateAttributes((attrs) => ({
        __data: [...attrs.__data, ...images],
      }));

      for (const image of images) {
        if (image.kind !== 'file') {
          continue;
        }

        upload(image.__file).then((resp) => {
          updateAttributes((attrs) => ({
            __data: attrs.__data.map((i: IsomorphicImage) =>
              i.id === image.id ? { id: resp.id, kind: 'data', __data: resp } : i,
            ),
          }));
        });
      }
    });

    picker.showPicker();
  };

  const exchangeImage = async (imageId: string) => {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = validImageMimes.join(',');

    picker.addEventListener('change', async () => {
      const file = picker.files?.[0];

      if (!file || !(await isValidImageFile(file))) {
        return;
      }

      const id = nanoid();
      const image: IsomorphicImage = { id, kind: 'file', __file: file };

      await updateAttributes((attrs) => ({
        __data: [...attrs.__data, image],
      }));

      if (image.kind !== 'file') {
        return;
      }

      upload(image.__file).then((resp) => {
        updateAttributes((attrs) => ({
          __data: attrs.__data.map((i: IsomorphicImage) =>
            i.id === imageId ? { id: resp.id, kind: 'data', __data: resp } : i,
          ),
        }));
      });
    });

    picker.showPicker();
  };

  setContext('exchangeImage', exchangeImage);

  const removeImages = async (ids: string[]) => {
    await updateAttributes((attrs) => ({
      __data: attrs.__data.filter((i: IsomorphicImage) => !ids.includes(i.id)),
    }));
    selectedImages = selectedImages.filter((i) => !ids.includes(i));
  };
</script>

<Modal
  style={css.raw({ paddingTop: '0', paddingBottom: '0', height: 'full', overflowY: 'hidden' })}
  size="lg"
  on:close={() => (open = false)}
  bind:open
>
  <svelte:fragment slot="title-left">
    {#if imageListOpen}
      <button type="button" on:click={() => (imageListOpen = false)}>
        <Icon icon={IconChevronLeft} size={24} />
      </button>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="title">
    {#if imageListOpen}
      전체목록
    {:else}
      이미지 편집
      <Tooltip
        style={flex.raw({ align: 'center', marginLeft: '4px' })}
        message="이미지는 무제한으로 추가할 수 있으며, 하단에 있는 이미지를 드래그해서 놓으면 순서를 변경할 수 있어요"
        offset={10}
        placement="bottom-start"
      >
        <Icon style={css.raw({ 'color': 'gray.400', '& *': { strokeWidth: '[1]' } })} icon={IconHelpLine} size={20} />
      </Tooltip>
    {/if}
  </svelte:fragment>
  <div class={flex({ direction: 'column', size: 'full' })}>
    {#if imageListOpen}
      <div
        class={flex({
          align: 'center',
          marginTop: '16px',
          paddingBottom: '8px',
        })}
      >
        <Checkbox
          style={css.raw({
            _after: {
              content: "''",
              display: 'block',
              marginLeft: '6px',
              backgroundColor: 'gray.200',
              height: '12px',
              width: '1px',
            },
          })}
          checked={allSelected}
          disabled={node.attrs.__data.length === 0}
          variant="brand"
          on:change={() => {
            // @ts-expect-error node.attrs.__data 타입이 any라서 map에서 타입 오류가 발생함
            selectedImages = allSelected ? [] : node.attrs.__data.map((i) => i.id);
          }}
        >
          전체선택
        </Checkbox>
        <button
          class={css({ paddingX: '6px', fontSize: '15px' })}
          type="button"
          on:click={() => removeImages(selectedImages)}
        >
          삭제
        </button>
      </div>

      <p class={css({ marginBottom: '16px', paddingY: '2px', fontSize: '13px', color: 'gray.500' })}>
        이미지를 드래그해서 놓으면 순서를 변경할 수 있어요
      </p>

      <div
        bind:this={sortableGallery}
        class={flex({
          direction: 'column',
          gap: '8px',
          paddingBottom: '32px',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbar: 'hidden',
        })}
      >
        {#each node.attrs.__data as image, index (image.id)}
          <button
            class={cx(
              'image',
              flex({
                position: 'relative',
                align: 'center',
                borderWidth: '1px',
                borderColor: 'gray.100',
                paddingX: '14px',
                paddingY: '8px',
                backgroundColor: { base: 'gray.5', _hover: 'gray.100' },
                height: '64px',
                width: 'full',
                _pressed: { borderWidth: '2px', borderColor: 'brand.400', backgroundColor: 'brand.50' },
              }),
            )}
            aria-pressed={selectedImages.includes(image.id)}
            data-id={image.id}
            type="button"
            on:click={() => {
              selectedImages = selectedImages.includes(image.id)
                ? selectedImages.filter((id) => id !== image.id)
                : [...selectedImages, image.id];
            }}
          >
            <span
              class={css({
                marginRight: '12px',
                fontSize: '12px',
                fontWeight: 'medium',
                color: 'gray.500',
                textAlign: 'center',
                width: '26px',
              })}
            >
              {index + 1}
            </span>
            <IsomorphicImage style={css.raw({ marginRight: '8px', size: '48px', objectFit: 'cover' })} {image} />
            <p class={css({ flexGrow: '1', fontSize: '13px', textAlign: 'left' })}>
              {image.kind === 'data' ? image.__data.name : image.__file.name}
            </p>

            <div class={flex({ align: 'center', gap: '8px', marginLeft: '20px' })}>
              <button class={css({ padding: '4px' })} type="button" on:click={() => exchangeImage(image.id)}>
                <Icon style={css.raw({ color: 'gray.800' })} icon={IconArrowsExchange} size={20} />
              </button>
              <Link external href={image.kind === 'data' ? image.__data.url : undefined}>
                <Icon style={css.raw({ color: 'gray.800' })} icon={IconPictureInPictureOff} size={20} />
              </Link>
              <div class={css({ padding: '4px' })}>
                <Icon style={css.raw({ color: 'gray.800' })} icon={IconGripVertical} size={20} />
              </div>
            </div>
            {#if index === 0}
              <div id={onboardingAnchorLastDynamicId} class={css({ position: 'absolute', inset: '0', zIndex: '-1' })} />
            {/if}
          </button>
        {/each}
        <button
          class={cx(
            'prevent-dragging',
            flex({
              align: 'center',
              gap: '4px',
              borderWidth: '1px',
              borderColor: 'gray.200',
              borderStyle: 'dashed',
              paddingX: '14px',
              paddingY: '8px',
              color: 'gray.400',
              backgroundColor: 'gray.50',
              width: 'full',
              height: '64px',
            }),
          )}
          type="button"
          on:click={handleInsertImage}
        >
          <Icon icon={IconPlus} />
          <span class={css({ fontSize: '13px' })}>이미지 추가</span>
        </button>
      </div>
    {:else}
      <div class={flex({ height: 'full', paddingBottom: '116px' })}>
        <div
          class={css(
            {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexGrow: '1',
              paddingY: '20px',
              paddingRight: '20px',
              size: 'full',
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollbar: 'hidden',
            },
            node.attrs.ids.length === 0 && { justifyContent: 'center' },
          )}
        >
          {#if node.attrs.ids.length === 0}
            <div
              class={center({
                flexDirection: 'column',
                gap: '8px',
                borderWidth: '1px',
                borderColor: 'brand.400',
                borderStyle: 'dashed',
                color: 'gray.500',
                backgroundColor: 'gray.50',
                width: 'full',
                height: '305px',
              })}
            >
              <Icon style={css.raw({ color: 'brand.400' })} icon={IconPhotoUp} size={32} />
              <p class={css({ fontSize: '14px' })}>이미지를 업로드해주세요</p>
              <Button
                style={css.raw({ backgroundColor: 'gray.5' })}
                size="sm"
                variant="gray-outline"
                on:click={handleInsertImage}
              >
                이미지 업로드
              </Button>
            </div>
          {/if}

          <Display editable {node} {updateAttributes} />
        </div>
        <div
          class={flex({
            flexDirection: 'column',
            flex: 'none',
            gap: '16px',
            borderLeftWidth: '1px',
            borderColor: 'gray.100',
            paddingTop: '16px',
            paddingLeft: '20px',
            paddingBottom: '82px',
            width: '130px',
            height: 'full',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbar: 'hidden',
          })}
        >
          <div>
            <p class={css({ marginBottom: '8px', fontSize: '13px', fontWeight: 'medium' })}>레이아웃</p>

            <RadioGroup
              name="layout"
              style={grid.raw({
                gridTemplateColumns: '2',
                gridTemplateRows: '2',
                rowGap: '16px',
                columnGap: '14px',
              })}
              items={[
                { label: '스크롤', value: 'scroll', icon: IconContentScroll, checked: node.attrs.layout === 'scroll' },
                {
                  label: '슬라이드',
                  value: 'slide',
                  icon: IconContentSlide,
                  checked: node.attrs.layout === 'slide',
                },
                { label: '그리드', value: 'grid', icon: IconGrid, checked: node.attrs.layout === 'grid' },
                {
                  label: '개별',
                  value: 'standalone',
                  icon: IconPhoto,
                  checked: node.attrs.layout === 'standalone',
                },
              ]}
              size="sm"
              on:change={(v) => updateAttributes({ layout: v.detail })}
            />
          </div>

          <hr class={css({ flex: 'none', border: 'none', height: '1px', backgroundColor: 'gray.50' })} />

          {#if node.attrs.layout === 'grid'}
            <div>
              <p class={css({ marginBottom: '10px', fontSize: '13px', fontWeight: 'medium' })}>열</p>

              <RadioGroup
                name="column"
                style={css.raw({ borderBottomWidth: '1px', borderColor: 'gray.100', paddingBottom: '16px' })}
                items={[
                  {
                    label: '2열',
                    value: 2,
                    icon: IconGrid2Columns,
                    checked: node.attrs.gridColumns === 2,
                  },
                  { label: '3열', value: 3, icon: IconGrid3Columns, checked: node.attrs.gridColumns === 3 },
                ]}
                variant="icon-list"
                on:change={(v) => updateAttributes({ gridColumns: v.detail })}
              />
            </div>
          {/if}

          {#if node.attrs.layout === 'slide'}
            <div>
              <p class={css({ marginBottom: '10px', fontSize: '13px', fontWeight: 'medium' })}>보기</p>

              <RadioGroup
                name="view"
                style={css.raw({ borderBottomWidth: '1px', borderColor: 'gray.100', paddingBottom: '16px' })}
                items={[
                  {
                    label: '한 쪽 보기',
                    value: 1,
                    icon: IconBookSinglePage,
                    checked: node.attrs.slidesPerPage === 1,
                  },
                  { label: '두 쪽 보기', value: 2, icon: IconBookBothPage, checked: node.attrs.slidesPerPage === 2 },
                ]}
                variant="icon-list"
                on:change={(v) => updateAttributes({ slidesPerPage: v.detail })}
              />
            </div>
          {/if}

          {#if node.attrs.layout !== 'standalone'}
            <div>
              <p class={css({ marginBottom: '8px', fontSize: '13px', fontWeight: 'medium' })}>이미지 간격</p>

              <Switch
                name="space"
                checked={node.attrs.spacing}
                on:change={() => updateAttributes({ spacing: !node.attrs.spacing })}
              />
            </div>
          {/if}

          <hr class={css({ flex: 'none', border: 'none', height: '1px', backgroundColor: 'gray.50' })} />

          <div>
            <p class={css({ marginBottom: '10px', fontSize: '13px', fontWeight: 'medium' })}>이미지 너비</p>

            <RadioGroup
              name="size"
              items={[
                {
                  label: '꽉차게',
                  value: 'full',
                  icon: IconEmbedFull,
                  checked: node.attrs.size === 'full',
                },
                { label: '좁게', value: 'compact', icon: IconEmbedCompact, checked: node.attrs.size === 'compact' },
              ]}
              variant="icon-list"
              on:change={(v) => updateAttributes({ size: v.detail })}
            />
          </div>
        </div>
      </div>

      <div
        class={flex({
          align: 'center',
          position: 'sticky',
          bottom: '0',
          marginX: '-20px',
          borderTopWidth: '1px',
          borderColor: 'gray.100',
          backgroundColor: 'gray.5',
        })}
      >
        <button
          bind:this={onboardingAnchorElement2}
          class={flex({
            align: 'center',
            gap: '4px',
            position: 'absolute',
            top: '-29px',
            right: '20px',
            borderWidth: '1px',
            borderColor: 'gray.200',
            paddingX: '8px',
            paddingY: '6px',
            color: 'gray.400',
            backgroundColor: 'gray.5',
            height: '29px',
            zIndex: '1',
          })}
          type="button"
          on:click={() => {
            imageListOpen = true;
          }}
        >
          <Icon style={css.raw({ size: '14px' })} icon={IconLayoutGrid} />
          <span class={css({ fontSize: '11px', fontWeight: 'semibold' })}>전체목록</span>
        </button>
        <HorizontalScroll bind:listEl={sortableContainer}>
          {#each node.attrs.__data as image, index (image.id)}
            <li class={cx('image', css({ flex: 'none' }))}>
              <button
                class={flex({
                  position: 'relative',
                  flex: 'none',
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '3px',
                  _hover: { backgroundColor: 'gray.200' },
                })}
                type="button"
              >
                <IsomorphicImage
                  style={css.raw({ borderWidth: '1px', borderColor: 'gray.100', size: '60px', objectFit: 'cover' })}
                  {image}
                />
                <p
                  class={css({
                    fontSize: '13px',
                    fontWeight: 'medium',
                    color: 'gray.500',
                    textAlign: 'center',
                    width: 'full',
                  })}
                >
                  {index + 1}
                </p>
              </button>
              {#if index === 0}
                <div
                  bind:this={onboardingAnchorElement1}
                  class={css({ position: 'absolute', inset: '0', zIndex: '-1' })}
                />
              {/if}
            </li>
          {/each}

          <li class="prevent-dragging">
            <button
              class={flex({ flexDirection: 'column', gap: '4px', padding: '3px' })}
              type="button"
              on:click={handleInsertImage}
            >
              <div
                class={center({
                  borderWidth: '1px',
                  borderColor: 'gray.200',
                  borderStyle: 'dashed',
                  backgroundColor: 'gray.50',
                  size: '60px',
                })}
              >
                <Icon style={css.raw({ color: 'gray.400' })} icon={IconPlus} size={20} />
              </div>

              <p
                class={css({
                  fontSize: '13px',
                  fontWeight: 'medium',
                  color: 'gray.500',
                  textAlign: 'center',
                  width: 'full',
                })}
              >
                추가
              </p>
            </button>
          </li>
        </HorizontalScroll>
      </div>
    {/if}
  </div>
  <svelte:fragment slot="action">
    <!-- prettier-ignore -->
    <p class={css({ flexGrow: '1', fontSize: '14px' })}>
      {#if imageListOpen && selectedImages.length > 0}
        이미지 {selectedImageName}
        {#if selectedImages.length > 1}
          외 <mark class={css({ color: 'brand.400' })}>{selectedImages.length - 1}개</mark>
        {/if}
        선택됨
      {:else}
        총 <mark class={css({ color: 'brand.400' })}>{node.attrs.__data.length}</mark>개의 파일
      {/if}
    </p>

    {#if imageListOpen}
      <Button style={css.raw({ width: '110px' })} size="md" on:click={() => (imageListOpen = false)}>확인</Button>
    {:else}
      <Button
        style={css.raw({ width: '110px' })}
        size="md"
        variant="gradation-fill"
        on:click={() => {
          if (node.attrs.layout === 'standalone') {
            standaloneAlertOpen = true;
            return;
          }

          open = false;
        }}
      >
        삽입
      </Button>
    {/if}
  </svelte:fragment>
</Modal>

<Alert bind:open={standaloneAlertOpen}>
  <p slot="title" class={css({ textAlign: 'left' })}>이미지를 개별로 삽입할까요?</p>

  <p slot="content" class={css({ textAlign: 'left' })}>다시 되돌릴 수 없어요</p>

  <svelte:fragment slot="action">
    <Button
      style={css.raw({ hideFrom: 'sm' })}
      size="lg"
      variant="gray-sub-fill"
      on:click={() => (standaloneAlertOpen = false)}
    >
      취소
    </Button>
    <Button
      style={css.raw({ hideBelow: 'sm' })}
      size="lg"
      variant="gray-outline"
      on:click={() => (standaloneAlertOpen = false)}
    >
      취소
    </Button>
    <Button
      size="lg"
      variant="red-fill"
      on:click={async () => {
        // await updateAttributes((attrs) => ({
        //   __data: attrs.__data.map((d) => (d.size = node.attrs.size)),
        // }));

        standaloneAlertOpen = false;
        open = false;
      }}
    >
      확인
    </Button>
  </svelte:fragment>
</Alert>

<style>
  .dragging-item {
    border-width: 2px;
    /* brand.400 */
    border-color: #8162e8;
    /* brand.50 */
    background-color: #f9f7ff;
  }
</style>
