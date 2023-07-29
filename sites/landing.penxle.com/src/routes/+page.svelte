<script lang="ts">
  import ComingSoon from '$assets/coming-soon.svg?component';
  import Logo from '$assets/logo.svg?component';
  import Slogan from '$assets/slogan.svg?component';
  import { Helmet, Link } from '$lib/components';
  // import { RingSpinner } from '$lib/components/spinners';

  // const status: 'idle' | 'submitting' | 'submitted' = 'idle';
</script>

<Helmet
  description="펜슬은 개인 창작자들을 위한 자유롭고 즐거운 창작 공간이에요."
  image={{
    src: 'https://pnxl.net/assets/opengraph/default-cover.png',
    size: 'large',
  }}
  title="함께 그리는 반짝임, PENXLE"
/>

<div class="c flex grow flex-col center bg-gray-10">
  <Logo class="square-100px" />
  <ComingSoon class="mt-40px h-50px" />
  <Slogan class="mt-32px h-25px" />

  <div class="mt-40px flex gap-8 text-gray-40">
    <Link
      class="i-lg-twitter square-5 hover:text-[#1DA1F2]"
      href="https://twitter.com/penxle"
    />
    <Link
      class="i-lg-instagram square-5 hover:text-[#E4405F]"
      href="https://www.instagram.com/penxle.team/"
    />
    <Link
      class="i-lg-github square-5 hover:text-[#181717]"
      href="https://github.com/penxle"
    />
  </div>

  <!-- <input
    class="mt-40px w-350px border-b-2 border-b-gray-70 px-3 py-2.5 text-center font-bold"
    placeholder="전화번호 입력"
    type="text"
  />

  <button
    class="relative mt-32px overflow-hidden rounded bg-gray-80 px-3 py-2 font-extrabold text-gray-10 transition duration-300 hover:bg-black"
    type="button"
    on:click={() => (status = 'submitting')}
  >
    오픈하면 알림 받기
    {#if status === 'submitting'}
      <div class="absolute inset-0 flex center bg-gray-80 px-3 py-2">
        <div class="flex items-center justify-center">
          <div class="i-lc-check-circle text-green-60" />
          <div class="ml-10px text-green-60">등록 완료</div>
        </div>
        <RingSpinner class="h-full" />
      </div>
    {/if}
  </button> -->
</div>

<style>
  .c {
    background-image: linear-gradient(#eeedec 1px, transparent 1px),
      linear-gradient(90deg, #eeedec 1px, transparent 1px);
    background-size: 50px 50px;
  }
</style>
