<script lang="ts">
  import { graphql } from '$houdini';
  import { Button, Helmet, Modal } from '$lib/components';

  const noop = graphql(/* GraphQL */ `
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
  <h1 class="text-xl font-semibold">Response</h1>
  <div class="mt-4 font-mono">{data?.noop}</div>
</Modal>
