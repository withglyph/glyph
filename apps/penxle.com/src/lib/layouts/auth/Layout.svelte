<script lang="ts">
  import { Link } from '@penxle/ui';
  import LogoWhite from '$assets/icons/logo-white.svg?component';
  import WordmarkWhite from '$assets/icons/wordmark-white.svg?component';
  import { fragment, graphql } from '$glitch';
  import { Image } from '$lib/components';
  import type { AuthLayout_query } from '$glitch';

  let _query: AuthLayout_query;
  export { _query as $query };

  $: query = fragment(
    _query,
    graphql(`
      fragment AuthLayout_query on Query {
        authLayoutBackgroundImage {
          id
          ...Image_image
        }
      }
    `),
  );
</script>

{#if $query.authLayoutBackgroundImage}
  <Image class="fixed inset-0" $image={$query.authLayoutBackgroundImage} />
{/if}

<header class="z-10 w-full h-15 px-4 py-2 flex items-center sm:px-7.5 backdrop-blur-7">
  <Link class="flex items-center gap-2" href="/">
    <LogoWhite class="<sm:hidden sm:square-6" />
    <WordmarkWhite class="h-5.25 color-icon-primary" />
  </Link>
</header>

<main class="flex m-auto px-4 w-full center sm:px-0">
  <div class="z-1 flex flex-col center rounded-2xl w-full max-w-107.5 bg-white py-7 px-5 sm:px-10">
    <slot />
  </div>
</main>
