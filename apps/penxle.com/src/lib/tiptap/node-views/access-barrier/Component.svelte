<script lang="ts">
  import { validator } from '@felte/validator-zod';
  import { offset } from '@floating-ui/dom';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { createForm } from 'felte';
  import { tick } from 'svelte';
  import { z } from 'zod';
  import { afterNavigate } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Modal } from '$lib/components';
  import Button from '$lib/components/Button.svelte';
  import { portal } from '$lib/svelte/actions';
  import { createFloatingActions } from '$lib/svelte-floating-ui';
  import { NodeView } from '$lib/tiptap';
  import { calcurateReadingTime, comma } from '$lib/utils';
  import LoginRequireModal from '../../../../routes/(default)/LoginRequireModal.svelte';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let getPos: NodeViewProps['getPos'];
  export let selected: NodeViewProps['selected'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let updateAttributes: NodeViewProps['updateAttributes'];

  $: isLastChild = editor?.state.doc.lastChild?.eq(node) ?? false;
  $: setInitialValues({ price: node.attrs.price ?? 0 });

  let priceOpen = false;
  let loginRequireOpen = false;
  let postPurchaseOpen = false;
  let pointPurchaseOpen = false;

  let priceInputEl: HTMLInputElement | undefined;

  const purchasePost = graphql(`
    mutation TiptapAccessBarrier_PurchasePost_Mutation($input: PurchasePostInput!) {
      purchasePost(input: $input) {
        id

        publishedRevision {
          id
          content
        }
      }
    }
  `);

  const [floatingRef, floatingContent, update] = createFloatingActions({
    strategy: 'absolute',
    placement: 'bottom',
    middleware: [offset(8)],
  });

  const { form, errors, data, setFields, setInitialValues } = createForm({
    initialValues: { price: 0 },
    extend: [
      validator({
        schema: z.object({
          price: z.number().int().min(100).max(1_000_000).multipleOf(100),
        }),
      }),
    ],
    onSubmit: (values) => {
      updateAttributes({ price: values.price });
      priceOpen = false;
    },
  });

  $: if (priceOpen) {
    // eslint-disable-next-line unicorn/prefer-top-level-await
    void tick().then(() => {
      update();
      priceInputEl?.focus();
    });
  }

  afterNavigate(() => {
    priceOpen = false;
  });
</script>

{#if editor?.isEditable}
  <NodeView
    class={clsx('flex justify-end relative py-8px rounded-6px pointer-events-auto', selected && 'ring-2 ring-teal-500')}
    data-drag-handle
    draggable
  >
    <div class="absolute inset-0 flex center">
      <div class="line w-full h-1.5px text-gray-300"></div>
    </div>

    <div
      class="relative rounded-6px p-8px border border-gray-200 flex gap-8px center w-fit mr-20px bg-white text-gray-600 shadow-[0_2px_10px_0] shadow-black/4"
    >
      {#if isLastChild}
        <button
          class="text-14px font-medium px-6px py-4px rounded-4px transition hover:bg-gray-100"
          type="button"
          on:click={() =>
            editor
              ?.chain()
              .insertContentAt(getPos() + node.nodeSize, { type: 'paragraph' })
              .focus()
              .run()}
        >
          여기서부터 유료 분량 만들기
        </button>
      {:else}
        <div class="text-14px font-medium px-6px py-4px">여기서부터 유료 분량</div>
        <div class="w-1px h-14px bg-gray-200" />
        <button
          class={clsx(
            'flex center gap-4px text-14-m px-6px py-4px rounded-4px transition hover:bg-gray-100',
            priceOpen && 'bg-gray-100',
            node.attrs.price ? 'text-teal-600' : 'text-error-900',
          )}
          type="button"
          on:click={() => (priceOpen = true)}
          use:floatingRef
        >
          {#if node.attrs.price}
            {comma(node.attrs.price)} P
          {:else}
            <i class="i-tb-alert-triangle square-16px" />
            가격설정
          {/if}
        </button>
        <div class="w-1px h-14px bg-gray-200" />
        <button
          class="text-14px font-medium px-6px py-4px rounded-4px transition hover:bg-gray-100"
          type="button"
          on:click={() =>
            editor
              ?.chain()
              .cut({ from: getPos(), to: getPos() + node.nodeSize }, editor.state.doc.content.size)
              .run()}
        >
          해제
        </button>
      {/if}
      <div class="w-1px h-14px bg-gray-200" />
      <div class="flex-none p-4px rounded-4px transition hover:bg-gray-100">
        <i class="i-tb-grip-vertical block square-18px" />
      </div>
    </div>

    {#if priceOpen}
      <div
        class="fixed inset-0 z-51"
        role="button"
        tabindex="-1"
        on:click={() => (priceOpen = false)}
        on:keypress={null}
        use:portal
      />

      <div
        class="z-52 bg-white border border-gray-200 flex flex-col gap-6px px-10px pt-8px pb-10px rounded-b-6px"
        use:floatingContent
        use:portal
      >
        <form class="contents" use:form>
          <div class="relative">
            <input
              bind:this={priceInputEl}
              class={clsx(
                'border pl-12px pr-24px py-10px rounded-4px text-16-r w-110px',
                $errors.price ? 'border-error-900 bg-error-50' : 'border-gray-200 bg-white',
              )}
              inputmode="numeric"
              pattern="[0-9]*"
              placeholder="1,000"
              type="text"
              value={$data.price ? comma($data.price) : ''}
              on:input={(event) => {
                const value = event.currentTarget.value.replaceAll(/\D/g, '');
                event.currentTarget.value = value;
                setFields('price', Number(value), true);
              }}
            />
            <span class="absolute inset-y-0 right-0 flex center pr-12px text-16-r">P</span>
          </div>

          <button class="bg-teal-600 px-16px py-10px flex center text-14-sb text-white rounded-4px" type="submit">
            설정
          </button>
        </form>
      </div>
    {/if}
  </NodeView>
{:else if node.attrs.__data.purchasable}
  <NodeView class="flex center py-8px">
    <div
      class="pointer-events-auto border border-gray-300 rounded-6px px-24px py-20px flex flex-col gap-24px w-full max-w-500px"
    >
      <div class="text-16-r text-gray-700">
        다음 내용을 감상해보시겠어요?
        <br />
        구매한 포스트는 영구 소장이 가능해요.
      </div>

      <div class="flex flex-col gap-8px">
        <div class="flex items-center">
          <span class="text-24-sb grow">{comma(node.attrs.price)}P</span>
          <button
            class="flex center w-100px px-12px py-8.5px bg-gray-950 text-white rounded-4px text-13-sb"
            type="button"
            on:click={() => {
              if (node.attrs.__data.point === null) {
                loginRequireOpen = true;
                return;
              }

              if (node.attrs.__data.point < node.attrs.price) {
                pointPurchaseOpen = true;
              } else {
                postPurchaseOpen = true;
              }
            }}
          >
            구매하기
          </button>
        </div>

        <div class="w-full h-1px bg-gray-200" />

        <div class="flex items-center gap-8px">
          <div class="flex items-center gap-4px">
            <i class="i-tb-text-recognition square-16px text-gray-400" />
            <span class="text-14-r text-gray-600">
              {comma(node.attrs.__data.counts.characters)}자
            </span>
          </div>

          {#if node.attrs.__data.counts.images}
            <div class="flex items-center gap-4px">
              <i class="i-tb-photo square-16px text-gray-400" />
              <span class="text-14-r text-gray-600">
                {comma(node.attrs.__data.counts.images)}개
              </span>
            </div>
          {/if}

          {#if node.attrs.__data.counts.files}
            <div class="flex items-center gap-4px">
              <i class="i-tb-folder square-16px text-gray-400" />
              <span class="text-14-r text-gray-600">
                {comma(node.attrs.__data.counts.files)}개
              </span>
            </div>
          {/if}

          <div class="flex items-center gap-4px">
            <i class="i-tb-clock-hour-4 square-16px text-gray-400" />
            <span class="text-14-r text-gray-600">
              {calcurateReadingTime(node.attrs.__data.counts.characters)}분
            </span>
          </div>
        </div>
      </div>
    </div>
  </NodeView>

  <Modal size="sm" bind:open={pointPurchaseOpen}>
    <svelte:fragment slot="title">보유중인 포인트가 부족해요</svelte:fragment>
    <svelte:fragment slot="subtitle">보유중인 포인트 : {comma(node.attrs.__data.point)}P</svelte:fragment>

    <div slot="action" class="w-full flex gap-3">
      <Button class="w-full" color="secondary" size="xl" on:click={() => (pointPurchaseOpen = false)}>돌아가기</Button>
      <Button class="w-full" href="/point/purchase" size="xl" type="link">충전하기</Button>
    </div>
  </Modal>

  <Modal size="sm" bind:open={postPurchaseOpen}>
    <svelte:fragment slot="title">
      {comma(node.attrs.price)}P를 사용하여
      <br />
      포스트를 구매하시겠어요?
    </svelte:fragment>
    <svelte:fragment slot="subtitle">보유중인 포인트 : {comma(node.attrs.__data.point)}P</svelte:fragment>

    <div slot="action" class="w-full flex gap-3">
      <Button class="w-full" color="secondary" size="xl" on:click={() => (postPurchaseOpen = false)}>돌아가기</Button>
      <Button
        class="w-full"
        size="xl"
        on:click={async () => {
          await purchasePost({
            postId: node.attrs.__data.postId,
            revisionId: node.attrs.__data.revisionId,
          });

          mixpanel.track('post:purchase', {
            postId: node.attrs.__data.postId,
            kind: 'article',
            price: node.attrs.price,
          });

          postPurchaseOpen = false;
        }}
      >
        구매하기
      </Button>
    </div>
  </Modal>

  <LoginRequireModal bind:open={loginRequireOpen} />
{:else}
  <NodeView
    class={clsx('flex justify-end relative py-8px rounded-6px pointer-events-auto', selected && 'ring-2 ring-teal-500')}
    data-drag-handle
    draggable
  >
    <div class="absolute inset-0 flex center">
      <div class="line w-full h-1.5px text-gray-300"></div>
    </div>

    <div
      class="relative rounded-6px p-8px border border-gray-200 flex gap-8px center w-fit mr-20px bg-white text-gray-600 shadow-[0_2px_10px_0] shadow-black/4"
    >
      <div class="text-14-m px-6px py-4px">이 지점부터 유료 분량이 시작됩니다</div>
      <div class="w-1px h-14px bg-gray-200" />
      <div class="flex center text-14-m text-teal-600 px-6px py-4px">
        {comma(node.attrs.price)}P
      </div>

      {#if node.attrs.__data.purchasedAt}
        <div class="absolute top-0 right-0 -translate-y-full text-13-r text-gray-400 pb-4px">
          {dayjs(node.attrs.__data.purchasedAt).formatAsDate()} (결제 완료)
        </div>
      {/if}
    </div>
  </NodeView>
{/if}

<style>
  .line {
    background: repeating-linear-gradient(to right, transparent 0 4px, currentColor 4px 8px);
  }
</style>
