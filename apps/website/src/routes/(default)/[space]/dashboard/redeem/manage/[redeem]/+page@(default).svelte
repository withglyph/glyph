<script lang="ts">
  import dayjs from 'dayjs';
  import IconArrowBarToDown from '~icons/tabler/arrow-bar-to-down';
  import IconArrowLeft from '~icons/tabler/arrow-left';
  import IconCoin from '~icons/tabler/coin';
  import Redeem24 from '$assets/icons/redeem-24.svg?component';
  import Redeem40 from '$assets/icons/redeem-40.svg?component';
  import Redeem65 from '$assets/icons/redeem-65.svg?component';
  import { graphql } from '$glitch';
  import { Button, Helmet, Icon, Image, Modal } from '$lib/components';
  import { Radio } from '$lib/components/forms';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  let saveRedeemFileOpen = false;

  $: query = graphql(`
    query SpaceDashboardRedeemManageEntityPage_Query($permalink: String!) {
      post(permalink: $permalink) {
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
  `);
</script>

<Helmet
  description={`${$query.post.space.name} 스페이스 리딤코드 세부사항`}
  title={`리딤코드 세부사항 | ${$query.post.space.name}`}
/>

<div
  class={flex({
    direction: 'column',
    align: 'center',
    backgroundColor: 'gray.50',
    width: 'full',
  })}
>
  <div class={css({ marginBottom: { base: '34px', sm: '80px' }, width: 'full', sm: { maxWidth: '860px' } })}>
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
      <a href="/{$query.post.space.slug}/dashboard/redeem/manage">
        <Icon style={css.raw({ hideFrom: 'sm' })} icon={IconArrowLeft} size={24} />
        <Icon style={css.raw({ hideBelow: 'sm' })} icon={IconArrowLeft} size={24} />
      </a>
      리딤코드 세부사항
    </h1>

    <div class={css({ marginTop: { base: '20px', sm: '32px' }, smDown: { paddingX: '20px' } })}>
      <div
        class={css({
          borderWidth: '1px',
          borderColor: 'gray.100',
          paddingX: '14px',
          paddingY: { base: '15px', sm: '14px' },
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
            $image={$query.post.thumbnail}
            placeholder
            size={96}
          />

          <div class={css({ width: 'full', truncate: true })}>
            <h3 class={css({ fontSize: '14px', fontWeight: 'semibold', color: 'gray.800', truncate: true })}>
              {$query.post.publishedRevision?.title ?? '(제목 없음)'}
            </h3>
            <h4 class={css({ fontSize: '13px', color: 'gray.600', height: '19px', truncate: true })}>
              {$query.post.publishedRevision?.subtitle ?? ''}
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
                <span>{comma($query.post.publishedRevision?.price ?? 0)}원</span>
              </div>

              <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: 'gray.100' })} />

              <time datetime={$query.post.publishedRevision?.createdAt}>
                {dayjs($query.post.publishedRevision?.createdAt).formatAsDate()}
              </time>
            </div>
          </div>
        </div>

        <dl class={flex({ direction: 'column', gap: '2px' })}>
          <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
            <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>발급갯수</dt>
            <dd class={css({ color: 'gray.600' })}>15개</dd>
          </div>
          <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
            <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>생성일</dt>
            <dd class={css({ color: 'gray.600' })}>2024.05.24. 11:00</dd>
          </div>
          <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
            <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>만료일</dt>
            <dd class={css({ color: 'gray.600' })}>2025.05.24. 11:00</dd>
          </div>
        </dl>

        <p class={css({ marginTop: '8px', fontSize: '13px', color: 'gray.600' })}>리딤코드 설명 리딤코드 설명</p>
      </div>

      <div
        class={flex({
          align: 'center',
          justify: { sm: 'flex-end' },
          gap: '8px',
          marginTop: '8px',
        })}
      >
        <Button style={css.raw({ backgroundColor: 'gray.0', width: 'full' })} variant="red-outline">
          리딤코드 전체 삭제
        </Button>
        <Button style={css.raw({ width: 'full' })} variant="brand-fill" on:click={() => (saveRedeemFileOpen = true)}>
          전체 파일로 저장
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
      다운로드할 확장자를 선택해주세요. 해당 파일은 200x200크기로 다운로드됩니다
    </p>
  </div>

  <ul
    class={flex({
      direction: 'column',
      gap: '8px',
      marginTop: { base: '34px', sm: '16px' },
      width: 'full',
      sm: { maxWidth: '860px' },
    })}
  >
    <li class={css({ borderWidth: '1px', borderColor: 'gray.100', padding: '14px' })}>
      <div class={css({ marginBottom: '8px', backgroundColor: 'gray.200', size: '60px' })} />

      <div
        class={flex({
          direction: { smDown: 'column' },
          gap: '16px',
          sm: { alignItems: 'flex-end', justifyContent: 'space-between' },
        })}
      >
        <dl>
          <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
            <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>번호</dt>
            <dd class={css({ color: 'gray.600' })}>2Q24SO3LA2412P</dd>
          </div>
          <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
            <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>만료일</dt>
            <dd class={css({ color: 'gray.600' })}>2025.05.24 11:00</dd>
          </div>
          <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
            <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>사용여부</dt>
            <dd class={css({ color: 'gray.600' }, true && { fontWeight: 'medium', color: 'brand.400' })}>사용가능</dd>
          </div>
        </dl>

        <div class={flex({ align: 'center', gap: '8px' })}>
          <Button
            style={flex.raw({ align: 'center', justify: 'center', gap: '4px', width: { base: 'full', sm: 'fit' } })}
            size="sm"
            variant="gray-outline"
          >
            <Icon icon={IconArrowBarToDown} />
            PNG
          </Button>
          <Button
            style={flex.raw({ align: 'center', justify: 'center', gap: '4px', width: { base: 'full', sm: 'fit' } })}
            size="sm"
            variant="gray-outline"
          >
            <Icon icon={IconArrowBarToDown} />
            SVG
          </Button>
          <Button
            style={flex.raw({ align: 'center', justify: 'center', gap: '4px', width: { base: 'full', sm: 'fit' } })}
            size="sm"
            variant="gray-outline"
          >
            <Icon icon={IconArrowBarToDown} />
            PDF
          </Button>
        </div>
      </div>
    </li>
  </ul>
