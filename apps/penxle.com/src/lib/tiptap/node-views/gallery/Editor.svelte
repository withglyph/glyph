<script lang="ts">
  import clsx from 'clsx';
  import { onMount } from 'svelte';
  import { register } from 'swiper/element/bundle';
  import { Tooltip } from '$lib/components';
  import { Checkbox, Switch } from '$lib/components/forms';
  import FileImage from '$lib/tiptap/node-views/image/FileImage.svelte';
  import { isValidImageFile, validImageMimes } from '$lib/utils';
  import Modal from './Modal.svelte';
  import RadioGroup from './RadioGroup.svelte';
  import type { SwiperContainer, SwiperSlide } from 'swiper/element-bundle';
  import type { NodeViewProps } from '$lib/tiptap';

  export let open = false;

  export let node: NodeViewProps['node'];
  export let updateAttributes: NodeViewProps['updateAttributes'];

  let imageListOpen = false;

  let images: File[] = [];

  let view: 'grid' | 'list' = 'grid';

  let swiperEl: SwiperContainer;
  let swiperSlideEl: SwiperSlide;
  let swiperNextElem: HTMLElement | undefined;
  let swiperPrevElem: HTMLElement | undefined;
  let swiperPaginationElem: HTMLElement | undefined;

  register();

  onMount(() => {
    if (swiperEl != undefined) {
      const swiperParams = {
        navigation: {
          nextEl: swiperNextElem,
          prevEl: swiperPrevElem,
        },
        pagination: {
          el: swiperPaginationElem,
          type: 'bullets',
        },
        slidesPerView: 1,
        slidesPerGroupSkip: 1,
        grabCursor: true,
      };
      Object.assign(swiperEl, swiperParams);
      swiperEl.initialize();
      swiperEl.swiper.update();
    }
  });

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

      for (const file of files) {
        if (!isValidImageFile(file)) {
          continue;
        }

        images = [...images, file];
      }
    });

    picker.showPicker();
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
    <div class="grow flex flex-col">
      <div class={clsx('grow flex flex-col items-center overflow-y-auto py-6')}>
        <div
          class={clsx(
            'grow flex flex-col items-center w-100 mx-auto',
            images.length <= 1 && 'justify-center',
            node.attrs.layout === 'standalone' && 'gap-6',
            node.attrs.layout === 'grid' && node.attrs.gridColumns === 2 && 'grid! grid-cols-2',
            node.attrs.layout === 'grid' && node.attrs.gridColumns === 3 && 'grid-cols-3',
            node.attrs.spacing && 'gap-1.5',
          )}
        >
          <!-- <swiper-container bind:this={swiperEl} class="w-100"> -->
          {#each images as image (image)}
            {#if node.attrs.layout === 'slide'}
              <swiper-slide bind:this={swiperSlideEl}>
                <FileImage class="object-cover" file={image} />
              </swiper-slide>
            {:else}
              <div class="relative square-full">
                <FileImage class="square-full object-cover" file={image} />
                <button
                  class="square-6.5 bg-#09090B66 rounded-sm flex center absolute bottom-3.5 right-3.5"
                  type="button"
                  on:click={() => {
                    images = images.filter((i) => i !== image);
                  }}
                >
                  <i class="i-tb-trash square-4.5 text-white" />
                </button>
              </div>
            {/if}
          {:else}
            <button
              class="border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 w-100 h-75 flex flex-col center gap-2.5"
              type="button"
              on:click={handleInsertImage}
            >
              <i class="i-tb-photo-up square-8" />
              <p class="text-13-m">이미지를 업로드해주세요</p>
            </button>
          {/each}
          <!-- </swiper-container> -->
        </div>
      </div>

      <div class="h-104px border-t border-gray-200 flex px-6 relative">
        <button
          class="px-2 py-1.5 text-gray-400 border border-gray-200 rounded-t bg-white absolute -top-30px right-16px leading-0"
          type="button"
          on:click={() => {
            imageListOpen = true;
          }}
        >
          <i class="i-tb-layout-grid square-4" />
          <span class="text-11-sb ml-1.5">전체 목록</span>
        </button>

        <ul class="flex grow gap-1 overflow-x-auto overflow-y-hidden py-3.5 px-2.5 images">
          {#each images as image, index (image)}
            <li class="flex-none">
              <button
                class="relative p-1 flex flex-col gap-1 flex-none rounded hover:bg-gray-100 aria-pressed:(ring-1.5 ring-teal-500 bg-teal-50!) aria-pressed:[&>div]:block"
                aria-pressed={false}
                type="button"
              >
                <FileImage class="square-12 rounded-0.1875rem object-cover" file={image} />
                <div class="absolute left-1 top-1 bg-black/30 square-12 rounded-0.1875rem flex center hidden">
                  <i class="i-tb-trash square-4.5 text-white" />
                </div>

                <p class="text-10-r text-gray-400 text-center w-full">{index + 1}</p>
              </button>
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
      on:click={() => {
        images = [];
      }}
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
        <Checkbox class="text-14-r gap-2 after:(content-[''] block h-3 w-1px bg-gray-200 ml-1)">전체선택</Checkbox>
        <button class="text-14-r text-error-900 px-3" type="button">삭제</button>
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
      class={clsx(
        'flex flex-wrap gap-2 content-start px-6 py-2.5 h-460px overflow-y-auto',
        view === 'list' && 'gap-2.5',
      )}
    >
      {#each images as image, index (image)}
        {#if view === 'grid'}
          <button
            class="p-1.5 flex flex-col flex-none gap-1.5 h-127px rounded hover:bg-gray-100 aria-pressed:(ring-1.5 ring-teal-500 bg-teal-50!)"
            aria-pressed={true}
            type="button"
          >
            <FileImage class="square-23 rounded-0.3125rem object-cover" file={image} />

            <p class="text-12-r text-gray-400 text-center w-full">{index + 1}</p>
          </button>
        {:else}
          <button class="py-2.5 px-6 rounded border border-gray-200 flex items-center w-full h-68px" type="button">
            <span class="text-14-r text-gray-400 w-26px mr-3 text-center">{index + 1}</span>
            <FileImage class="square-12 rounded-md object-cover mr-4" file={image} />
            <p class="grow text-14-r">{image.name}</p>

            <button class="p-1 mr-2" type="button">
              <i class="i-tb-trash block square-6 text-gray-600" />
            </button>

            <button class="p-1" type="button">
              <i class="i-tb-grip-vertical block square-6 text-gray-600" />
            </button>
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
    <button
      class="px-4 py-2.5 text-15-sb rounded w-95px text-center border border-gray-200"
      type="button"
      on:click={() => (imageListOpen = false)}
    >
      확인
    </button>
  </svelte:fragment>
</Modal>
