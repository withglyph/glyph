<script lang="ts">
  import { Helmet, Link } from '@penxle/ui';
  import { RingSpinner } from '@penxle/ui/spinners';
  import confetti from 'canvas-confetti';
  import { clsx } from 'clsx';
  import { fade } from 'svelte/transition';
  import Logo from '$assets/logo.svg?component';
  import Slogan from '$assets/slogan.svg?component';

  let phoneNumber = '';
  let status: 'idle' | 'submitting' | 'submitted' | 'invalid' = 'invalid';

  let buttonEl: HTMLButtonElement;

  $: {
    const valid = /^0\d{2}-?\d{3,4}-?\d{4}$/.test(phoneNumber);
    status = valid ? 'idle' : 'invalid';
  }

  const handleSubmit = async () => {
    status = 'submitting';
    try {
      await fetch('/api/enroll', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
      });
    } finally {
      status = 'submitted';
      const { x, y, width, height } = buttonEl.getBoundingClientRect();
      await confetti({
        particleCount: 200,
        scalar: 1.2,
        spread: 360,
        startVelocity: 35,
        origin: {
          x: (x + width / 2) / window.innerWidth,
          y: (y + height / 2) / window.innerHeight,
        },
      });
    }
  };
</script>

<Helmet
  description="새로운 동인 창작 플랫폼 PENXLE이 오픈됐을 때 바로 알림을 받아보세요."
  image={{
    src: 'https://c.pnxl.net/assets/opengraph/default-cover.png',
    size: 'large',
  }}
  title="함께 그리는 반짝임, PENXLE"
/>

<div class="c flex grow flex-col center items-center justify-between bg-gray-10 p-32px">
  <div />

  <div class="flex flex-col center">
    <Logo class="square-100px" />
    <img class="mt-40px h-50px" alt="" src="/assets/coming-soon.webp" />
    <Slogan class="mt-32px h-25px" />

    <form class="mt-64px flex flex-col center gap-2" method="POST" on:submit|preventDefault={handleSubmit}>
      <div class="flex justify-center gap-4 text-sm">
        <input
          class="w-200px rounded-xl bg-white px-3 py-2.5 text-center font-bold"
          disabled={status !== 'idle' && status !== 'invalid'}
          placeholder="010-1234-5678"
          type="text"
          bind:value={phoneNumber}
        />

        <button
          bind:this={buttonEl}
          class={clsx(
            'relative overflow-hidden rounded-xl px-6 font-bold transition duration-150',
            status === 'idle' && 'bg-gray-80 text-gray-10 hover:bg-black',
            status === 'submitting' && 'bg-black text-gray-10',
            status === 'submitted' && 'bg-green-60 text-gray-10',
            status === 'invalid' && 'bg-gray-30 text-gray-10',
          )}
          disabled={status !== 'idle'}
          type="submit"
        >
          <div class={clsx('contents', status !== 'idle' && status !== 'invalid' && 'invisible')}>알림 신청</div>
          {#if status !== 'idle'}
            <div class="absolute inset-0 flex center py-2.5" transition:fade={{ duration: 150 }}>
              {#if status === 'submitting'}
                <RingSpinner class="h-full" />
              {:else if status === 'submitted'}
                <div class="i-lc-check-circle" />
                <div class="ml-1">신청 완료</div>
              {/if}
            </div>
          {/if}
        </button>
      </div>
      <div class="text-xs text-gray-50">서비스가 오픈하면 입력하신 휴대전화 번호로 알려드릴게요!</div>
    </form>
  </div>

  <div class="flex gap-8 text-gray-40">
    <Link class="i-lg-twitter square-5 hover:text-[#1DA1F2]" href="https://twitter.com/penxle" />
    <Link class="i-lg-instagram square-5 hover:text-[#E4405F]" href="https://www.instagram.com/penxle.team/" />
    <Link class="i-lg-github square-5 hover:text-[#181717]" href="https://github.com/penxle" />
  </div>
</div>

<style>
  .c {
    background-image: linear-gradient(#eeedec 1px, transparent 1px),
      linear-gradient(90deg, #eeedec 1px, transparent 1px);
    background-size: 50px 50px;
  }
</style>
