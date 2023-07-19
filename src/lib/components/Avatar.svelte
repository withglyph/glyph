<script context="module" lang="ts">
  const colorize = (value: number, salt: number) => {
    let hash = 0;
    let string = String(value);
    for (let i = 0; i < string.length; i++) {
      hash = string.codePointAt(i)! + ((hash << salt) - hash);
      hash &= hash;
    }
    return `hsl(${hash % 360}, 75%, 50%)`;
  };
</script>

<script lang="ts">
  import { clsx } from 'clsx';
  import { fragment, graphql } from '$houdini';
  import Image from './Image.svelte';
  import type { Avatar_profile } from '$houdini';

  export let _profile: Avatar_profile;
  let _class: string | undefined = undefined;
  export { _class as class };

  $: profile = fragment(
    _profile,
    graphql(`
      fragment Avatar_profile on Profile {
        id

        avatar {
          ...Image_image
        }
      }
    `),
  );
</script>

{#if $profile.avatar}
  <Image class={clsx('rounded-full border', _class)} _image={$profile.avatar} />
{:else}
  <div
    style:background={`linear-gradient(to bottom right, ${colorize(
      $profile.id,
      5,
    )}, ${colorize($profile.id, 13)})`}
    class={clsx('rounded-full border', _class)}
  />
{/if}
