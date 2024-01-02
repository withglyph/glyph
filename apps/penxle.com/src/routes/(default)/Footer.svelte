<script lang="ts">
  import { Link } from '@penxle/ui';
  import CompanyLogo from '$assets/branding/company-logo.svg?component';
</script>

<footer class="border-t border-secondary px-4 py-10 text-xs tracking-wider text-secondary flex sm:px-7.5">
  <div class="mx-auto flex flex-wrap justify-between gap-6 w-full max-w-300">
    <div>
      <section class="flex items-center justify-between mb-4">
        <CompanyLogo class="h-16 color-icon-primary" />
      </section>

      <section class="space-y-1">
        <div class="flex flex-wrap items-center">
          <div>(주)펜슬컴퍼니</div>
          <div class="h-2 border-l border-gray-50 mx-1" />
          <div>대표: 배준현</div>
          <div class="h-2 border-l border-gray-50 mx-1" />
          <div>개인정보관리책임자: 배준현</div>
        </div>

        <div class="flex flex-wrap items-center">
          <div>사업자등록번호: 610-88-03078</div>
          <div class="h-2 border-l border-gray-50 mx-1" />
          <Link class="hover:text-secondary" href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=6108803078">
            통신판매업신고: 2023-서울강남-4541
          </Link>
        </div>

        <div class="flex flex-wrap items-center">
          <div>주소: 서울특별시 강남구 강남대로100길 14, 6층</div>
          <div class="h-2 border-l border-gray-50 mx-1" />
          <div>전화: 070-7580-5205</div>
        </div>
      </section>

      <section class="flex flex-wrap items-center mt-4">
        <Link class="hover:text-secondary" href="https://help.penxle.com/legal/terms">이용약관</Link>
        <div class="h-2 border-l border-gray-50 mx-1" />
        <Link class="font-medium hover:text-secondary" href="https://help.penxle.com/legal/privacy">
          개인정보처리방침
        </Link>
        <div class="h-2 border-l border-gray-50 mx-1" />
        <div class="flex flex-wrap items-center">
          <Link class="hover:text-secondary" href="https://penxle.channel.io">고객 센터</Link>
          <div class="h-2 border-l border-gray-50 mx-1" />
          <Link class="hover:text-secondary" href="/penxle">펜슬 소식</Link>
          <div class="h-2 border-l border-gray-50 mx-1" />
          <Link class="hover:text-secondary" href="https://penxle.io">펜슬컴퍼니 소개</Link>
        </div>
      </section>
    </div>

    <div>
      <div class="flex items-center gap-4">
        <Link class="i-px-logo square-4 hover:text-primary" href="/penxle" />
        <Link class="i-lg-twitter square-4 hover:text-[#1DA1F2]" href="https://twitter.com/penxle" />
        <Link class="i-lg-instagram square-4 hover:text-[#E4405F]" href="https://www.instagram.com/penxle.team/" />
        <Link class="i-lg-github square-4 hover:text-[#181717]" href="https://github.com/penxle" />
      </div>
    </div>
  </div>
</footer>
