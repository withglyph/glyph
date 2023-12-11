<script lang="ts">
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import PopupSearch from '$lib/components/forms/PopupSearch.svelte';
  import { comma } from '$lib/utils';

  $: query = graphql(`
    query PointPage_Query {
      auth(scope: USER)

      me @_required {
        id
        point
      }
    }
  `);
</script>

<div class="w-full max-w-300 flex flex-col sm:m-7.5">
  <h1 class="text-xl font-bold mb-5 <sm:hidden">포인트</h1>
  <div class="sm:(flex gap-10)">
    <aside class="w-81.5 bg-cardprimary border border-secondary rounded-2xl px-4 py-6 h-full <sm:hidden">
      <div class="bg-primary py-4 px-3 rounded-xl space-y-2">
        <p class="body-14-m text-secondary">보유 포인트</p>
        <p class="title-24-b">{comma($query.me.point)}P</p>
      </div>
      <div class="mt-4 flex p-0 flex-col gap-4">
        <div class="flex p-0 gap-1 justify-between">
          <div class="text-secondary body-14-m">유료 포인트</div>
          <div class="text-primary body-14-m">
            {comma($query.me.point)}P
          </div>
        </div>
        <div class="flex p-0 gap-1 justify-between">
          <div class="text-secondary body-14-m">무료 포인트</div>
          <div class="text-primary body-14-m">
            {comma(0)}P
          </div>
        </div>
      </div>
      <Button class="mt-4" href="/point/purchase" size="xl" type="link">포인트 충전하기</Button>
    </aside>

    <div class="w-full max-w-208">
      <h2 class="text-black text-xl font-bold">이용 내역</h2>
      <div class="mt-4 flex p-6 flex-col gap-6 border-rd-3 border-1 border-solid border-secondary bg-white">
        <div class="flex flex-col gap-4">
          <PopupSearch class="" placeholder="검색어를 입력하세요" />
          <div class="flex gap-2">
            <!-- Chips 컴포넌트 -->
            <div
              class="flex px-2 py-1.5 items-center border-1 border-#D6D3D1 border-rd-12 bg-#292524 body-13-m text-gray-5"
            >
              전체
            </div>
            <div class="flex px-2 py-1.5 items-center border-1 border-#D6D3D1 border-rd-12 bg-white body-13-m">
              구매
            </div>
            <div class="flex px-2 py-1.5 items-center border-1 border-#D6D3D1 border-rd-12 bg-white body-13-m">
              충전
            </div>
            <div class="flex px-2 py-1.5 items-center border-1 border-#D6D3D1 border-rd-12 bg-white body-13-m">
              결제/후원
            </div>
          </div>
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
              <div class="text-secondary body-13-m pb-3 border-b-1 border-solid border-alphagray-10">2023.08.01</div>
              <div class="flex flex-col gap-1">
                <div class="flex p-xs flex-col gap-3">
                  <div class="flex gap-4 items-center justify-between">
                    <div class="flex gap-6 align-top">
                      <div class="text-secondary body-13-m">12:01</div>
                      <div class="flex flex-col gap-2 flex-1">
                        <div class="text-secondary body-13-m">구매</div>
                        <div class="text-primary body-16-sb">작품명이 기입됩니다</div>
                      </div>
                    </div>
                    <div class="text-secondary body-16-b flex items-center">- 1,000</div>
                  </div>
                </div>
                <hr class="border-t-0 border-b-1 border-alphagray-10" />
                <div class="flex p-xs flex-col gap-3">
                  <div class="flex gap-4 items-center justify-between">
                    <div class="flex gap-6">
                      <div class="text-secondary body-13-m">12:01</div>
                      <div class="flex flex-col gap-2 flex-1">
                        <div class="text-secondary body-13-m">충전</div>
                        <div class="text-primary body-16-sb">신한카드 3560</div>
                      </div>
                    </div>
                    <div class="text-green-50 body-16-b flex items-center">+ 1,000</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col gap-1">
              <div class="text-secondary body-13-m pb-3 border-b-1 border-solid border-alphagray-10">2023.08.01</div>
              <div class="flex flex-col gap-1">
                <div class="flex p-xs flex-col gap-3">
                  <div class="flex gap-4 items-center justify-between">
                    <div class="flex gap-6 align-top self-stretch">
                      <div class="text-secondary body-13-m">12:01</div>
                      <div class="flex flex-col gap-2 flex-1">
                        <div class="text-secondary body-13-m">구매</div>
                        <div class="text-primary body-16-sb">작품명이 기입됩니다</div>
                      </div>
                    </div>
                    <div class="text-secondary body-16-b flex items-center">- 1,000</div>
                  </div>
                </div>
                <hr class="border-t-0 border-b-1 border-alphagray-10" />
                <div class="flex p-xs flex-col gap-3">
                  <div class="flex gap-4 items-center justify-between">
                    <div class="flex gap-6 align-top self-stretch">
                      <div class="text-secondary body-13-m">12:01</div>
                      <div class="flex flex-col gap-2 flex-1">
                        <div class="text-secondary body-13-m">구매</div>
                        <div class="text-primary body-16-sb">작품명이 기입됩니다</div>
                      </div>
                    </div>
                    <div class="text-secondary body-16-b flex items-center">- 1,000</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- TODO: Pagination -->
      </div>
    </div>
  </div>
</div>
