<script lang="ts">
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Button, Helmet } from '$lib/components';
  // import PopupSearch from '$lib/components/forms/PopupSearch.svelte';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
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

<div class={flex({ direction: 'column', width: 'full', maxWidth: '1260px', sm: { padding: '30px' } })}>
  <h1 class={css({ hideBelow: 'sm', marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' })}>포인트</h1>
  <div class={css({ sm: { display: 'flex', gap: '40px' } })}>
    <aside
      class={css({
        hideBelow: 'sm',
        borderWidth: '1px',
        borderColor: 'gray.200',
        borderRadius: '16px',
        paddingX: '16px',
        paddingY: '24px',
        width: '326px',
        height: 'full',
        backgroundColor: 'white',
      })}
    >
      <div
        class={css({
          gap: '4px',
          borderRadius: '12px',
          paddingX: '12px',
          paddingY: '16px',
          backgroundColor: 'gray.50',
        })}
      >
        <p class={css({ fontSize: '14px', color: 'gray.500' })}>보유 포인트</p>
        <p class={css({ fontSize: '24px', fontWeight: 'bold' })}>{comma($query.me.point)}P</p>
      </div>
      <div class={flex({ direction: 'column', gap: '16px', marginTop: '16px', padding: '0' })}>
        <div class={flex({ justify: 'space-between', gap: '4px', padding: '0' })}>
          <div class={css({ fontSize: '14px', color: 'gray.500' })}>유료 포인트</div>
          <div class={css({ fontSize: '14px', color: 'gray.900' })}>
            {comma($query.me.paidPoint)}P
          </div>
        </div>
        <div class={flex({ justify: 'space-between', gap: '4px', padding: '0' })}>
          <div class={css({ fontSize: '14px', color: 'gray.500' })}>무료 포인트</div>
          <div class={css({ fontSize: '14px', color: 'gray.900' })}>
            {comma($query.me.freePoint)}P
          </div>
        </div>
      </div>
      <Button style={css.raw({ marginTop: '16px' })} href="/point/purchase" size="xl" type="link">
        포인트 충전하기
      </Button>
    </aside>

    <div class={css({ width: 'full', maxWidth: '832px' })}>
      <h2
        class={css({
          fontSize: '20px',
          fontWeight: 'bold',
          color: 'black',
          smDown: { marginX: '20px', marginTop: '16px' },
        })}
      >
        이용 내역
      </h2>
      <div
        class={flex({
          direction: 'column',
          gap: '24px',
          marginTop: '16px',
          borderWidth: '1px',
          borderColor: 'gray.200',
          borderRadius: '12px',
          padding: '24px',
          backgroundColor: 'white',
          smDown: { marginX: '20px', marginBottom: '16px' },
        })}
      >
        {#if $query.me.points.length === 0}
          <div
            class={center({
              flexDirection: 'column',
              flexGrow: 1,
              textAlign: 'center',
              fontSize: '15px',
              fontWeight: 'bold',
            })}
          >
            포인트 내역이 없어요.
            <br />
            포인트를 충전해보세요!

            <Button style={css.raw({ marginTop: '16px', width: 'fit' })} href="/point/purchase" size="lg" type="link">
              포인트 충전하기
            </Button>
          </div>
        {:else}
          <div class={flex({ direction: 'column', gap: '16px' })}>
            <div class={flex({ direction: 'column', gap: '16px' })}>
              {#each $query.me.points as point (point.id)}
                <div class={flex({ direction: 'column', gap: '4px' })}>
                  <div
                    class={css({
                      borderBottomWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: '[black/10]',
                      paddingBottom: '12px',
                      fontSize: '13px',
                      color: 'gray.500',
                    })}
                  >
                    {dayjs(point.createdAt).formatAsDate()}
                  </div>
                  <div class={flex({ direction: 'column', gap: '4px' })}>
                    <div class={flex({ direction: 'column', gap: '12px', padding: '12px' })}>
                      <div class={flex({ align: 'center', justify: 'space-between', gap: '16px' })}>
                        <div class={flex({ gap: '24px', verticalAlign: 'top' })}>
                          <div class={css({ fontSize: '13px', color: 'gray.500' })}>
                            {dayjs(point.createdAt).formatAsTime()}
                          </div>
                          <div class={flex({ direction: 'column', flex: '1', gap: '8px', width: 'full' })}>
                            <div class={css({ fontSize: '13px', color: 'gray.500' })}>
                              {pointTransactionCause[point.cause]}
                            </div>
                            {#if point.cause === 'UNLOCK_CONTENT'}
                              <div
                                class={css({
                                  fontSize: '16px',
                                  fontWeight: 'semibold',
                                  color: 'gray.900',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-all',
                                })}
                              >
                                {point.post?.publishedRevision?.title ?? '(제목 없음)'}
                              </div>
                            {/if}
                          </div>
                        </div>

                        {#if point.amount > 0}
                          <div
                            class={flex({ align: 'center', fontSize: '16px', fontWeight: 'bold', color: '[#4ecea6]' })}
                          >
                            +{comma(point.amount)}
                          </div>
                        {:else}
                          <div
                            class={flex({ align: 'center', fontSize: '16px', fontWeight: 'bold', color: 'gray.500' })}
                          >
                            {comma(point.amount)}
                          </div>
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
