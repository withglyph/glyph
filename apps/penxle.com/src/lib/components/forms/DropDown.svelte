<script lang="ts">
  import clsx from 'clsx';
  import { getFormContext } from '$lib/form';

  // let open = false;
  // let targetEl: HTMLInputElement;

  export let name: string | undefined = undefined;
  export let optionValues: string[] = [];
  export let optionTexts: string[] = [];
  export let value: string | undefined = undefined;

  let _class: string | undefined = undefined;
  export { _class as class };

  const { field } = getFormContext();

  if (field) {
    name = field.name;
  }
</script>

<select id={name} {name} class={clsx(_class)} bind:value on:change={(e) => e.currentTarget.value}>
  {#each optionValues as value, idx (value)}
    <option {value}>{optionTexts[idx]}</option>
  {/each}
</select>

<!-- <div>
    <input bind:this={targetEl} id={name} {name} type="text" {value} on:click={() => (open = true)} />
  
    {#if open}
      <ul>
        <li>
          <button
            type="button"
            on:click={() => {
              value = 'ADMIN';
              open = false;
            }}
          >
            ADMIN
          </button>
        </li>
        <li>
          <button
            type="button"
            on:click={() => {
              value = 'MEMBER';
              open = false;
            }}
          >
            MEMBER
          </button>
        </li>
      </ul>
    {/if}
  </div> -->
