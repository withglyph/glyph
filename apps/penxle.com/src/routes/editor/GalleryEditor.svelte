<script lang="ts">
  import clsx from 'clsx';
  import ky from 'ky';
  import * as R from 'radash';
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import Cutting from '$assets/icons/cutting.svg?component';
  import { graphql } from '$glitch';
  import { Button, Image } from '$lib/components';
  import { ThumbnailPicker } from '$lib/components/media';
  import { portal } from '$lib/svelte/actions';
  import { trackable } from '$lib/svelte/store';
  import { isValidImageFile, validImageMimes } from '$lib/utils';
  import type { Sortable } from '@shopify/draggable';
  import type { JSONContent } from '@tiptap/core';
  import type { FragmentType, Image_image } from '$glitch';
  import type { Nullable } from '$lib/types';
  import type { ImageBounds } from '$lib/utils';

  type Image = {
    type: 'image';
    attrs: {
      id: string;
      __data: FragmentType<Image_image>;
    };
  };

  export let thumbnailBounds: ImageBounds | undefined = undefined;
  export let thumbnailId: string | undefined = undefined;
  export let content: JSONContent | undefined;

  let thumbnailPicker: ThumbnailPicker;
  let previewOpen = false;
  let preview: Image_image | null = null;
  let changeIndex = -1;
  let price = 0;
  let description: JSONContent | undefined = undefined;

  const prepareImageUpload = graphql(`
    mutation Editor_PrepareImageUpload_Mutation {
      prepareImageUpload {
        key
        presignedUrl
      }
    }
  `);

  const finalizeImageUpload = graphql(`
    mutation Editor_FinalizeImageUpload_Mutation($input: FinalizeImageUploadInput!) {
      finalizeImageUpload(input: $input) {
        id
        ...Image_image
      }
    }
  `);

  const uploading = trackable();
  let fileEl: HTMLInputElement;
  const dispatch = createEventDispatcher<{ change: { id: string } }>();

  $: if (content?.content) {
    description = content.content.find((c) => c.type === 'paragraph');
    const contents = content.content.filter((c) => c.type === 'image' || c.type === 'access_barrier');

    content.content = description ? [description, ...contents] : contents;

    if (!thumbnailId) {
      const thumbnail = content.content.find((c) => c.type === 'image')?.attrs?.__data;

      if (thumbnail) {
        thumbnailId = thumbnail.id;
        thumbnailBounds = {
          left: 0,
          top: 0,
          width: thumbnail.width,
          height: thumbnail.height,

          translateX: 0,
          translateY: 0,
          scale: 1,
        };
      }
    }

    price = content.content.find((c) => c.type === 'access_barrier')?.attrs?.price ?? 0;
  }

  const addFiles = async (newFiles: Nullable<FileList>) => {
    if (!newFiles) {
      return;
    }

    const validFiles: Image[] = [];

    for (const file of newFiles) {
      if (await isValidImageFile(file)) {
        await uploading.track(async () => {
          const { key, presignedUrl } = await prepareImageUpload();

          await ky.put(presignedUrl, { body: file });
          const resp = await finalizeImageUpload({ key, name: file.name });

          validFiles.push({
            type: 'image',
            attrs: {
              id: resp.id,
              __data: resp as FragmentType<Image_image>,
            },
          });
          dispatch('change', resp);
        });
      }
    }

    if (content?.content) {
      if (changeIndex !== -1) {
        content.content[changeIndex] = validFiles[0];
        changeIndex = -1;
        fileEl.multiple = true;
        return;
      }

      content.content = [...content.content, ...validFiles];
    } else {
      content = {
        type: 'document',
        content: validFiles,
      };

      thumbnailId = validFiles[0].attrs.__data.id;
      thumbnailBounds = {
        left: 0,
        top: 0,
        width: validFiles[0].attrs.__data.width,
        height: validFiles[0].attrs.__data.height,

        translateX: 0,
        translateY: 0,
        scale: 1,
      };
    }
  };

  $: accessBarrierIndex = content?.content?.findIndex((c) => c.type === 'access_barrier') ?? -1;

  const handlePriceChange = (e: Event) => {
    const newPrice = Number((e.currentTarget as HTMLInputElement).value);
    if (Number.isNaN(newPrice)) {
      return;
    }

    if (content?.content) {
      content.content = R.replace(
        content?.content,
        {
          type: 'access_barrier',
          attrs: {
            price: newPrice,
            __data: null,
          },
        },
        (c) => c.type === 'access_barrier',
      );
    }
  };

  let sortable: Sortable;

  onMount(async () => {
    const { Sortable, Plugins } = await import('@shopify/draggable');

    sortable = new Sortable(document.querySelectorAll('.gallery'), {
      draggable: '.item',
      delay: 100,
      sortAnimation: {
        duration: 300,
        easingFunction: 'ease-in-out',
      },
      plugins: [Plugins.SortAnimation],
    });

    sortable.on('sortable:stop', ({ newIndex, oldIndex }) => {
      let newIdx = newIndex;
      let oldIdx = oldIndex;

      if (content?.content) {
        if (description) {
          oldIdx += 1;
          newIdx += 1;
        }
        const draggedItem = content.content[oldIdx];
        if (oldIdx > newIdx) {
          content.content = [
            ...content.content.slice(0, newIdx),
            draggedItem,
            ...content.content.slice(newIdx, oldIdx),
            ...content.content.slice(oldIdx + 1),
          ];
        } else {
          content.content = [
            ...content.content.slice(0, oldIdx),
            ...content.content.slice(oldIdx + 1, newIdx + 1),
            draggedItem,
            ...content.content.slice(newIdx + 1),
          ];
        }
      }
    });
  });

  onDestroy(() => {
    if (sortable) {
      sortable.destroy();
    }
  });
