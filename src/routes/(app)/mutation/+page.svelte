<script lang="ts">
  import { graphql } from '$houdini';
  import { Button, Helmet, Modal } from '$lib/components';

  const noop = graphql(`
    mutation Noop {
      noop
    }
  `);

  let open = false;
  $: ({ data } = $noop);

  const mutate = async () => {
    await noop.mutate(null);
    open = true;
  };
</script>

<Helmet title="Mutation" />

<Button on:click={mutate}>Click me</Button>

<Modal bind:open>
  <svelte:fragment slot="title">Response</svelte:fragment>

  <div class="font-mono">{data?.noop}</div>

  <Button slot="action" on:click={() => (open = false)}>닫기</Button>
</Modal>
