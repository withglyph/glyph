<script lang="ts">
  import { Link } from '@penxle/ui';
  import WordmarkWhite from '$assets/branding/wordmark-white.svg?component';
  import LogoWhite from '$assets/icons/logo-white.svg?component';
</script>

<header
  class="z-10 w-full h-15 border-b border-alphagray-15 px-4 py-2 flex items-center sm:px-5"
>
  <nav class="flex items-center gap-2">
    <Link href="/">
      <LogoWhite class="hidden sm:(block! square-6)" />
    </Link>
    <Link href="/">
      <WordmarkWhite class="h-5.5" />
    </Link>
  </nav>
</header>
