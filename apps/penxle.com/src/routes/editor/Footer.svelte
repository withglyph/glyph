<script lang="ts">
  import clsx from 'clsx';
  import { Badge, Image, Tag } from '$lib/components';
  import { ThumbnailPicker } from '$lib/components/media';
  import type { Writable } from '@svelte-kits/store';
  import type { JSONContent } from '@tiptap/core';
  import type { KeyboardEventHandler } from 'svelte/elements';
  import type { Image_image, PostRevisionContentKind } from '$glitch';
  import type { ImageBounds } from '$lib/utils';

  export let autoSaveCount: Writable<number>;
  export let tags: string[] = [];
  export let kind: PostRevisionContentKind;
  export let content: JSONContent;

  export let thumbnailBounds: ImageBounds | undefined;
  export let thumbnailId: string | undefined;

  let open = false;

  const createParagraph = (text: string) => {
    return {
      type: 'paragraph',
      attrs: {
        'text-align': null,
        'font-family': 'sans',
        'line-height': 'normal',
        'letter-spacing': 'normal',
      },
      content: [
        {
          type: 'text',
          text,
        },
      ],
    };
  };

  const handleTagInputChange: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key !== ' ' && e.key !== 'Spacebar' && e.key !== 'Enter') return;

    const { value } = e.currentTarget;

    if (tags.includes(value)) return;
    const escapedValue = value.trim().replaceAll(' ', '_');

    if (escapedValue.length === 0) return;

    if (e.isComposing === false) {
      tags.push(escapedValue);
      tags = tags;
      e.currentTarget.value = '';
    }

    $autoSaveCount += 1;
  };

  const handleImageCaptionInputChange = (e: Event) => {
    const { value } = e.target as HTMLInputElement;

    if (!content) {
      content = {
        type: 'document',
        content: [createParagraph(value)],
      };
    } else if (content.content) {
      if (content.content?.[0]?.type === 'paragraph') {
        content.content[0] = createParagraph(value);
      } else {
        content.content.unshift(createParagraph(value));
      }

      if (value === '') {
        content.content.shift();
      }
    }

    $autoSaveCount += 1;
  };

  let imageAttrs: { id: string; __data: Image_image }[] = [];

  $: if (content?.content) {
    imageAttrs = content.content
      .filter(({ type, attrs }) => type === 'image' && attrs?.id)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map(({ attrs }) => (attrs as NonNullable<typeof imageAttrs>[number])!);
  }

  $: if (thumbnailId === undefined) {
    thumbnailBounds = undefined;
  }

  let thumbnailPicker: ThumbnailPicker;

  let containerEl: HTMLElement | undefined;
  let containerElHeight: number | null = null;

  let thumbnailMenu: HTMLElement | undefined;
  let captionInput: HTMLElement | undefined;

  $: if (kind === 'ARTICLE') {
    captionInput = undefined;
  } else {
    thumbnailMenu = undefined;
  }

  $: if (tags && (thumbnailMenu || captionInput) && containerEl) {
    containerElHeight = containerEl.getBoundingClientRect().height;
  }

  const tagFirstLineHeight = 54;
</script>

<footer
  id="footer"
  style={typeof containerElHeight === 'number' ? `--height: ${-1 * containerElHeight + tagFirstLineHeight}px` : null}
  class="fixed w-full z-1 bottom-[var(--height,100%)] transition-transform-250 motion-reduce:transition-none motion-reduce:hover:transform-none data-[expanded=true]:translate-y-[var(--height)] <sm:hidden"
  data-expanded={open}
