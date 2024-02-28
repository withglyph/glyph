<script lang="ts">
  import { validator } from '@felte/validator-zod';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { createForm } from 'felte';
  import { tick } from 'svelte';
  import { z } from 'zod';
  import { afterNavigate } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Tooltip } from '$lib/components';
  import { Button, Modal } from '$lib/components/v2';
  import { createFloatingActions, portal } from '$lib/svelte/actions';
  import { NodeView } from '$lib/tiptap';
  import { comma } from '$lib/utils';
  import LoginRequireModal from '../../../../routes/(default)/LoginRequireModal.svelte';
  import { priceErrorMap } from './zod';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let getPos: NodeViewProps['getPos'];
  export let selected: NodeViewProps['selected'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let updateAttributes: NodeViewProps['updateAttributes'];

  $: isLastChild = editor?.state.doc.lastChild?.eq(node) ?? false;

  let priceOpen = false;
  let loginRequireOpen = false;
  let postPurchaseOpen = false;

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

  const { anchor, floating } = createFloatingActions({
    placement: 'bottom',
    offset: 8,
  });

  const { form, isSubmitting, setInitialValues, errors } = createForm({
    extend: [
      validator({
        schema: z.object({
          price: z
            .string()
            .transform((value) => Number.parseInt(value.replaceAll(',', '')))
            .pipe(z.number({ errorMap: priceErrorMap }).int().min(100).max(1_000_000).multipleOf(100)),
        }),
      }),
    ],
    onSubmit: ({ price }: { price: string }) => {
      const parsed = Number.parseInt(price.replaceAll(',', ''));
      if (Number.isNaN(parsed)) throw new Error('Unexpected invalid price');

      updateAttributes({ price: parsed });
    },
  });

  let isSubmitted = false;
  $: if ($isSubmitting && !isSubmitted) {
    isSubmitted = true;
  }

  $: invalidPrice = isSubmitted && !!$errors.price;
  $: priceErrorDetailTooltipId = invalidPrice ? 'price-error' : undefined;

  $: setInitialValues({ price: node.attrs.price ? comma(node.attrs.price) : '' });

  $: if (priceOpen) {
    // eslint-disable-next-line unicorn/prefer-top-level-await
    tick().then(() => {
      priceInputEl?.focus();
    });
  } else {
    isSubmitted = false;
  }

  afterNavigate(() => {
    priceOpen = false;
  });
</script>

{#if editor?.isEditable}
  <NodeView
    class={clsx('flex justify-end relative py-4 rounded-6px', selected && 'ring-2 ring-teal-500')}
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
          class="text-12px font-medium px-6px py-4px rounded-4px transition hover:bg-gray-100 sm:text-14px"
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
        <div class="text-12px font-medium px-6px py-4px whitespace-nowrap sm:text-14px">여기서부터 유료 분량</div>
        <div class="w-1px h-14px bg-gray-200" />
        <button
          class={clsx(
            'flex center gap-4px text-12-m px-6px py-4px rounded-4px transition whitespace-nowrap hover:bg-gray-100 sm:text-14-m',
            priceOpen && 'bg-gray-100',
            node.attrs.price ? 'text-teal-600' : 'text-error-900',
          )}
          type="button"
          on:click={() => (priceOpen = true)}
          use:anchor
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
          class="text-12px font-medium px-6px py-4px rounded-4px transition whitespace-nowrap hover:bg-gray-100 sm:text-14px"
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
        <i class="i-tb-grip-vertical block square-16px sm:square-18px" />
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
        use:floating
      >
        <form class="contents" use:form>
          <Tooltip enabled={invalidPrice} keepShowing offset={8} placement="top">
            <span id={priceErrorDetailTooltipId} slot="message" aria-live="assertive">
              {#if $errors.price}
                {@html $errors.price.join('<br/>')}
              {/if}
            </span>
            <div class="relative">
              <input
                bind:this={priceInputEl}
                name="price"
                class="border pl-12px pr-24px py-10px rounded-4px text-16-r w-110px border pl-12px pr-24px py-10px rounded-4px text-16-r w-110px'
                border-gray-200 bg-white aria-[invalid='true']:(border-error-900 bg-error-50)"
                aria-errormessage={priceErrorDetailTooltipId}
                aria-invalid={invalidPrice}
                inputmode="numeric"
                placeholder="1,000"
                on:input={(event) => {
                  const parsed = Number.parseInt(event.currentTarget.value.replaceAll(/\D/g, ''));

                  event.currentTarget.value = Number.isNaN(parsed) ? '' : comma(parsed);
                }}
              />
              <span class="absolute inset-y-0 right-0 flex center pr-12px text-16-r">P</span>
            </div>
          </Tooltip>

          <Button size="sm" type="submit" variant="secondary">설정</Button>
        </form>
      </div>
    {/if}
  </NodeView>
{:else if node.attrs.__data.purchasable}
  <NodeView class="flex center py-4">
    <div
      class="pointer-events-auto border border-gray-150 rounded-6px px-24px py-20px flex flex-col gap-2.5 w-full max-w-500px"
    >
      <div class="text-14-r text-gray-500">
        다음 내용을 감상해보시겠어요?
        <br />
        구매한 포스트는 영구 소장이 가능해요
      </div>

      <div>
        <div class="flex items-center">
          <span class="text-20-sb grow">{comma(node.attrs.price)}P</span>
          <Button
            class="<sm:hidden"
            size="md"
            on:click={() => {
              if (node.attrs.__data.point === null) {
                loginRequireOpen = true;
                return;
              }

              postPurchaseOpen = true;
            }}
          >
            구매하기
          </Button>
          <Button
            class="sm:hidden"
            size="sm"
            on:click={() => {
              if (node.attrs.__data.point === null) {
                loginRequireOpen = true;
                return;
              }

              postPurchaseOpen = true;
            }}
          >
            구매하기
          </Button>
        </div>

        <hr class="h-1px bg-gray-100 border-none mt-3 mb-2" />

        <div class="flex items-center gap-8px">
          <div class="flex items-center gap-4px">
            <i class="i-tb-text-recognition square-16px text-gray-400" />
            <span class="text-14-r text-gray-500">
              {comma(node.attrs.__data.counts.characters)}자
            </span>
          </div>

          {#if node.attrs.__data.counts.images}
            <div class="flex items-center gap-4px">
              <i class="i-tb-photo square-16px text-gray-400" />
              <span class="text-14-r text-gray-500">
                {comma(node.attrs.__data.counts.images)}장
              </span>
            </div>
          {/if}

          {#if node.attrs.__data.counts.files}
            <div class="flex items-center gap-4px">
              <i class="i-tb-folder square-16px text-gray-400" />
              <span class="text-14-r text-gray-500">
                {comma(node.attrs.__data.counts.files)}개
              </span>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </NodeView>

  <Modal titleClass="m-x-8 justify-center" bind:open={postPurchaseOpen}>
    <svelte:fragment slot="title">
      {node.attrs.__data.point < node.attrs.price ? '포인트 충전' : '포스트 구매'}
    </svelte:fragment>

    <div class="my-4 px-5">
      <div class="px-3.5 py-3 bg-gray-50 rounded flex items-center justify-between mb-2">
        <p class="text-14-r text-gray-500">현재 보유한 포인트</p>

        <p class="text-gray-400 text-16-r w-117px px-2 py-1.5 rounded">
          <mark class="text-gray-500 text-16-sb">{comma(node.attrs.__data.point)}</mark>
          P
        </p>
      </div>

      <div class="px-3.5 py-3 bg-gray-50 rounded flex items-center justify-between mb-1.5">
        <p class="text-14-r text-gray-500">사용할 포인트</p>

        <p class="text-16-r w-117px px-2 py-1.5 rounded ring ring-gray-300 bg-gray-100 text-gray-400">
          <mark class="text-16-sb text-gray-500">
            {comma(node.attrs.price)}
          </mark>
          P
        </p>
      </div>

      <p class="text-right text-13-r text-gray-400 mb-8">
        {#if node.attrs.__data.point < node.attrs.price}
          필요한 포인트 <mark class="text-13-m text-error-900">
            {comma(node.attrs.__data.point - node.attrs.price)}P
          </mark>
        {/if}
      </p>
    </div>

    <svelte:fragment slot="action">
      {#if node.attrs.__data.point < node.attrs.price}
        <Button class="w-full" href="/point/purchase" size="xl" type="link">충전하기</Button>
      {:else}
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
      {/if}
    </svelte:fragment>
  </Modal>

  <LoginRequireModal bind:open={loginRequireOpen} />
{:else}
  <NodeView
    class={clsx('flex justify-end relative py-4 rounded-6px pointer-events-auto', selected && 'ring-2 ring-teal-500')}
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
