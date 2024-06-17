<script lang="ts">
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { graphql } from '$glitch';
  import { Button, Helmet, Icon } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  $: query = graphql(`
    query SpaceDashboardRedeemIndexPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name
      }
    }
  `);
</script>

<Helmet description={`${$query.space.name} 스페이스 리딤코드`} title={`리딤코드 | ${$query.space.name}`} />

<div
  class={css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: { base: '60px', sm: '68px' },
    paddingBottom: { base: '120px', sm: '140px' },
    textAlign: 'center',
  })}
>
  <h2
    class={css({
      marginBottom: { base: '6px', sm: '4px' },
      fontSize: { base: '22px', sm: '30px' },
      fontWeight: '[800]',
    })}
  >
    종이책에 전자책 혜택을 더하다
  </h2>

  <!-- prettier-ignore -->
  <p class={css({ fontSize: { base: '13px', sm: '14px' }, color: 'gray.600' })}>
    리딤코드는 종이책과 유료포스트를 함께 이용할 수 있게 도와주는 서비스로
    <br />
    해당 코드를 스캔하거나 입력하면
    <mark class={css({ color: 'brand.400' })}>글리프에서 발행한 유료포스트가 자동으로 구매 완료</mark>되도록 설정할 수 있어요.
    <br />
    코드는 한 계정에만 등록할 수 있어 안전하게 관리가 가능해요.
  </p>

  <Button
    style={flex.raw({ align: 'center', gap: '4px', marginTop: '40px', paddingRight: '10px', hideFrom: 'sm' })}
    href="redeem/create"
    size="sm"
    type="link"
    variant="gradation-fill"
  >
    리딤 코드 만들기
    <Icon icon={IconChevronRight} />
  </Button>
  <Button
    style={flex.raw({ align: 'center', gap: '4px', marginTop: '40px', paddingRight: '10px', hideBelow: 'sm' })}
    href="redeem/create"
    size="md"
    type="link"
    variant="gradation-fill"
  >
    리딤 코드 만들기
    <Icon icon={IconChevronRight} size={20} />
  </Button>
</div>
