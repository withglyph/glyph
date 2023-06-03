<script lang="ts">
  import clsx from 'clsx';
  import { fragment, graphql } from '$houdini';
  import Image from './Image.svelte';
  import type { Avatar_profile } from '$houdini';

  let _profile: Avatar_profile;
  export { _profile as $profile };
  let _class: string | undefined = undefined;
  export { _class as class };

  $: profile = fragment(
    _profile,
    graphql(`
      fragment Avatar_profile on Profile {
        avatar {
          ...Image_image
        }
      }
    `)
  );
</script>

{#if $profile.avatar}
  <Image class={clsx('rounded-full', _class)} $image={$profile.avatar} />
{:else}
  <div class={clsx('rounded-full bg-brand-500', _class)} />
{/if}
