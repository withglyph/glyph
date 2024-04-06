<script lang="ts">
  import { fragment, graphql } from '$bifrost';
  import { css } from '$styled-system/css';
  import Image from './Image.svelte';
  import type { Avatar_profile } from '$bifrost';
  import type { SystemStyleObject } from '$styled-system/types';

  type Size = 16 | 24 | 32 | 48 | 64 | 96 | 128 | 256 | 512 | 1024 | 'full';

  let _profile: Avatar_profile;
  export { _profile as $profile };
  export let style: SystemStyleObject | undefined = undefined;
  export let size: Size;

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

<Image style={css.raw({ borderRadius: 'full' }, style)} $image={$profile.avatar} {size} />
