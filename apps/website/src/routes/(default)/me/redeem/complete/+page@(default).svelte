<script lang="ts">
  import dayjs from 'dayjs';
  import IconCoin from '~icons/tabler/coin';
  import { graphql } from '$glitch';
  import { Button, Helmet, Icon, Image } from '$lib/components';
  import { isWebView, postFlutterMessage } from '$lib/flutter';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  $: query = graphql(`
    query MeRedeemCompletePage_Query($id: ID!) {
      redeemCodeRedemption(id: $id) {
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
  `);
</script>

<Helmet description="리딤코드 등록이 완료되었어요" title="리딤코드 등록 완료" />

<div
  class={css(
    {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flexGrow: '1',
      backgroundColor: 'gray.50',
      width: 'full',
      smDown: { paddingX: '20px' },
    },
    isWebView() && { minHeight: 'dvh' },
  )}
>
  <div
    class={css({ paddingTop: '80px', paddingBottom: { base: '120px', sm: '160px' }, width: 'full', maxWidth: '600px' })}
  >
    <h1
      class={css({
        marginBottom: '4px',
        fontSize: { base: '24px', sm: '30px' },
        fontWeight: '[800]',
        textAlign: 'center',
      })}
    >
      등록이 완료되었어요
    </h1>
    <p
      class={css({
        fontSize: { base: '13px', sm: '15px' },
        fontWeight: { sm: 'medium' },
        color: 'gray.600',
        textAlign: 'center',
      })}
    >
      등록된 포스트는 나중에 [보관함]-[구매]에서도 확인할 수 있어요
    </p>

    <div
      class={css({
        marginTop: { base: '40px', sm: '32px' },
        marginBottom: '8px',
        borderWidth: '1px',
        borderColor: 'gray.100',
        paddingX: '14px',
        paddingY: { base: '15px', sm: '14px' },
        backgroundColor: 'gray.0',
      })}
    >
      <div class={flex({ align: 'center', gap: { base: '8px', sm: '12px' }, width: 'full', truncate: true })}>
        <Image
          style={css.raw({ flex: 'none', width: '88px', aspectRatio: '16/10', objectFit: 'cover' })}
          $image={$query.redeemCodeRedemption.postPurchase.post.thumbnail}
          placeholder
          size={96}
        />

        <div class={css({ truncate: true })}>
          <h3 class={css({ fontSize: '14px', fontWeight: 'semibold', color: 'gray.800', truncate: true })}>
            {$query.redeemCodeRedemption.postPurchase.revision.title ?? '(제목 없음)'}
          </h3>
          <h4 class={css({ fontSize: '13px', color: 'gray.600', height: '19px', truncate: true })}>
            {$query.redeemCodeRedemption.postPurchase.revision.subtitle ?? ''}
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
              <span>{comma($query.redeemCodeRedemption.postPurchase.revision.price ?? 0)}원</span>
            </div>

            <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: 'gray.100' })} />

            <time datetime={$query.redeemCodeRedemption.postPurchase.post.publishedAt}>
              {dayjs($query.redeemCodeRedemption.postPurchase.post.publishedAt).formatAsDate()}
            </time>
          </div>
        </div>
      </div>

      <hr class={css({ marginY: '16px', border: 'none', width: 'full', height: '1px', backgroundColor: 'gray.100' })} />

      <dl class={flex({ direction: 'column', gap: '2px' })}>
        <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
          <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>등록일</dt>
          <dd class={css({ color: 'gray.600' })}>
            <time datetime={$query.redeemCodeRedemption.createdAt}>
              {dayjs($query.redeemCodeRedemption.createdAt).formatAsDateTime()}
            </time>
          </dd>
        </div>
      </dl>
    </div>

    {#if isWebView()}
      <Button
        style={css.raw({ width: 'full' })}
        variant="gradation-fill"
        on:click={() => {
          postFlutterMessage({ type: 'post:view', permalink: $query.redeemCodeRedemption.postPurchase.post.permalink });
        }}
      >
        포스트 바로가기
      </Button>
    {:else}
      <Button
        style={css.raw({ display: 'block' })}
        href={`/${$query.redeemCodeRedemption.postPurchase.post.space.slug}/${$query.redeemCodeRedemption.postPurchase.post.permalink}`}
        type="link"
        variant="gradation-fill"
      >
        포스트 바로가기
      </Button>
    {/if}
  </div>
</div>