</div>

<Modal bind:open={saveRedeemFileOpen}>
  <svelte:fragment slot="title">리딤 코드 전체 파일로 저장</svelte:fragment>

  <div class={flex({ align: 'center', gap: '16px' })}>
    <Radio variant="brand">PNG</Radio>
    <Radio variant="brand">PDF</Radio>
    <Radio variant="brand">SVG</Radio>
  </div>

  <div class={flex({ align: 'center', justify: 'flex-start', gap: '16px', marginTop: '24px' })}>
    <div class={flex({ direction: 'column', position: 'relative', width: 'full', maxWidth: '116px' })}>
      <Redeem24 />
      <p
        class={css({
          paddingY: '[2.5px]',
          fontSize: '13px',
          fontWeight: 'medium',
          color: 'gray.0',
          textAlign: 'center',
          backgroundColor: 'brand.400',
        })}
      >
        24칸
      </p>
      <div
        class={css({ position: 'absolute', top: '0', size: 'full', borderWidth: '2px', borderColor: 'brand.400' })}
      />
    </div>
    <div class={flex({ direction: 'column', position: 'relative', width: 'full', maxWidth: '116px' })}>
      <Redeem40 />
      <p
        class={css({
          paddingY: '[2.5px]',
          fontSize: '13px',
          fontWeight: 'medium',
          color: 'gray.0',
          textAlign: 'center',
          backgroundColor: 'brand.400',
        })}
      >
        40칸
      </p>
      <div
        class={css({ position: 'absolute', top: '0', size: 'full', borderWidth: '2px', borderColor: 'brand.400' })}
      />
    </div>
    <div class={flex({ direction: 'column', position: 'relative', width: 'full', maxWidth: '116px' })}>
      <Redeem65 />
      <p
        class={css({
          paddingY: '[2.5px]',
          fontSize: '13px',
          fontWeight: 'medium',
          color: 'gray.0',
          textAlign: 'center',
          backgroundColor: 'brand.400',
        })}
      >
        65칸
      </p>
      <div
        class={css({ position: 'absolute', top: '0', size: 'full', borderWidth: '2px', borderColor: 'brand.400' })}
      />
    </div>
  </div>

  <Button slot="action" style={css.raw({ width: 'full' })} size="lg" variant="gradation-fill">다운로드</Button>
</Modal>