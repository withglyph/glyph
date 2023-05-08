<script lang="ts">
  import Wordmark from '$assets/branding/wordmark.svg?component';
</script>

<footer class="bg-black px-4 py-8 text-xs">
  <nav class="mx-auto max-w-screen-lg space-y-4">
    <Wordmark class="h-5 text-gray-400" />

    <section class="text-gray-500">
      <div class="flex items-center gap-2">
        <div>(주)프리미티브</div>
        <div class="h-2 border-l border-l-gray-700" />
        <div>대표: XXX</div>
        <div class="h-2 border-l border-l-gray-700" />
        <div>개인정보관리책임자: XXX</div>
      </div>

      <div class="flex items-center gap-2">
        <div>사업자등록번호: 123-45-67890</div>
        <div class="h-2 border-l border-l-gray-700" />
        <div>통신판매업신고: 2023-서울강남-1234</div>
      </div>

      <div class="flex items-center gap-2">
        <div>주소: 서울특별시 강남구 삼성로 212, 1동 9층</div>
      </div>

      <div class="flex items-center gap-2">
        <div>이메일: support@primitive.im</div>
        <div class="h-2 border-l border-l-gray-700" />
        <div>전화: 02-123-4567</div>
      </div>
    </section>

    <section class="flex items-center gap-2 text-gray-400">
      <a href="" rel="noopener noreferrer" target="_blank">이용약관</a>
      <div class="h-2 border-l border-l-gray-700" />
      <a class="font-medium" href="" rel="noopener noreferrer" target="_blank">
        개인정보처리방침
      </a>
    </section>

    <section class="flex items-center gap-1 text-gray-500">
      Made with <span class="i-ri-heart-fill" />
      by Primitive Inc.
    </section>
  </nav>
</footer>
