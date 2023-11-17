<script lang="ts">
  import { Link } from '@penxle/ui';
  import LogoWhite from '$assets/icons/logo-white.svg?component';
  import WordmarkWhite from '$assets/icons/wordmark-white.svg?component';
</script>

<header class="z-10 w-full h-15 px-4 py-2 flex items-center sm:px-7.5 backdrop-blur-7">
  <Link class="flex items-center gap-2" href="/">
    <LogoWhite class="<sm:hidden sm:square-6" />
    <WordmarkWhite class="h-5.25 color-icon-primary" />
  </Link>
</header>
