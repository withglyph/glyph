<script lang="ts">
  import './driver.css';

  import { Semaphore } from 'async-mutex';
  import clsx from 'clsx';
  import { driver as driverFn } from 'driver.js';
  import ky from 'ky';
  import { nanoid } from 'nanoid';
  import * as R from 'radash';
  import Sortable from 'sortablejs';
  import { onDestroy, tick } from 'svelte';
  import { graphql } from '$glitch';
  import { Tooltip } from '$lib/components';
  import { Checkbox, Switch } from '$lib/components/forms';
  import { isValidImageFile, persisted, validImageMimes } from '$lib/utils';
  import Display from './Display.svelte';
  import IsomorphicImage from './IsomorphicImage.svelte';
  import Modal from './Modal.svelte';
  import RadioGroup from './RadioGroup.svelte';
  import type { Image_image } from '$glitch';
  import type { NodeViewProps } from '$lib/tiptap';

  export let open = false;

  export let editor: NodeViewProps['editor'] | undefined;
  export let node: NodeViewProps['node'];
  export let updateAttributes: NodeViewProps['updateAttributes'];
  export let deleteNode: NodeViewProps['deleteNode'];

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

  $: if (sortableContainer) {
    sortable = Sortable.create(sortableContainer, {
      handle: '.image',
      dataIdAttr: 'data-id',
      onEnd: ({ newIndex, oldIndex }) => {
        if (newIndex === undefined || oldIndex === undefined) return;

        const reorderedData = reorderArray(node.attrs.__data, newIndex, oldIndex);

        updateAttributes({ __data: reorderedData });
      },
    });
  }

  $: if (sortableGallery) {
    sortable = Sortable.create(sortableGallery, {
      handle: '.image',
      dataIdAttr: 'data-id',
      onEnd: ({ newIndex, oldIndex }) => {
        if (newIndex === undefined || oldIndex === undefined) return;

        const reorderedData = reorderArray(node.attrs.__data, newIndex, oldIndex);

        updateAttributes({ __data: reorderedData });
      },
    });
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

  let view: 'grid' | 'list' = 'grid';

  let visited = persisted('gallery-editor-visited', false);

  let onboardingAnchorElements: [HTMLElement, HTMLElement] | [null, null] = [null, null];
  const onboardingAnchorLastDynamicId = 'image-list-view-first-item';

  let driver: ReturnType<typeof driverFn> | undefined;

  async function startDrive() {
    await tick();

    if (!onboardingAnchorElements[0] || !onboardingAnchorElements[1])
      throw new Error('onboardingAnchorElements is not ready');

    driver = driverFn({
      steps: [
        {
          element: onboardingAnchorElements[0],
          popover: {
            popoverClass: 'onboarding-popover step-1',
            description: '이미지를 <mark>드래그해서 놓으면</mark> 순서를 변경할 수 있어요',
          },
        },
        {
          element: onboardingAnchorElements[1],
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

  const removeImage = async (id: string) => {
    await updateAttributes((attrs) => ({
      __data: attrs.__data.filter((i: IsomorphicImage) => i.id !== id),
    }));
    selectedImages = selectedImages.filter((i) => i !== id);
  };

  const removeImages = async (ids: string[]) => {
    await updateAttributes((attrs) => ({
      __data: attrs.__data.filter((i: IsomorphicImage) => !ids.includes(i.id)),
    }));
    selectedImages = selectedImages.filter((i) => !ids.includes(i));
  };

  const handleInsert = () => {
    if (editor && node.attrs.layout === 'standalone') {
      let chain = editor.chain();
      for (const image of node.attrs.__data) {
        chain = chain.setStandaloneGallery(image);
      }
      chain.run();
      deleteNode();
    }

    open = false;
  };
</script>

<Modal on:close={() => (open = false)} bind:open>
  <svelte:fragment slot="title">
    이미지 편집
    <Tooltip
      class="flex ml-1"
      message="이미지는 무제한으로 추가할 수 있으며, 하단에 있는 이미지를 드래그해서 놓으면 순서를 변경할 수 있어요"
      offset={10}
      placement="bottom-start"
    >
      <i class="i-tb-alert-circle square-3.5 text-gray-400" />
    </Tooltip>
  </svelte:fragment>

  <div class="flex h-511px">
    <div class="flex flex-col w-562px">
      <div class="grow flex flex-col items-center overflow-y-auto p-t-6 p-b-4">
        <div class="grow flex flex-col items-center">
          {#if node.attrs.ids.length === 0}
            <button
              class="border border-gray-300 border-dashed bg-gray-50 text-gray-300 w-100 h-75 flex flex-col center gap-2.5"
              type="button"
              on:click={handleInsertImage}
            >
              <i class="i-tb-photo-up square-8" />
              <p class="text-13-m">이미지를 업로드해주세요</p>
            </button>
          {/if}

          <div class={clsx('w-100', node.attrs.layout === 'standalone' && 'gap-6')}>
            <Display deletable {node} {updateAttributes} />
          </div>
        </div>
      </div>

      <button
        bind:this={onboardingAnchorElements[1]}
        class="px-2 py-1.5 text-gray-400 border-(1 gray-200 b-none) rounded-t bg-white leading-0 shrink self-end m-r-4 z-1"
        type="button"
        on:click={() => {
          imageListOpen = true;
        }}
      >
        <i class="i-tb-layout-grid square-3.5" />
        <span class="text-11-sb ml-1.5">전체목록</span>
      </button>
      <div class="h-104px border-t border-gray-200 flex px-6 relative">
        <ul
          bind:this={sortableContainer}
          class="flex grow gap-1 overflow-x-auto overflow-y-hidden py-3.5 px-2.5 images"
        >
          {#each node.attrs.__data as image, index (image.id)}
            <li class="flex-none relative image" data-id={image.id}>
              <button
                class="relative p-1 flex flex-col gap-1 flex-none rounded hover:bg-gray-100 aria-pressed:(ring-1.5 ring-teal-500 bg-teal-50!) [&>div]:aria-pressed:(flex center)"
                aria-pressed={selectedImages.includes(image.id)}
                type="button"
                on:click={() => {
                  selectedImages = selectedImages.includes(image.id)
                    ? selectedImages.filter((id) => id !== image.id)
                    : [...selectedImages, image.id];
                }}
              >
                <IsomorphicImage class="square-12 rounded-0.1875rem object-cover" {image} />
                <div class="absolute left-1 top-1 bg-black/30 square-12 rounded-0.1875rem hidden">
                  <button
                    class="i-tb-trash square-4.5 text-white"
                    type="button"
                    on:click={() => removeImage(image.id)}
                  />
                </div>

                <p class="text-10-r text-gray-400 text-center w-full">{index + 1}</p>
              </button>
              {#if index === 0}
                <div bind:this={onboardingAnchorElements[0]} class="absolute inset-0 z--1" />
              {/if}
            </li>
          {/each}

          <li>
            <button class="p-1 flex flex-col gap-1 rounded" type="button" on:click={handleInsertImage}>
              <div class="bg-gray-100 square-12 rounded-0.1875rem flex center">
                <i class="i-tb-plus square-4 text-gray-400" />
              </div>

              <p class="text-10-r text-gray-400 text-center w-full">이미지 추가</p>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div class="w-37.5 flex-none py-5 pl-5 pr-6 border-l border-gray-200 space-y-4">
      <div>
        <p class="text-13-m mb-2.5">레이아웃</p>

        <RadioGroup
          name="layout"
          class="grid! grid-cols-2 grid-rows-2 border-b border-gray-100 pb-4"
          items={[
            {
              label: '개별',
              value: 'standalone',
              icon: 'i-tb-photo',
              checked: node.attrs.layout === 'standalone',
            },
            { label: '그리드', value: 'grid', icon: 'i-px2-grid', checked: node.attrs.layout === 'grid' },
            {
              label: '슬라이드',
              value: 'slide',
              icon: 'i-px2-content-slideshow',
              checked: node.attrs.layout === 'slide',
            },
            { label: '스크롤', value: 'scroll', icon: 'i-px2-content-scroll', checked: node.attrs.layout === 'scroll' },
          ]}
          size="sm"
          on:change={(v) => updateAttributes({ layout: v.detail })}
        />
      </div>

      {#if node.attrs.layout === 'grid'}
        <div>
          <p class="text-13-m mb-2.5">열</p>

          <RadioGroup
            name="column"
            class="border-b border-gray-100 pb-4 gap-2!"
            items={[
              {
                label: '2열',
                value: 2,
                icon: 'i-px2-grid-2-column',
                checked: node.attrs.gridColumns === 2,
              },
              { label: '3열', value: 3, icon: 'i-px2-grid-3-column', checked: node.attrs.gridColumns === 3 },
            ]}
            size="sm"
            variant="list"
            on:change={(v) => updateAttributes({ gridColumns: v.detail })}
          />
        </div>
      {/if}

      {#if node.attrs.layout === 'slide'}
        <div>
          <p class="text-13-m mb-2.5">보기</p>

          <RadioGroup
            name="view"
            class="border-b border-gray-100 pb-4 gap-2!"
            items={[
              {
                label: '한 쪽 보기',
                value: 1,
                icon: 'i-px2-book-single-page',
                checked: node.attrs.slidesPerPage === 1,
              },
              { label: '두 쪽 보기', value: 2, icon: 'i-px2-book-both-page', checked: node.attrs.slidesPerPage === 2 },
            ]}
            size="sm"
            variant="list"
            on:change={(v) => updateAttributes({ slidesPerPage: v.detail })}
          />
        </div>
      {/if}

      {#if node.attrs.layout !== 'standalone'}
        <div>
          <p class="text-13-m mb-2.5">간격 설정</p>

          <Switch
            name="space"
            checked={node.attrs.spacing}
            on:change={() => updateAttributes({ spacing: !node.attrs.spacing })}
          />
        </div>
      {/if}
    </div>
  </div>

  <svelte:fragment slot="action">
    <button
      class="px-4 py-2.5 text-15-sb rounded bg-gray-950 text-white w-95px text-center border border-gray-950"
      type="button"
      on:click={handleInsert}
    >
      삽입
    </button>
  </svelte:fragment>
</Modal>

<Modal bind:open={imageListOpen}>
  <svelte:fragment slot="title">
    <button class="mr-1" type="button" on:click={() => (imageListOpen = false)}>
      <i class="i-tb-chevron-left block square-6" />
    </button>
    전체목록
    <Tooltip
      class="flex center ml-1"
      message="원하는 순서에 이미지를 드래그해서 놓으면 순서를 변경할 수 있어요"
      offset={10}
      placement="bottom-start"
    >
      <i class="i-tb-alert-circle square-3.5 text-gray-400" />
    </Tooltip>
  </svelte:fragment>

  <div>
    <div class="pt-5 px-6 flex items-center justify-between">
      <div class="flex">
        <Checkbox
          class="text-14-r gap-2 after:(content-[''] block h-3 w-1px bg-gray-200 ml-1)"
          checked={allSelected}
          disabled={node.attrs.__data.length === 0}
          on:change={() => {
            // @ts-expect-error any
            selectedImages = allSelected ? [] : node.attrs.__data.map((i) => i.id);
          }}
        >
          전체선택
        </Checkbox>
        <button class="text-14-r text-error-900 px-3" type="button" on:click={() => removeImages(selectedImages)}>
          삭제
        </button>
      </div>

      <div>
        <button
          class="p-1 rounded aria-pressed:bg-gray-200"
          aria-pressed={view === 'grid'}
          type="button"
          on:click={() => (view = 'grid')}
        >
          <i class="i-tb-layout-grid block square-5 text-gray-400" />
        </button>

        <button
          class="p-1 rounded aria-pressed:bg-gray-200"
          aria-pressed={view === 'list'}
          type="button"
          on:click={() => (view = 'list')}
        >
          <i class="i-tb-list block square-5 text-gray-400" />
        </button>
      </div>
    </div>

    <div
      bind:this={sortableGallery}
      class={clsx(
        'flex flex-wrap gap-2 content-start px-6 py-2.5 h-460px overflow-y-auto',
        view === 'list' && 'gap-2.5',
      )}
    >
      {#each node.attrs.__data as image, index (image.id)}
        {#if view === 'grid'}
          <button
            class="relative p-1.5 flex flex-col flex-none gap-1.5 h-127px rounded hover:bg-gray-100 aria-pressed:(ring-1.5 ring-teal-500 bg-teal-50!) image"
            aria-pressed={selectedImages.includes(image.id)}
            data-id={image.id}
            type="button"
            on:click={() => {
              selectedImages = selectedImages.includes(image.id)
                ? selectedImages.filter((id) => id !== image.id)
                : [...selectedImages, image.id];
            }}
          >
            <IsomorphicImage class="square-23 rounded-0.3125rem object-cover" {image} />

            <p class="text-12-r text-gray-400 text-center w-full">{index + 1}</p>

            {#if index === 0}
              <div id={onboardingAnchorLastDynamicId} class="absolute inset-0 z--1" />
            {/if}
          </button>
        {:else}
          <button
            class="relative py-2.5 px-6 rounded border border-gray-200 bg-white flex items-center w-full h-68px aria-pressed:(ring-1.5 ring-teal-500 bg-teal-50!) image"
            aria-pressed={selectedImages.includes(image.id)}
            data-id={image.id}
            type="button"
            on:click={() => {
              selectedImages = selectedImages.includes(image.id)
                ? selectedImages.filter((id) => id !== image.id)
                : [...selectedImages, image.id];
            }}
          >
            <span class="text-14-r text-gray-400 w-26px mr-3 text-center">{index + 1}</span>
            <IsomorphicImage class="square-12 rounded-md object-cover mr-4" {image} />
            <p class="grow text-14-r">{image.kind === 'data' ? image.__data.name : image.__file.name}</p>

            <button class="p-1 mr-2" type="button" on:click={() => removeImage(image.id)}>
              <i class="i-tb-trash block square-6 text-gray-600" />
            </button>

            <button class="p-1" type="button">
              <i class="i-tb-grip-vertical block square-6 text-gray-600" />
            </button>
            {#if index === 0}
              <div id={onboardingAnchorLastDynamicId} class="absolute inset-0 z--1" />
            {/if}
          </button>
        {/if}
      {/each}
      {#if view === 'grid'}
        <button class="p-1.5 flex flex-col gap-1.5 rounded h-127px" type="button" on:click={handleInsertImage}>
          <div class="bg-gray-100 square-23 rounded-0.3125rem flex center">
            <i class="i-tb-plus block square-5 text-gray-400 stroke-2" />
          </div>

          <p class="text-12-r text-gray-400 text-center w-full">이미지 추가</p>
        </button>
      {:else}
        <button
          class="py-6 px-5 rounded border border-gray-200 flex items-center w-full text-gray-400 bg-gray-100 h-68px"
          type="button"
          on:click={handleInsertImage}
        >
          <i class="i-tb-plus block square-5 mr-1" />
          <span class="text-14-m">이미지 추가</span>
        </button>
      {/if}
    </div>
  </div>

  <svelte:fragment slot="action">
    {#if selectedImages.length > 0}
      <p class="text-14-r grow">
        이미지 {selectedImageName}
        {#if selectedImages.length > 1}
          외 <mark class="text-teal-500">{selectedImages.length - 1}개</mark>
        {/if}
        선택됨
      </p>
    {/if}

    <button
      class="px-4 py-2.5 text-15-sb rounded w-95px text-center border border-gray-200"
      type="button"
      on:click={() => {
        imageListOpen = false;
      }}
    >
      확인
    </button>
  </svelte:fragment>
</Modal>
