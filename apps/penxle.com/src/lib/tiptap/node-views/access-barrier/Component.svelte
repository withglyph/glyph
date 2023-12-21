<script lang="ts">
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Modal } from '$lib/components';
  import Button from '$lib/components/Button.svelte';
  import { TextInput } from '$lib/components/forms';
  import { NodeView } from '$lib/tiptap';
  import { calcurateReadingTime, comma } from '$lib/utils';
  import LoginRequireModal from '../../../../routes/(default)/LoginRequireModal.svelte';
  import type { FormEventHandler } from 'svelte/elements';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let editor: NodeViewProps['editor'] | undefined;
  export let deleteNode: NodeViewProps['deleteNode'] | undefined;
  export let updateAttributes: NodeViewProps['updateAttributes'] | undefined;

  $: data = node.attrs.__data;
  $: price = node.attrs.price as number | undefined;

  let open = false;
  let loginRequireOpen = false;
  let postPurchaseOpen = false;
  let pointPurchaseOpen = false;

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

  const handlePriceChange: FormEventHandler<HTMLInputElement> = (event) => {
    const price = Number(event.currentTarget.value.replaceAll(',', ''));
    if (Number.isNaN(price)) {
      return;
    }

    updateAttributes?.({ price });
  };
</script>

{#if editor?.isEditable}
  <NodeView class="my-4 flex center gap-4 border border-secondary rounded-xl p-4" data-drag-handle>
    <div class="flex grow gap-4">
      <i class="i-lc-circle-dollar-sign square-6" />

      <div class="flex grow flex-col">
        <div class="body-16-b">결제 상자를 옮겨 유료분량을 만들어 보세요</div>
        <div class="body-13-m text-secondary mt-1">이 상자의 이후 지점부터 결제를 통해 감상할 수 있어요</div>

        <div class="flex gap-2 items-center mt-4">
          <TextInput
            class="bg-primary pl-4 py-2 body-16-b rounded-lg"
            inputmode="numeric"
            value={price?.toLocaleString()}
            on:input={handlePriceChange}
          >
            <span slot="right-label" class="pr-4 bodylong-16-m text-disabled">포인트</span>
          </TextInput>
        </div>
      </div>
    </div>

    <i class="i-lc-grip-vertical square-5 color-icon-secondary" />
    <button
      class="square-8 flex center rounded transition duration-300 hover:bg-gray-5 [&>i]:hover:color-gray-50"
      type="button"
      on:click={() => (open = true)}
    >
      <i class="i-lc-trash-2 square-5 color-icon-secondary transition duration-300" />
    </button>
  </NodeView>

  <Modal bind:open>
    <svelte:fragment slot="title">정말 결제상자를 삭제하시겠어요?</svelte:fragment>

    <p class="bodylong-16-m text-secondary">
      결제상자의 위치를 바꾸고 싶다면 드래그해서 옮길 수 있어요
      <br />
      삭제한 결제상자는 언제든 메뉴에서 다시 추가할 수 있어요
    </p>

    <div slot="action" class="flex gap-2 w-full">
      <Button class="w-full" color="secondary" size="xl" on:click={() => (open = false)}>취소</Button>
      <Button
        class="w-full"
        size="xl"
        on:click={() => {
          open = false;
          setTimeout(() => {
            deleteNode?.();
          }, 150);
        }}
      >
        삭제
      </Button>
    </div>
  </Modal>
{:else if data.purchasable}
  <NodeView class="rounded-2xl py-6 px-3 bg-gray-5/80 relative my-4">
    <div class="-z-1 text-disabled">
      사랑의 노래하며 가치를 이것이야말로 얼음 끓는 내려온 같으며. 길지 피가 시들어 힘차게 주며, 인간의 보내는 않는
      그들을 때에. 피다. 그들의 가진 보배를 얼마나 수 약동하다. 두기 구하지 하였으며.
      <br />
      <br />
      얼음과 할지니, 날카로우나 없는 그러므로 봄바람이다. 곳으로 미묘한 웅대한 예수는 품었기 낙원을 청춘 것이다. 끝까지 소담스러운
      약동하다.
    </div>
    <div
      class="dash absolute rounded-2xl top-0 left-0 w-full h-100% flex flex-col center px-3 text-center space-y-2.5 bg-primary"
    >
      <span class="text-secondary body-15-sb">이 글의 다음 내용은 구매 후에 감상할 수 있어요</span>
      <span class="body-16-eb">{comma(node.attrs.price)}P</span>
      <Button
        class="w-fit"
        size="lg"
        on:click={() => {
          if (data.point === null) {
            loginRequireOpen = true;
            return;
          }

          if (data.point < node.attrs.price) {
            pointPurchaseOpen = true;
          } else {
            postPurchaseOpen = true;
          }
        }}
      >
        유료분량 구매하고 포스트 소장하기
      </Button>
      <!-- prettier-ignore -->
      <p class="body-13-m text-secondary py-0!">
        글 <mark class="text-blue-50">{comma(data.counts.characters)}</mark>자,
        이미지 <mark class="text-blue-50">{comma(data.counts.images)}</mark>장,
        파일 <mark class="text-blue-50">{comma(data.counts.files)}</mark>개,
        읽는 시간 약 <mark class="text-blue-50">{calcurateReadingTime(data.counts.characters)}</mark>분
      </p>
    </div>
  </NodeView>
{:else}
  <NodeView class="flex items-center gap-4 my-4">
    <div class="line grow h-1px mt-1px" />
    <div>
      <span class="text-gray-50 caption-12-m py-1 px-1.5 bg-gray-10 rounded-1">
        {#if data.purchasedAt}
          {dayjs(data.purchasedAt).formatAsDate()} 결제됨
        {:else}
          결제선
        {/if}
      </span>
    </div>
    <div class="line grow h-1px mt-1px" />
  </NodeView>
{/if}

<Modal size="sm" bind:open={pointPurchaseOpen}>
  <svelte:fragment slot="title">보유중인 포인트가 부족해요</svelte:fragment>
  <svelte:fragment slot="subtitle">보유중인 포인트 : {comma(data.point)}P</svelte:fragment>

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
  <svelte:fragment slot="subtitle">보유중인 포인트 : {comma(data.point)}P</svelte:fragment>

  <div slot="action" class="w-full flex gap-3">
    <Button class="w-full" color="secondary" size="xl" on:click={() => (postPurchaseOpen = false)}>돌아가기</Button>
    <Button
      class="w-full"
      size="xl"
      on:click={async () => {
        await purchasePost({
          postId: data.postId,
          revisionId: data.revisionId,
        });

        mixpanel.track('post:purchase', { postId: data.postId, kind: 'article', price: node.attrs.price });

        postPurchaseOpen = false;
      }}
    >
      구매하기
    </Button>
  </div>
</Modal>

<LoginRequireModal bind:open={loginRequireOpen} />

<style>
  .dash {
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23A8A29E' stroke-width='2' stroke-dasharray='8%2c 16' stroke-dashoffset='12' stroke-linecap='square'/%3e%3c/svg%3e");
  }

  .line {
    background: repeating-linear-gradient(to right, transparent, transparent 10px, #d6d3d1 10px, #d6d3d1 20px);
  }
</style>