</script>

<div
  class={clsx(
    'mt-8 mb-100px mx-auto w-full flex flex-col max-w-225 grow',
    (!content?.content ||
      content?.content.length === 0 ||
      (content?.content.length === 1 && content?.content[0].type === 'paragraph')) &&
      'bg-primary',
  )}
>
  <input
    bind:this={fileEl}
    class="hidden"
    accept={validImageMimes.join(',')}
    multiple
    type="file"
    on:change={async ({ currentTarget }) => {
      await addFiles(currentTarget.files);
      fileEl.value = '';
    }}
  />

  {#if !content?.content || content?.content.length === 0 || (content?.content.length === 1 && content?.content[0].type === 'paragraph')}
    <div class="w-full flex flex-col center grow space-y-2.5">
      <p class="body-16-eb">이미지를 드래그하거나 업로드 해주세요</p>
      <p class="body-14-m text-secondary">최대 50장까지 업로드 할 수 있어요 (장 당 100MB)</p>

      <Button size="md" on:click={() => fileEl.showPicker()}>이미지 업로드</Button>
    </div>
  {/if}

  <div class="flex flex-wrap gap-2 gallery">
    {#if content?.content}
      {#each content.content as node, idx (node.attrs?.id ?? node.type)}
        {#if node.type === 'image'}
          <div class="relative w-fit item">
            <div class="relative square-54.5 [&>div]:hover:flex! cursor-grab">
              <Image class="square-full rounded-lg" $image={node.attrs?.__data} />

              <div class="absolute top-0 left-0 square-54.5 rounded-2.5 hidden flex-col center gap-2 bg-alphagray-15">
                <button
                  class="h-9 w-33.5 body-14-b text-center bg-alphagray-50 rounded-2.5 text-darkprimary"
                  type="button"
                  on:click={() => {
                    fileEl.multiple = false;
                    fileEl.showPicker();
                    changeIndex = idx;
                  }}
                >
                  이미지 변경
                </button>
                <button
                  class="h-9 w-33.5 body-14-b text-center bg-alphagray-50 rounded-2.5 text-darkprimary"
                  type="button"
                  on:click={() => {
                    previewOpen = true;
                    preview = node.attrs?.__data;
                  }}
                >
                  미리보기
                </button>
                {#if accessBarrierIndex === -1 || accessBarrierIndex > idx}
                  <button
                    class="h-9 w-33.5 body-14-b text-center bg-alphagray-50 rounded-2.5 text-darkprimary"
                    type="button"
                    on:click={() => {
                      thumbnailId = node.attrs?.__data.id;

                      // Hack: node.attrs.__data 내 url 프로퍼티를 타입 안전하게 참조하기 위해 타입 가드를 추가했습니다.
                      if (
                        !node.attrs ||
                        !('__data' in node.attrs) ||
                        !('url' in node.attrs.__data) ||
                        typeof node.attrs.__data.url !== 'string'
                      )
                        throw new Error('node.attrs.__data 내 url 프로퍼티 참조에 실패했어요');

                      thumbnailPicker.show(node.attrs.__data.url);
                    }}
                  >
                    대표사진 설정
                  </button>
                {/if}
              </div>
            </div>

            <span
              class="bg-alphagray-80 rounded-full square-7.5 absolute top-1 left-1 text-white body-14-b flex center pointer-events-none select-none"
            >
              {#if description}
                {accessBarrierIndex !== -1 && accessBarrierIndex < idx ? idx - 1 : idx}
              {:else}
                {accessBarrierIndex !== -1 && accessBarrierIndex < idx ? idx : idx + 1}
              {/if}
            </span>

            <button
              class="absolute top-2 right-2 flex center bg-alphagray-60 rounded-lg square-6"
              type="button"
              on:click={() => {
                if (content?.content) {
                  content.content =
                    content.content.length === 1 ? undefined : content.content.filter((c) => c !== node);
                }
              }}
            >
              <i class="i-lc-x text-white square-3.5" />
            </button>

            {#if thumbnailId === node.attrs?.__data.id}
              <div
                class="absolute bottom-2 right-4 flex items-center justify-between gap-1 bg-alphagray-60 rounded-lg px-2.5 h-6 pointer-events-none"
              >
                <span class="text-white body-13-b whitespace-pre-line">대표</span>
                <Cutting class="square-4" />
              </div>
            {/if}

            {#if accessBarrierIndex !== -1 && accessBarrierIndex < idx}
              <div class="absolute bottom-2 left-0 px-2 w-full">
                <p class="bg-alphagray-50 px-2.5 h-6 flex center text-center rounded-full w-full body-13-b text-gray-5">
                  유료 이미지
                </p>
              </div>
            {/if}
          </div>
        {:else if node.type === 'access_barrier'}
          <div
            class="square-54.5 flex flex-col justify-center bg-cardprimary border border-secondary rounded-lg p-4 relative cursor-grab select-none item"
          >
            <i class="i-lc-circle-dollar-sign square-6" />
            <p class="body-16-b mt-3 mb-1">결제 상자</p>
            <p class="body-13-m text-secondary break-keep">
              결제 상자를 옮기면 이후 분량부터 결제를 통해 감상할 수 있어요
            </p>

            <div class="bg-primary rounded-lg flex items-center justify-between py-2 px-4 mt-4 gap-2">
              <input
                class="body-16-b flex-1 min-w-0"
                inputmode="numeric"
                type="text"
                value={price}
                on:input={handlePriceChange}
              />
              <span class="text-disabled">포인트</span>
            </div>

            {#if description}
              {#if accessBarrierIndex === content.content.length - 1 || accessBarrierIndex === 1}
                <p class="mt-3 body-13-m text-red-50">이 위치에서는 사용할 수 없어요</p>
              {/if}
            {:else if accessBarrierIndex === content.content.length - 1 || accessBarrierIndex === 0}
              <p class="mt-3 body-13-m text-red-50">이 위치에서는 사용할 수 없어요</p>
            {/if}

            <button
              class="absolute top-2 right-2 flex center bg-alphagray-60 rounded-lg square-6"
              type="button"
              on:click={() => {
                if (content?.content) content.content = content.content.filter((c) => c.type !== 'access_barrier');
              }}
            >
              <i class="i-lc-x text-white square-3.5" />
            </button>
          </div>
        {/if}
      {/each}
    {/if}

    {#if content?.content?.some(({ type }) => type === 'image')}
      <button class="square-54.5 flex center bg-primary" type="button" on:click={() => fileEl.showPicker()}>
        <i class="i-lc-plus square-6 text-secondary" />
      </button>

      {#if !content?.content?.some((c) => c.type === 'access_barrier')}
        <div class="square-54.5 flex flex-col justify-center bg-cardprimary border border-secondary rounded-lg p-4">
          <i class="i-lc-circle-dollar-sign square-6" />
          <p class="body-16-b mt-3 mb-1">결제 상자</p>
          <p class="body-13-m text-secondary break-keep">결제상자를 추가해 유료분량을 만들어 보세요</p>
          <Button
            class="mt-4 w-fit"
            size="md"
            on:click={() => {
              if (content?.content) {
                content.content = [
                  ...content.content,
                  {
                    type: 'access_barrier',
                    attrs: {
                      price: 0,
                      __data: null,
                    },
                  },
                ];
              }
            }}
          >
            결제상자 추가
          </Button>
        </div>
      {/if}
    {/if}
  </div>
</div>

{#if previewOpen && preview}
  <div class="fixed inset-0 z-50" use:portal>
    <div
      class="absolute inset-0 bg-black/50 backdrop-blur"
      role="button"
      tabindex="-1"
      on:click={() => {
        previewOpen = false;
        preview = null;
      }}
      on:keypress={null}
    />

    <div class="pointer-events-none absolute inset-0 flex center">
      <div
        class="pointer-events-auto contents flex center"
        role="button"
        tabindex="-1"
        on:click={() => {
          previewOpen = false;
          preview = null;
        }}
        on:keypress={null}
      >
        <Image class="max-w-80% max-h-80%" $image={preview} intrinsic />
      </div>
    </div>
  </div>
{/if}

<ThumbnailPicker bind:this={thumbnailPicker} bind:bounds={thumbnailBounds}>
  <svelte:fragment slot="title">대표 이미지 설정</svelte:fragment>
  <svelte:fragment slot="save">자르기</svelte:fragment>
</ThumbnailPicker>
