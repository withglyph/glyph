<script lang="ts">
  import Wordmark from '$assets/branding/wordmark.svg?component';
  import { PUBLIC_VERCEL_GIT_COMMIT_SHA } from '$env/static/public';
  import { Link } from '$lib/components';
</script>

<footer class="border-t px-4 py-8 text-xs tracking-wider">
  <nav class="mx-auto max-w-screen-lg space-y-4">
    <Wordmark class="h-4 text-gray-400" />

    <section class="text-gray-400">
      <div class="flex items-center gap-2">
        <div>(주)펜슬컴퍼니</div>
        <div class="h-2 border-x border-l-gray-300" />
        <div>대표: XXX</div>
        <div class="h-2 border-x border-l-gray-300" />
        <div>개인정보관리책임자: XXX</div>
      </div>

      <div class="flex items-center gap-2">
        <div>사업자등록번호: 123-45-67890</div>
        <div class="h-2 border-x border-l-gray-300" />
        <div>통신판매업신고: 2023-서울강남-1234</div>
      </div>

      <div class="flex items-center gap-2">
        <div>주소: 서울특별시 강남구 강남대로 1, 1층</div>
      </div>

      <div class="flex items-center gap-2">
        <div>이메일: support@penxle.io</div>
        <div class="h-2 border-x border-l-gray-300" />
        <div>전화: 02-123-4567</div>
      </div>

      <div class="flex items-center gap-2">
        <Link
          href={`https://github.com/penxle/penxle/tree/${PUBLIC_VERCEL_GIT_COMMIT_SHA}`}
        >
          버전: {PUBLIC_VERCEL_GIT_COMMIT_SHA.slice(0, 7)}
        </Link>
      </div>
    </section>

    <section class="flex items-center gap-2 text-gray-400">
      <Link href="/">이용약관</Link>
      <div class="h-2 border-x border-l-gray-300" />
      <Link class="font-medium" href="/">개인정보처리방침</Link>
    </section>
  </nav>
</footer>
