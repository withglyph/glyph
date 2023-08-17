<script lang="ts">
  import 'virtual:uno.css';
  import '../styles/index.css';

  import { setupAnalytics } from '@penxle/lib/analytics';
  import { production } from '@penxle/lib/environment';
  import { Link } from '@penxle/ui';
  import { BranchIndicator } from '@penxle/ui/dev';
  import { beforeNavigate } from '$app/navigation';
  import { updated } from '$app/stores';
  import Logo from '$assets/branding/logo.svg?component';

  if (production) {
    setupAnalytics();
  }

  beforeNavigate(({ willUnload, to }) => {
    if ($updated && !willUnload && to?.url) {
      location.href = to.url.href;
    }
  });
</script>

<div class="min-h-screen flex flex-col center">
  <header class="relative sticky top-0 z-10 w-full bg-brand-50 px-8">
    <div class="mx-auto h-16 max-w-screen-lg flex items-center">
      <Link href="https://penxle.com">
        <Logo class="square-8" />
      </Link>

      <div class="mx-4 h-8 border-l border-l-gray-50" />

      <Link class="select-none text-lg font-bold" href="/">도움 센터</Link>
    </div>
  </header>

  <main class="w-full grow px-8 py-4">
    <div class="mx-auto max-w-screen-lg">
      <slot />
    </div>
  </main>
</div>

{#if !production}
  <BranchIndicator />
{/if}
