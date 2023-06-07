<script lang="ts">
  import Logo from '$assets/branding/logo.svg?component';
  import { Button } from '$lib/components';
</script>

<div class="sticky top-0 z-50 bg-white py-4">
  <div class="mx-auto w-4xl flex items-center">
    <a href="/">
      <Logo class="square-8 rounded" />
    </a>
    <div class="grow" />
    <Button>게시하기</Button>
  </div>
</div>
