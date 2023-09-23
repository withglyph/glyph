<script lang="ts">
  import { Link } from '@penxle/ui';
  import LogoFloating from '$assets/branding/logo-floating.svg?component';
</script>

<div class="mx-auto flex grow flex-col center gap-4 text-center">
  <LogoFloating class="square-25" />

  <h2 class="text-2xl font-semibold">펜슬은 지금 점검중이에요.</h2>

  <p class="text-sm text-gray-50">
    서비스 점검이 진행중이에요.
    <br />
    잠시 후 다시 시도해주세요!
  </p>

  <Link class="text-sm" colored href="https://twitter.com/penxle" underline>@penxle</Link>
</div>
