<script lang="ts">
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$houdini';
  import { Button, Modal } from '$lib/components';
  import { TextInput } from '$lib/components/forms';
  import { useMutation } from '$lib/houdini';
  import { toast } from '$lib/notification';
  import type { SpaceDashboardPage_DeleteSpaceModal_space } from '$houdini';

  export let _space: SpaceDashboardPage_DeleteSpaceModal_space;
  export let open = false;

  let confirm = '';

  $: space = fragment(
    _space,
    graphql(`
      fragment SpaceDashboardPage_DeleteSpaceModal_space on Space {
        id
        slug
        name
      }
    `),
  );

  const deleteSpace = useMutation(
    graphql(`
      mutation SpaceDashboardPage_DeleteSpaceModal_DeleteSpace_Mutation(
        $input: DeleteSpaceInput!
      ) {
        deleteSpace(input: $input) {
          id
        }
      }
    `),
  );
</script>

<Modal bind:open>
  <svelte:fragment slot="title">스페이스 삭제하기</svelte:fragment>

  <span class="font-semibold">{$space.name}</span>
  스페이스를 삭제해요.
  <br />
  스페이스를 삭제하면 스페이스에 게시되어 있던 모든 컨텐츠와 설정도 같이 삭제돼요.

  <div
    class="mt-4 flex items-center gap-4 border border-red-50 rounded-lg bg-red-10 px-4 py-2 text-sm text-red-50"
  >
    <span class="i-lc-alert-triangle" />
    <div>
      한번 삭제된 스페이스는 복구할 수 없어요.
      <br />
      신중하게 진행해주세요.
    </div>
  </div>

  <div class="mt-4 text-sm">
    스페이스를 정말로 삭제하려면 <span class="font-bold">
      {$space.slug}
    </span>
    을(를) 입력해주세요:
    <TextInput class="mt-2 w-full" bind:value={confirm} />
  </div>

  <Button
    size="md"
    slot="action"
    disabled={confirm !== $space.slug}
    loading={$deleteSpace.inflight}
    on:click={async () => {
      await deleteSpace({ spaceId: $space.id });
      toast.success('스페이스를 삭제했어요.');
      await goto('/');
    }}
  >
    삭제하기
  </Button>
</Modal>
