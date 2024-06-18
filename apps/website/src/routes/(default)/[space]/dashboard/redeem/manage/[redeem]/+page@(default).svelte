<script lang="ts">
  import dayjs from 'dayjs';
  import IconArrowLeft from '~icons/tabler/arrow-left';
  import IconCoin from '~icons/tabler/coin';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Alert, Button, Helmet, Icon, Image } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import RedeemCodeQrList from '../../RedeemCodeQrList.svelte';

  let revokeRedeemCodeGroupOpen = false;

  $: query = graphql(`
    query SpaceDashboardRedeemManageEntityPage_Query($id: ID!, $page: Int! = 1, $take: Int! = 10) {
      redeemCodeGroup(id: $id) {
        id
        availableCodeCount
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

  const revokeRedeemCodeGroup = graphql(`
    mutation SpaceDashboardRedeemManageEntityPage_RevokeRedeemCodeGroup_Mutation($input: RevokeRedeemCodeGroupInput!) {
      revokeRedeemCodeGroup(input: $input) {
        id
      }
    }
  `);
</script>

<Helmet
  description={`${$query.redeemCodeGroup.post.space.name} 스페이스 리딤코드 세부사항`}
  title={`리딤코드 세부사항 | ${$query.redeemCodeGroup.post.space.name}`}
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
  <div class={css({ marginBottom: { base: '34px', sm: '60px' }, width: 'full', sm: { maxWidth: '860px' } })}>
    <h1
      class={flex({
        align: 'center',
        gap: '8px',
        marginTop: { sm: '40px' },
        fontSize: { base: '17px', sm: '24px' },
        fontWeight: { base: 'semibold', sm: 'bold' },
        smDown: { borderBottomWidth: '1px', borderBottomColor: 'gray.50', paddingX: '20px', paddingY: '13px' },
      })}
    >
      <a href="/{$query.redeemCodeGroup.post.space.slug}/dashboard/redeem/manage">
        <Icon style={css.raw({ hideFrom: 'sm' })} icon={IconArrowLeft} size={24} />
        <Icon style={css.raw({ hideBelow: 'sm' })} icon={IconArrowLeft} size={28} />
      </a>
      리딤코드 세부사항
    </h1>

    <div class={css({ marginTop: { base: '20px', sm: '32px' }, smDown: { paddingX: '20px' } })}>
      <div
        class={css({
          borderWidth: '1px',
          borderColor: 'gray.100',
          padding: '20px',
          backgroundColor: 'gray.0',
        })}
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
            style={css.raw({ flex: 'none', width: '102px', aspectRatio: '16/10', objectFit: 'cover' })}
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
            <dt class={css({ fontWeight: 'semibold', width: '46px' })}>사용가능</dt>
            <dd class={css({ color: 'gray.600' })}>
              {$query.redeemCodeGroup.availableCodeCount}/{$query.redeemCodeGroup.codeCount}개
            </dd>
          </div>
          <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
            <dt class={css({ fontWeight: 'semibold', width: '46px' })}>생성일</dt>
            <dd class={css({ color: 'gray.600' })}>
              <time datetime={$query.redeemCodeGroup.createdAt}>
                {dayjs($query.redeemCodeGroup.createdAt).formatAsDateTime()}
              </time>
            </dd>
          </div>
          <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
            <dt class={css({ fontWeight: 'semibold', width: '46px' })}>만료일</dt>
            <dd class={css({ color: 'gray.600' })}>
              <time datetime={$query.redeemCodeGroup.expiresAt}>
                {dayjs($query.redeemCodeGroup.expiresAt).formatAsDateTime()}
              </time>
            </dd>
          </div>
        </dl>

        <p class={css({ marginTop: '8px', fontSize: '13px', color: 'gray.600' })}>
          {$query.redeemCodeGroup.description}
        </p>
      </div>

      {#if $query.redeemCodeGroup.availableCodeCount > 0}
        <div
          class={flex({
            justify: 'flex-end',
            marginTop: '8px',
          })}
        >
          <Button
            style={css.raw({ backgroundColor: 'gray.0', width: '160px' })}
            variant="red-outline"
            on:click={() => (revokeRedeemCodeGroupOpen = true)}
          >
            리딤코드 전체 파기
          </Button>
        </div>
      {/if}
    </div>
  </div>
</div>

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
    <h2 class={css({ fontSize: '18px', fontWeight: 'semibold' })}>코드 목록</h2>
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

<Alert bind:open={revokeRedeemCodeGroupOpen}>
  <p slot="title" class={css({ textAlign: 'left' })}>전체 리딤코드를 파기할까요?</p>
  <p slot="content" class={css({ textAlign: 'left' })}>이미 사용된 리딤코드에는 영향이 가지 않아요</p>

  <svelte:fragment slot="action">
    <Button
      style={css.raw({ hideFrom: 'sm' })}
      size="lg"
      variant="gray-sub-fill"
      on:click={() => (revokeRedeemCodeGroupOpen = false)}
    >
      취소
    </Button>
    <Button
      style={css.raw({ hideBelow: 'sm' })}
      size="lg"
      variant="gray-outline"
      on:click={() => (revokeRedeemCodeGroupOpen = false)}
    >
      취소
    </Button>
    <Button
      size="lg"
      variant="red-fill"
      on:click={async () => {
        await revokeRedeemCodeGroup({ id: $query.redeemCodeGroup.id });
        mixpanel.track('redeem-code-group:delete', { id: $query.redeemCodeGroup.id });
        await goto(`/${$query.redeemCodeGroup.post.space.slug}/dashboard/redeem/manage`);
        revokeRedeemCodeGroupOpen = false;
      }}
    >
      전체 파기
    </Button>
  </svelte:fragment>
</Alert>
