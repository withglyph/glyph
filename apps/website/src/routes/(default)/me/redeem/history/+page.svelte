<script lang="ts">
  import dayjs from 'dayjs';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import IconCoin from '~icons/tabler/coin';
  import { graphql } from '$glitch';
  import { Helmet, Icon, Image } from '$lib/components';
  import { isWebView, postFlutterMessage } from '$lib/flutter';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  $: query = graphql(`
    query MeRedeemHistoryPage_Query {
      me @_required {
        id

        redeemCodeRedemptions {
          id
          createdAt

          postPurchase {
            id

            post {
              id
              permalink
              publishedAt

              thumbnail {
                id
                ...Image_image
              }

              space @_required {
                id
                slug
              }
            }

            revision {
              id
              title
              subtitle
              price
            }
          }
        }
      }
    }
  `);
</script>

<Helmet description="리딤코드 사용내역을 확인해보세요" title="리딤코드 사용내역" />

<div class={css({ smDown: { paddingX: '20px' } })}>
  <p
    class={css({
      marginTop: { base: '16px', sm: '32px' },
      marginBottom: { base: '8px', sm: '16px' },
      fontSize: '15px',
      color: 'gray.500',
    })}
  >
    총 {$query.me.redeemCodeRedemptions.length}개의 리딤코드
  </p>

  <ul class={flex({ direction: 'column', gap: '16px' })}>
    {#each $query.me.redeemCodeRedemptions as redemption (redemption.id)}
      <li
        class={css({
          borderWidth: '1px',
          borderColor: 'gray.100',
          paddingX: '14px',
          paddingY: { base: '15px', sm: '14px' },
        })}
      >
        <svelte:element
          this={$isWebView ? 'button' : 'a'}
          class={flex({ align: 'center', justify: 'space-between', width: 'full', truncate: true })}
          href={$isWebView
            ? undefined
            : `/${redemption.postPurchase.post.space.slug}/${redemption.postPurchase.post.permalink}`}
          role={$isWebView ? 'button' : 'a'}
          on:click={() => {
            if ($isWebView) {
              postFlutterMessage({ type: 'post:view', permalink: redemption.postPurchase.post.permalink });
              return;
            }
          }}
        >
          <div class={flex({ align: 'center', gap: { base: '8px', sm: '12px' }, width: 'full', truncate: true })}>
            <Image
              style={css.raw({ flex: 'none', width: '88px', aspectRatio: '16/10', objectFit: 'cover' })}
              $image={redemption.postPurchase.post.thumbnail}
              placeholder
              size={96}
            />

            <div class={css({ truncate: true })}>
              <h3 class={css({ fontSize: '14px', fontWeight: 'semibold', color: 'gray.800', truncate: true })}>
                {redemption.postPurchase.revision.title ?? '(제목 없음)'}
              </h3>
              <h4 class={css({ fontSize: '13px', color: 'gray.600', height: '19px', truncate: true })}>
                {redemption.postPurchase.revision.subtitle ?? ''}
              </h4>
              <div
                class={flex({
                  align: 'center',
                  gap: '8px',
                  marginTop: { base: '3px', sm: '6px' },
                  fontSize: '12px',
                  color: 'gray.500',
                })}
              >
                <div class={flex({ align: 'center', gap: '2px', color: 'brand.400' })}>
                  <Icon icon={IconCoin} />
                  <span>{comma(redemption.postPurchase.revision.price ?? 0)}원</span>
                </div>

                <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: 'gray.100' })} />

                <time datetime={redemption.postPurchase.post.publishedAt}>
                  {dayjs(redemption.postPurchase.post.publishedAt).formatAsDate()}
                </time>
              </div>
            </div>
          </div>
          <Icon style={css.raw({ color: 'gray.400', hideBelow: 'sm' })} icon={IconChevronRight} size={24} />
        </svelte:element>
        <hr
          class={css({ marginY: '16px', border: 'none', width: 'full', height: '1px', backgroundColor: 'gray.100' })}
        />

        <dl class={flex({ direction: 'column', gap: '2px' })}>
          <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
            <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>등록일</dt>
            <dd class={css({ color: 'gray.600' })}>
              <time datetime={redemption.createdAt}>
                {dayjs(redemption.createdAt).formatAsDateTime()}
              </time>
            </dd>
          </div>
        </dl>
      </li>
    {:else}
      <li class={css({ margin: 'auto', paddingY: '60px', fontSize: '14px', color: 'gray.500' })}>
        리딤코드 등록 내역이 없어요
      </li>
    {/each}
  </ul>
</div>
