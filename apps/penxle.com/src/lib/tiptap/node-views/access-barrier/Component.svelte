<script lang="ts">
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Modal } from '$lib/components';
  import Button from '$lib/components/Button.svelte';
  import { NodeView } from '$lib/tiptap';
  import { comma } from '$lib/utils';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let node: NodeViewProps['node'];
  export let deleteNode: NodeViewProps['deleteNode'] | undefined;
  export let updateAttributes: NodeViewProps['updateAttributes'] | undefined;
  export let editor: NodeViewProps['editor'] | undefined;

  let open = false;

  const purchasePost = graphql(`
    mutation TiptapAccessBarrier_PurchasePost_Mutation($input: PurchasePostInput!) {
      purchasePost(input: $input) {
        id

        revision {
          id
          content
        }
      }
    }
  `);
</script>

{#if editor?.isEditable}
  <NodeView class="my-4 flex center gap-4 border px-8 py-4" data-drag-handle>
    <span class="i-lc-gift square-8" />

    <div class="flex grow flex-col">
      <div class="font-bold">결제 상자</div>
      <div class="text-sm text-gray-50">이 상자 아래로는 결제를 해야 읽을 수 있어요.</div>
    </div>

    <span class="i-lc-grip-vertical square-6 text-gray-20" />
    <button
      class="group square-8 flex center rounded transition duration-300 hover:bg-gray-5"
      type="button"
      on:click={() => (open = true)}
    >
      <span class="i-lc-x square-6 text-gray-20 transition duration-300 group-hover:text-gray-30" />
    </button>
  </NodeView>

  <Modal bind:open>
    <svelte:fragment slot="title">정말 결제상자를 삭제하시겠어요?</svelte:fragment>

    <p>
      결제상자의 위치를 바꾸고 싶다면 드래그해서 옮길 수 있어요.
      <br />
      삭제한 결제상자는 언제든 하단 메뉴에서 다시 추가할 수 있어요.
    </p>

    <div slot="action" class="flex gap-2">
      <Button color="secondary" size="md" on:click={() => (open = false)}>취소</Button>
      <Button
        size="md"
        on:click={() => {
          open = false;
          setTimeout(() => {
            updateAttributes?.({ deleting: true });
            deleteNode?.();
          }, 150);
        }}
      >
        삭제
      </Button>
    </div>
  </Modal>
{:else if node.attrs.data.purchaseable}
  <NodeView class="rounded-2xl py-6 px-3 bg-gray-5/80 relative">
    <div class="-z-1 text-disabled">
      사랑의 노래하며 가치를 이것이야말로 얼음 끓는 내려온 같으며. 길지 피가 시들어 힘차게 주며, 인간의 보내는 않는
      그들을 때에. 피다. 그들의 가진 보배를 얼마나 수 약동하다. 두기 구하지 하였으며.
      <br />
      <br />
      얼음과 할지니, 날카로우나 없는 그러므로 봄바람이다. 곳으로 미묘한 웅대한 예수는 품었기 낙원을 청춘 것이다. 끝까지 소담스러운
      약동하다.
    </div>
    <div
      class="dash absolute backdrop-blur-3 rounded-2xl top-0 left-0 w-full h-100% flex flex-col center px-3 text-center space-y-2.5"
    >
      <span class="text-secondary body-15-sb">이 글의 다음 내용은 구매 후에 감상할 수 있어요</span>
      <span class="body-16-eb">{comma(node.attrs.data.pointAmount)} P</span>
      <Button
        class="w-fit"
        size="lg"
        on:click={async () => {
          await purchasePost({
            postId: node.attrs.data.postId,
            revisionId: node.attrs.data.revisionId,
          });
        }}
      >
        유료분량 구매하고 포스트 소장하기
      </Button>
      <!-- prettier-ignore -->
      <p class="body-13-m text-secondary py-0!">
        글 <mark class="text-blue-50">{comma(node.attrs.data.characterCount)}</mark>자,
        이미지 <mark class="text-blue-50">{comma(node.attrs.data.imageCount)}</mark>장,
        파일 <mark class="text-blue-50">{comma(node.attrs.data.fileCount)}</mark>개,
        읽는 시간 약 <mark class="text-blue-50">{comma(node.attrs.data.readingTime)}</mark>분
      </p>
    </div>
  </NodeView>
{:else}
  <NodeView class="flex items-center gap-4 my-4">
    <div class="border-t grow" />
    <div class="text-gray-50 text-sm">
      여기부터 유료 분량
      {#if node.attrs.data.purchasedAt}
        ({dayjs(node.attrs.data.purchasedAt).formatAsDate()} 구매함)
      {/if}
    </div>
    <div class="border-t grow" />
  </NodeView>
{/if}

<style>
  .dash {
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='16' ry='16' stroke='%23A8A29E' stroke-width='2' stroke-dasharray='8%2c 16' stroke-dashoffset='12' stroke-linecap='square'/%3e%3c/svg%3e");
  }
</style>
