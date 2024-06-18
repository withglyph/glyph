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
    유료 콘텐츠를 원하는 방식으로 배포하기
  </h2>

  <p class={css({ fontSize: { base: '13px', sm: '14px' }, color: 'gray.600' })}>
    리딤코드는 내가 올린 유료 포스트를 타인에게 배포할 수 있는 새로운 방법이에요. 리딤코드를 오프라인 행사에서 회지와
    함께 제공하거나 원하는 지인에게 공유해보세요. 코드를 받은 사람은 해당 코드를 등록해 내가 지정한 유료 콘텐츠를 구매
    절차 없이 바로 이용할 수 있어요.
    <br />
    모든 코드는 무작위하게 생성되며 1회용이기에 내가 모르는 사이에 돌려 쓰이거나 유출될 걱정이 없어요.
  </p>

  <Button
    style={flex.raw({ align: 'center', gap: '4px', marginTop: '40px', paddingRight: '10px', hideFrom: 'sm' })}
    href="redeem/create"
    size="sm"
    type="link"
    variant="gradation-fill"
  >
    리딤코드 만들기
    <Icon icon={IconChevronRight} />
  </Button>
  <Button
    style={flex.raw({ align: 'center', gap: '4px', marginTop: '40px', paddingRight: '10px', hideBelow: 'sm' })}
    href="redeem/create"
    size="md"
    type="link"
    variant="gradation-fill"
  >
    리딤코드 만들기
    <Icon icon={IconChevronRight} size={20} />
  </Button>
</div>
