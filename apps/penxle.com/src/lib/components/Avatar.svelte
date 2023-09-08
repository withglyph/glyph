<script lang="ts">
  import { clsx } from 'clsx';
  import { fragment, graphql } from '$glitch';
  import Image from './Image.svelte';
  import type { Avatar_profile } from '$glitch';

  export let _profile: Avatar_profile;
  let _class: string | undefined = undefined;
  export { _class as class };

  $: profile = fragment(
    _profile,
    graphql(`
      fragment Avatar_profile on Profile {
        id

        avatar {
          id
          ...Image_image
        }
      }
    `),
  );
</script>

<Image class={clsx('rounded-full border', _class)} _image={$profile.avatar} />
