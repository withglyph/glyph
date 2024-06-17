<script lang="ts">
  import dayjs from 'dayjs';
  import IconArrowLeft from '~icons/tabler/arrow-left';
  import IconCoin from '~icons/tabler/coin';
  import { graphql } from '$glitch';
  import { Button, Helmet, Icon, Image } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import RedeemCodeQrList from '../../RedeemCodeQrList.svelte';

  $: query = graphql(`
    query SpaceDashboardRedeemCompletePage_Query($id: ID!, $page: Int! = 1, $take: Int! = 10) {
      redeemCodeGroup(id: $id) {
        id
        codeCount
        description
        createdAt
        expiresAt

        codes(page: $page, take: $take) {
          id
          ...RedeemCodeQrList_redeem
        }

        post {
          id
          permalink

          space @_required {
            id
            slug
            name
          }

          thumbnail {
            id
            ...Image_image
          }

          publishedRevision {
            id
            title
            subtitle
            price
            createdAt
          }
        }
      }
    }
  `);
</script>

<Helmet
  description={`${$query.redeemCodeGroup.post.space.name} 스페이스 리딤코드 생성`}
  title={`리딤코드 생성 완료 | ${$query.redeemCodeGroup.post.space.name}`}
/>

<div
  class={flex({
    direction: 'column',
    align: 'center',
    bgGradient: 'to-br',
    gradientFrom: '[#FEFEFE]',
    gradientTo: 'gray.50',
    width: 'full',
  })}
>
  <div class={css({ width: 'full', sm: { marginBottom: '80px', maxWidth: '860px' } })}>
    <h1
      class={flex({
        align: 'center',
        gap: '8px',
        paddingX: '20px',
        paddingY: '13px',
        fontSize: '17px',
        fontWeight: 'semibold',
        hideFrom: 'sm',
      })}
    >
      <a href="/{$query.redeemCodeGroup.post.space.slug}/dashboard/redeem">
        <Icon icon={IconArrowLeft} size={24} />
      </a>
      리딤코드 만들기
    </h1>

    <div class={css({ smDown: { padding: '20px' }, sm: { marginTop: '40px', marginBottom: '32px' } })}>
      <h2
        class={css({
          fontSize: { base: '17px', sm: '24px' },
          fontWeight: { base: 'semibold', sm: 'bold' },
        })}
      >
        리딤코드가 생성되었어요
      </h2>

      <p class={css({ fontSize: { base: '13px', sm: '14px' }, color: { base: 'gray.500', sm: 'gray.600' } })}>
        리딤코드를 개별적으로 하나씩 다운로드 할 수 있어요.
        <br />
        또한 [관리] 페이지에서 해당 코드를 자세히 확인할 수 있어요
      </p>
    </div>

    <div
      class={css({
        smDown: { paddingTop: '20px', paddingX: '20px', backgroundColor: 'gray.0' },
      })}
    >
      <div
        class={css({ backgroundColor: 'gray.0', sm: { padding: '14px', borderWidth: '1px', borderColor: 'gray.100' } })}
      >
        <div
          class={flex({
            align: 'center',
            gap: { base: '8px', sm: '12px' },
            marginBottom: '16px',
            borderBottomWidth: '1px',
            borderBottomColor: 'gray.100',
            paddingBottom: '16px',
          })}
        >
          <Image
            style={css.raw({
              flex: 'none',
              borderWidth: '[0.8px]',
              borderColor: 'gray.100',
              width: '102px',
              aspectRatio: '16/10',
              objectFit: 'cover',
            })}
            $image={$query.redeemCodeGroup.post.thumbnail}
            placeholder
            size={96}
          />

          <div class={css({ width: 'full', truncate: true })}>
            <h3 class={css({ fontSize: '14px', fontWeight: 'semibold', color: 'gray.800', truncate: true })}>
              {$query.redeemCodeGroup.post.publishedRevision?.title ?? '(제목 없음)'}
            </h3>
            <h4 class={css({ fontSize: '13px', color: 'gray.600', height: '19px', truncate: true })}>
              {$query.redeemCodeGroup.post.publishedRevision?.subtitle ?? ''}
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
              <div class={flex({ align: 'center', gap: '2px' })}>
                <Icon icon={IconCoin} />
                <span>{comma($query.redeemCodeGroup.post.publishedRevision?.price ?? 0)}원</span>
              </div>

              <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: 'gray.100' })} />

              <time datetime={$query.redeemCodeGroup.post.publishedRevision?.createdAt}>
                {dayjs($query.redeemCodeGroup.post.publishedRevision?.createdAt).formatAsDate()}
              </time>
            </div>
          </div>
        </div>

        <dl class={flex({ direction: 'column', gap: '2px' })}>
          <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
            <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>발급갯수</dt>
            <dd class={css({ color: 'gray.600' })}>{$query.redeemCodeGroup.codeCount}개</dd>
          </div>
          <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
            <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>생성일</dt>
            <dd class={css({ color: 'gray.600' })}>
              <time datetime={$query.redeemCodeGroup.createdAt}>
                {dayjs($query.redeemCodeGroup.createdAt).formatAsDateTime()}
              </time>
            </dd>
          </div>
          <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
            <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>만료일</dt>
            <dd class={css({ color: 'gray.600' })}>
              <time datetime={$query.redeemCodeGroup.expiresAt}>
                {dayjs($query.redeemCodeGroup.expiresAt).formatAsDateTime()}
              </time>
            </dd>
          </div>
        </dl>

        <p class={css({ marginTop: '8px', fontSize: '13px', color: 'gray.600', whiteSpace: 'pre-wrap' })}>
          {$query.redeemCodeGroup.description}
        </p>
      </div>

      <div
        class={flex({
          align: 'center',
          justify: 'flex-end',
          marginTop: { base: '20px', sm: '8px' },
          smDown: { paddingBottom: '34px' },
        })}
      >
        <Button
          style={css.raw({ backgroundColor: 'gray.0', width: { base: 'full', sm: '160px' } })}
          href="/{$query.redeemCodeGroup.post.space.slug}/dashboard/redeem/manage"
          type="link"
          variant="gray-outline"
        >
          관리 페이지로 이동
        </Button>
      </div>
    </div>
  </div>
</div>

<hr
  class={css({
    border: 'none',
    width: 'full',
    height: { base: '16px', sm: '1px' },
    backgroundColor: { base: 'gray.50', sm: 'gray.100' },
  })}
/>

<div
  class={flex({
    direction: 'column',
    align: 'center',
    grow: '1',
    paddingTop: { base: '34px', sm: '40px' },
    paddingBottom: '120px',
    width: 'full',
    smDown: { paddingX: '20px' },
  })}
>
  <div class={css({ width: 'full', sm: { maxWidth: '860px' } })}>
    <h2 class={css({ fontSize: '18px', fontWeight: 'semibold' })}>개별 다운로드</h2>
    <p class={css({ marginTop: '2px', fontSize: '13px', color: 'gray.500' })}>
      해당 파일은 500x500크기로 다운로드됩니다
    </p>
  </div>

  <RedeemCodeQrList
    $redeems={$query.redeemCodeGroup.codes}
    codeCount={$query.redeemCodeGroup.codeCount}
    url="/{$query.redeemCodeGroup.post.space.slug}/dashboard/redeem/manage/{$query.redeemCodeGroup.id}"
  />
</div>
