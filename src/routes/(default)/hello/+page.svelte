<script lang="ts">
  import { graphql, useMutation } from '$lib/houdini';

  //   $: query = useQuery(
  //     graphql(`
  //       query HelloPage_Query @load {
  //         hello
  //       }
  //     `),
  //   );

  $: add = useMutation(
    graphql(`
      mutation HelloPage_Add_Mutation($input: AddInput!) {
        add(input: $input)
      }
    `),
  );
  let result = 0;
  const handleClick = async () => {
    result = await add({ a, b });
  };
  let a = 0;
  let b = 0;
</script>

<div>
  <input type="number" bind:value={a} />
  <input type="number" bind:value={b} />
  <button type="button" on:click={handleClick}>계산</button>
</div>

{result}