>
  <button
    class="w-16 h-7.5 absolute top--7.5 rounded-1.5 left-50% translate-x-50% rounded-b-none flex center bg-white shadow-[0px_-5px_16px_-8px_rgba(0,0,0,0.15)]"
    aria-controls="footer"
    aria-expanded={open}
    type="button"
    on:click={() => (open = !open)}
  >
    <i class={clsx('i-lc-chevron-down square-4 text-secondary', !open && 'rotate-180')} />
  </button>
  <div bind:this={containerEl} class="w-full bg-white shadow-[0_4px_16px_0px_rgba(0,0,0,0.15)]">
    <article class="m-x-auto max-w-300 px-4 p-b-4">
      <section class="flex items-center gap-4 flex-wrap pt-3 pb-4">
        <span class="body-13-b">게시글 태그</span>

        {#each tags as tag (tag)}
          <Tag class="gap-2 pointer-events-none" size="sm">
            {tag}
            <button
              class="i-lc-trash pointer-events-auto"
              type="button"
              on:click={() => (tags = tags.filter((t) => t !== tag))}
            />
          </Tag>
        {/each}

        <label class="flex items-center px-3 bg-primary rounded-8 body-13-b before:(content-['#'] mr-1)">
          <input
            class="body-13-b h-6.5"
            maxlength={50}
            placeholder="게시글에 추가될 태그를 입력하세요"
            type="text"
            on:keydown={handleTagInputChange}
          />
        </label>
      </section>

      <section class="w-full flex items-center gap-4 flex-wrap bg-primary p-4">
        {#if kind === 'ARTICLE'}
          <fieldset bind:this={thumbnailMenu} class="p-x-4 p-y-4 w-full flex gap-2xl items-center flex-wrap bg-primary">
            <legend class="sr-only">썸네일 설정</legend>

            <button
              class="square-5.3125rem rounded-1rem p-1rem border-(primary 0.0625rem) bg-surface-primary aria-pressed:bg-surface-secondary"
              aria-pressed={!thumbnailId}
              type="button"
              on:click={() => {
                thumbnailId = undefined;
              }}
            >
              <svg viewBox="0 0 62 62" xmlns="http://www.w3.org/2000/svg">
                <title>썸네일 선택 안함 아이콘</title>
                <path d="M1 1.25024L60.5 60.7502" stroke="#A8A29E" stroke-width="2" />
                <path d="M60.5 1.25024L0.999997 60.7502" stroke="#A8A29E" stroke-width="2" />
              </svg>
            </button>

            {#if imageAttrs}
              {#each imageAttrs as imageAttr (imageAttr.id)}
                <button
                  class="relative overflow-hidden rounded-1rem aria-pressed:(ring-3 ring-green-50) group"
                  aria-pressed={imageAttr.id === thumbnailId}
                  data-value={imageAttr.id}
                  type="button"
                  on:click={() => {
                    thumbnailId = imageAttr.id;

                    // Hack: imageAttr.__data 내 url 프로퍼티를 타입 안전하게 참조하기 위해 타입 가드를 추가했습니다.
                    if (!('url' in imageAttr.__data) || typeof imageAttr.__data.url !== 'string')
                      throw new Error('imageAttr.__data 내 url 프로퍼티 참조에 실패했어요');

                    thumbnailPicker.show(imageAttr.__data.url);
                  }}
                >
                  <Image class="square-5.3125rem" $image={imageAttr.__data} />
                  <Badge
                    class="absolute group-[[aria-pressed='true']]:visible invisible bottom-0.63rem right-0.5rem rounded-3.13rem"
                  >
                    대표
                  </Badge>
                </button>
              {/each}
            {/if}
          </fieldset>
        {:else}
          <input
            bind:this={captionInput}
            class="body-13-b resize-none w-full"
            placeholder="내용을 입력하세요"
            type="text"
            on:input={handleImageCaptionInputChange}
          />
        {/if}
      </section>
    </article>
  </div>
</footer>

<ThumbnailPicker bind:this={thumbnailPicker} bind:bounds={thumbnailBounds}>
  <svelte:fragment slot="title">대표 이미지 설정</svelte:fragment>
  <svelte:fragment slot="save">
    <button type="button" on:click={() => ($autoSaveCount += 1)}>자르기</button>
  </svelte:fragment>
</ThumbnailPicker>
