<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { css } from '$styled-system/css';
  import Image from './Image.svelte';
  import type { Avatar_profile } from '$glitch';
  import type { SystemStyleObject } from '$styled-system/types';

  let _profile: Avatar_profile;
  export { _profile as $profile };
  export let style: SystemStyleObject | undefined = undefined;

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

<Image style={css.raw({ borderRadius: 'full' }, style)} $image={$profile.avatar} />
