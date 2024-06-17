<script lang="ts">
  import IconChevronRight from '~icons/tabler/chevron-right';
  import IconCoin from '~icons/tabler/coin';
  import { Helmet, Icon } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
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
    총 4개의 리딤코드
  </p>

  <ul class={flex({ direction: 'column', gap: '16px' })}>
    <li
      class={css({
        borderWidth: '1px',
        borderColor: 'gray.100',
        paddingX: '14px',
        paddingY: { base: '15px', sm: '14px' },
      })}
    >
      <a class={flex({ align: 'center', justify: 'space-between', width: 'full', truncate: true })} href="/">
        <div class={flex({ align: 'center', gap: { base: '8px', sm: '12px' }, width: 'full', truncate: true })}>
          <div
            class={css({
              flex: 'none',
              width: { base: '88px', sm: '102px' },
              aspectRatio: '16/10',
              objectFit: 'cover',
              backgroundColor: 'gray.200',
            })}
          />

          <div class={css({ truncate: true })}>
            <h3 class={css({ fontSize: '14px', fontWeight: 'semibold', color: 'gray.800', truncate: true })}>
              포스트 제목
            </h3>
            <h4 class={css({ fontSize: '13px', color: 'gray.600', height: '19px', truncate: true })}>포스트 부제목</h4>
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
                <span>{comma(2000)}원</span>
              </div>

              <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: 'gray.100' })} />

              <time datetime="2024.01.01">2024.01.01</time>
            </div>
          </div>
        </div>
        <Icon style={css.raw({ color: 'gray.400', hideBelow: 'sm' })} icon={IconChevronRight} size={24} />
      </a>
      <hr class={css({ marginY: '16px', border: 'none', width: 'full', height: '1px', backgroundColor: 'gray.100' })} />

      <dl class={flex({ direction: 'column', gap: '2px' })}>
        <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
          <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>등록일</dt>
          <dd class={css({ color: 'gray.600' })}>2024.05.24 11:00</dd>
        </div>
      </dl>
    </li>
  </ul>
</div>