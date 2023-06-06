<script lang="ts">
  import { Helmet } from '$lib/components';
  import { Tiptap } from '$lib/components/forms';

  let value: object;
</script>

<Helmet title="새 포스트 작성하기" />

<main class="flex grow">
  <div class="mx-auto max-w-2xl flex grow flex-col">
    <div class="sticky top-0 z-50 flex items-center bg-white pt-4">
      <div class="flex grow items-center gap-4">
        <span class="i-lc-bold square-6" />
        <span class="i-lc-italic square-6" />
        <span class="i-lc-strikethrough square-6" />
        <span class="i-lc-underline square-6" />

        <span class="square-6" />

        <span class="i-lc-heading-1 square-6" />
        <span class="i-lc-heading-2 square-6" />
        <span class="i-lc-heading-3 square-6" />

        <span class="square-6" />

        <span class="i-lc-align-left square-6" />
        <span class="i-lc-align-center square-6" />
        <span class="i-lc-align-right square-6" />
        <span class="i-lc-align-justify square-6" />
      </div>

      <div class="flex items-center gap-4">
        <span class="i-lc-rotate-ccw square-5" />
        <span class="i-lc-rotate-cw square-5" />
      </div>
    </div>

    <div class="flex grow flex-col">
      <input
        class="mt-12 w-full text-3xl font-semibold"
        placeholder="제목을 입력하세요."
        type="text"
      />

      <input
        class="mt-2 w-full text-lg"
        placeholder="부제목을 입력하세요."
        type="text"
      />

      <hr class="mb-4 mt-8" />

      <Tiptap class="mb-8 grow" bind:value />
    </div>
  </div>
</main>
