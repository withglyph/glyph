<script lang="ts">
  import { Modal } from '$lib/components';
  import Button from '$lib/components/Button.svelte';
  import { NodeView } from '$lib/tiptap';
  import type { NodeViewProps } from '$lib/tiptap';

  type $$Props = NodeViewProps;
  $$restProps;

  export let deleteNode: () => void;
  export let updateAttributes: (attributes: Record<string, unknown>) => void;

  let open = false;
</script>

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
          updateAttributes({ deleting: true });
          deleteNode();
        }, 150);
      }}
    >
      삭제
    </Button>
  </div>
</Modal>
