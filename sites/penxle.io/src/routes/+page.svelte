<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import Logo from '$assets/branding/logo.svg?component';
</script>

<Helmet title="펜슬컴퍼니" />

<div class="pointer-events-none flex grow flex-col select-none center gap-4">
  <div class="flex items-center gap-4">
    <Logo class="square-24" />
    <div class="font-sans text-20 font-black">펜슬컴퍼니</div>
  </div>

  <div class="flex items-center gap-4">
    <Logo class="square-24" />
    <div class="font-content-sans text-20 font-black">펜슬컴퍼니</div>
  </div>

  <div class="font-sans mt-16 text-20 font-bold">일이삼사 1234 !@#$</div>

  <div class="font-content-sans text-20 font-bold">일이삼사 1234 !@#$</div>
</div>
