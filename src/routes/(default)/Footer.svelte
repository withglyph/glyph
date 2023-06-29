<script lang="ts">
  import Wordmark from '$assets/branding/wordmark.svg?component';
  import { PUBLIC_VERCEL_GIT_COMMIT_SHA } from '$env/static/public';
  import { Link } from '$lib/components';
</script>

<footer class="border-t px-4 py-8 text-xs tracking-wider text-gray-400">
  <nav class="mx-auto max-w-screen-lg space-y-4">
    <section class="flex items-center justify-between">
      <Wordmark class="h-4" />
      <div class="flex items-center gap-4">
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
    </section>

    <section>
      <div class="flex items-center gap-2">
        <div>(주)펜슬컴퍼니</div>
        <div class="h-2 border-l border-gray-300" />
        <div>대표: XXX</div>
        <div class="h-2 border-l border-gray-300" />
        <div>개인정보관리책임자: XXX</div>
      </div>

      <div class="flex items-center gap-2">
        <div>사업자등록번호: 123-45-67890</div>
        <div class="h-2 border-l border-gray-300" />
        <div>통신판매업신고: 2023-서울강남-1234</div>
      </div>

      <div class="flex items-center gap-2">
        <div>주소: 서울특별시 강남구 강남대로 1, 1층</div>
      </div>

      <div class="flex items-center gap-2">
        <div>이메일: support@penxle.io</div>
        <div class="h-2 border-l border-gray-300" />
        <div>전화: 02-123-4567</div>
      </div>
    </section>

    <section class="flex items-center gap-2">
      <Link class="hover:text-gray-500" href="/">이용약관</Link>
      <div class="h-2 border-l border-gray-300" />
      <Link class="font-medium hover:text-gray-500" href="/">
        개인정보처리방침
      </Link>
      <div class="h-2 border-l border-gray-300" />
      <Link
        class="flex items-center gap-1 hover:text-gray-500"
        href={`https://github.com/penxle/penxle/tree/${PUBLIC_VERCEL_GIT_COMMIT_SHA}`}
      >
        <span class="i-lc-git-branch" />
        {PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 7)}
      </Link>
    </section>
  </nav>
</footer>
