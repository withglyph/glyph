<script lang="ts">
  import { page } from '$app/stores';
  import { fragment, graphql } from '$bifrost';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { css } from '$styled-system/css';
  import type { SpaceDashboardSettingsPage_DeleteSpaceModal_space } from '$bifrost';

  let _space: SpaceDashboardSettingsPage_DeleteSpaceModal_space;
  export { _space as $space };

  export let open = false;
  let completeModalOpen = false;

  let confirm = '';

  $: space = fragment(
    _space,
    graphql(`
      fragment SpaceDashboardSettingsPage_DeleteSpaceModal_space on Space {
        id
        slug
        name
      }
    `),
  );

  const deleteSpace = graphql(`
    mutation SpaceDashboardSettingsPage_DeleteSpaceModal_DeleteSpace_Mutation($input: DeleteSpaceInput!) {
      deleteSpace(input: $input) {
        id
      }
    }
  `);
</script>

<Modal bind:open>
  <svelte:fragment slot="title">스페이스를 삭제하시겠어요?</svelte:fragment>
  <svelte:fragment slot="subtitle">스페이스의 모든 데이터가 삭제되고 복구할 수 없어요</svelte:fragment>

  <form
    on:submit|preventDefault={() => {
      deleteSpace({ spaceId: $space.id });
      mixpanel.track('space:delete', { spaceId: $space.id });
      open = false;
      completeModalOpen = true;
    }}
  >
    <FormField name="slug" style={css.raw({ flexGrow: '1' })} label="스페이스 고유 url">
      <TextInput style={css.raw({ width: 'full' })} placeholder="URL을 입력해주세요" bind:value={confirm}>
        <span slot="left-text">{$page.url.host}/</span>
      </TextInput>
    </FormField>

    <Button
      style={css.raw({ marginTop: '24px', width: 'full' })}
      color="red"
      disabled={confirm !== $space.slug}
      loading={$deleteSpace.inflight}
      size="xl"
      type="submit"
    >
      스페이스 삭제하기
    </Button>
  </form>
</Modal>

<Modal open={completeModalOpen} size="sm">
  <svelte:fragment slot="title">스페이스 삭제가 완료되었어요</svelte:fragment>
  <svelte:fragment slot="subtitle">함께해줘서 고마웠어요!</svelte:fragment>

  <Button
    slot="action"
    style={css.raw({ width: 'full' })}
    size="xl"
    on:click={() => {
      completeModalOpen = false;

      location.href = '/';
    }}
  >
    홈으로 가기
  </Button>
</Modal>
