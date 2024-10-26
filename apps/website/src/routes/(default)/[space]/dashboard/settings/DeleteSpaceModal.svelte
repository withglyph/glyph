<script lang="ts">
  import { page } from '$app/stores';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Modal } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { isWebView, postFlutterMessage } from '$lib/flutter';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { SpaceDashboardSettingsPage_DeleteSpaceModal_space } from '$glitch';

  let _space: SpaceDashboardSettingsPage_DeleteSpaceModal_space;
  export { _space as $space };

  export let open = false;

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

  const _deleteSpace = graphql(`
    mutation SpaceDashboardSettingsPage_DeleteSpaceModal_DeleteSpace_Mutation($input: DeleteSpaceInput!) {
      deleteSpace(input: $input) {
        id
      }
    }
  `);

  const deleteSpace = async () => {
    if (confirm === $space.slug) {
      await _deleteSpace({ spaceId: $space.id });
      mixpanel.track('space:delete', { spaceId: $space.id });

      if (isWebView()) {
        postFlutterMessage({ type: 'space:delete' });
      } else {
        location.href = '/';
      }
    }
  };
</script>

<Modal bind:open>
  <svelte:fragment slot="title">스페이스 삭제</svelte:fragment>

  <p class={css({ fontSize: '14px', color: 'red.600' })}>
    스페이스 삭제 시 해당 스페이스에 저장된 모든 데이터가 영구적으로 삭제되며, 삭제된 데이터는 복구할 수 없어요.
  </p>

  <form class={css({ marginTop: '24px' })} on:submit|preventDefault={deleteSpace}>
    <FormField name="slug" style={css.raw({ flexGrow: '1' })} label="스페이스 고유 URL">
      <div class={css({ display: 'flex' })}>
        <div
          class={flex({
            align: 'center',
            borderWidth: '1px',
            borderColor: 'gray.100',
            borderRightStyle: 'none',
            paddingX: '12px',
            paddingY: '10px',
            fontSize: '14px',
            fontWeight: 'medium',
            color: 'gray.400',
            backgroundColor: 'gray.50',
            height: '37px',
          })}
        >
          {$page.url.host}/
        </div>
        <TextInput style={css.raw({ width: 'full' })} placeholder="URL을 입력해주세요" size="sm" bind:value={confirm} />
      </div>
    </FormField>

    <Button
      slot="action"
      style={css.raw({ marginTop: '24px', width: 'full' })}
      disabled={confirm !== $space.slug}
      loading={$_deleteSpace.inflight}
      variant="red-fill"
      on:click={deleteSpace}
    >
      스페이스 삭제
    </Button>
  </form>
</Modal>
