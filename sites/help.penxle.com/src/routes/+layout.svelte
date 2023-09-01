<script lang="ts">
  import 'virtual:uno.css';
  import '../styles/index.css';

  import { AutoUpdater, Link, StackIndicator } from '@penxle/ui';
  import Logo from '$assets/branding/logo.svg?component';
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

<AutoUpdater />
<StackIndicator />
