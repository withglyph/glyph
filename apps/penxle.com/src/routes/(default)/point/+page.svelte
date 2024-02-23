<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  // import PopupSearch from '$lib/components/forms/PopupSearch.svelte';
  import { comma } from '$lib/utils';
  import type { PointTransactionCause } from '$glitch';

  $: query = graphql(`
    query PointPage_Query {
      auth(scope: USER)

      me @_required {
        id
        point
        freePoint: point(kind: FREE)
        paidPoint: point(kind: PAID)

        points {
          id
          amount
          cause
          createdAt

          post {
            id

            publishedRevision {
              id
              title
            }
          }
        }
      }
    }
  `);

  const pointTransactionCause: Record<PointTransactionCause, string> = {
    EXPIRE: '만료',
    INTERNAL: '시스템',
    PATRONIZE: '후원',
    PURCHASE: '충전',
    REFUND: '환불',
    UNDO_PURCHASE: '결제 취소',
    UNLOCK_CONTENT: '구매',
    EVENT_REWARD: '이벤트 보상',
  };
</script>

<Helmet description="내 현재 포인트와 사용 내역을 확인할 수 있어요" title="포인트" />

<div class="w-full max-w-315 flex flex-col sm:p-7.5">
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
            {comma($query.me.paidPoint)}P
          </div>
        </div>
        <div class="flex p-0 gap-1 justify-between">
          <div class="text-secondary body-14-m">무료 포인트</div>
          <div class="text-primary body-14-m">
            {comma($query.me.freePoint)}P
          </div>
        </div>
      </div>
      <Button class="mt-4" href="/point/purchase" size="xl" type="link">포인트 충전하기</Button>
    </aside>

    <div class="w-full max-w-208">
      <h2 class="text-black text-xl font-bold <sm:(mx-5 mt-4)">이용 내역</h2>
      <div class="mt-4 flex p-6 flex-col gap-6 rounded-xl border border-secondary bg-white <sm:(mx-5 mb-4)">
        {#if $query.me.points.length === 0}
          <div class="body-15-b grow text-center flex flex-col center">
            포인트 내역이 없어요.
            <br />
            포인트를 충전해보세요!

            <Button class="w-fit mt-4" href="/point/purchase" size="lg" type="link">포인트 충전하기</Button>
          </div>
        {:else}
          <div class="flex flex-col gap-4">
            <!-- <PopupSearch class="" placeholder="검색어를 입력하세요" /> -->
            <div class="flex gap-2">
              <!-- Chips 컴포넌트 -->
              <!-- <div
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
              </div> -->
            </div>
            <div class="flex flex-col gap-4">
              {#each $query.me.points as point (point.id)}
                <div class="flex flex-col gap-1">
                  <div class="text-secondary body-13-m pb-3 border-b-1 border-solid border-alphagray-10">
                    {dayjs(point.createdAt).formatAsDate()}
                  </div>
                  <div class="flex flex-col gap-1">
                    <div class="flex p-xs flex-col gap-3">
                      <div class="flex gap-4 items-center justify-between">
                        <div class="flex gap-6 align-top">
                          <div class="text-secondary body-13-m">{dayjs(point.createdAt).formatAsTime()}</div>
                          <div class="flex flex-col gap-2 flex-1 w-full">
                            <div class="text-secondary body-13-m">{pointTransactionCause[point.cause]}</div>
                            {#if point.cause === 'UNLOCK_CONTENT'}
                              <div class="text-primary body-16-sb whitespace-pre-wrap break-all">
                                {point.post?.publishedRevision?.title ?? '(제목 없음)'}
                              </div>
                            {/if}
                          </div>
                        </div>

                        {#if point.amount > 0}
                          <div class="text-green-50 body-16-b flex items-center">+{comma(point.amount)}</div>
                        {:else}
                          <div class="text-secondary body-16-b flex items-center">{comma(point.amount)}</div>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
        <!-- TODO: Pagination -->
      </div>
    </div>
  </div>
</div>
