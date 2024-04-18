<script lang="ts">
  import IconGithub from '~icons/simple-icons/github';
  import IconInstagram from '~icons/simple-icons/instagram';
  import IconTwitter from '~icons/simple-icons/twitter';
  import FullLogo from '$assets/logos/full.svg?component';
  import { Icon, Link } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
</script>

<footer
  class={css({
    borderTopWidth: '1px',
    borderTopColor: 'gray.150',
    paddingX: '20px',
    paddingY: '40px',
    fontSize: '12px',
    letterSpacing: '[0.05em]',
    backgroundColor: 'gray.5',
  })}
>
  <div
    class={flex({
      justify: 'space-between',
      gap: '32px',
      wrap: 'wrap',
      marginX: 'auto',
      width: 'full',
      maxWidth: '1280px',
    })}
  >
    <div>
      <FullLogo class={css({ height: '22px', color: 'gray.900', marginBottom: '12px' })} />

      <section
        class={flex({
          align: 'center',
          gap: '12px',
          wrap: 'wrap',
          fontSize: '14px',
          marginBottom: '20px',
          color: 'gray.600',
          lineHeight: 'none',
        })}
      >
        <Link href="/glyph">글리프 소식</Link>
        <div class={css({ height: '12px', borderLeftWidth: '1px', borderLeftColor: 'gray.150', marginX: '4px' })} />
        <!-- <Link href="/glyph">글리프 소개</Link>
        <div class={css({ height: '12px', borderLeftWidth: '1px', borderLeftColor: 'gray.150', marginX: '4px' })} /> -->
        <Link href="https://penxle.channel.io/home">고객센터</Link>
      </section>

      <ul class={flex({ direction: 'column', gap: '6px', fontSize: '13px', marginBottom: '32px', color: 'gray.500' })}>
        <li>(주)펜슬컴퍼니</li>
        <li>대표: 배준현</li>
        <li>개인정보관리책임자: 배준현</li>
        <li>사업자등록번호: 610-88-03078</li>
        <li>주소: 서울특별시 강남구 강남대로100길 14, 6층</li>
        <li>
          전화: <a href="tel:02-565-7695">02-565-7695</a>
        </li>
      </ul>

      <section
        class={flex({
          align: 'center',
          wrap: 'wrap',
          marginTop: '16px',
          fontSize: '13px',
          gap: '20px',
          color: 'gray.500',
          lineHeight: 'none',
        })}
      >
        <Link style={css.raw({ fontWeight: 'medium' })} href="https://help.withglyph.com/legal/privacy">
          개인정보처리방침
        </Link>
        <div class={css({ height: '12px', borderLeftWidth: '1px', borderLeftColor: 'gray.150', marginX: '4px' })} />
        <Link href="https://help.withglyph.com/legal/terms">이용약관</Link>
        <div class={css({ height: '12px', borderLeftWidth: '1px', borderLeftColor: 'gray.150', marginX: '4px' })} />
        <Link href="https://www.ftc.go.kr/bizCommPop.do?wrkr_no=6108803078">통신판매업신고: 2023-서울강남-4541</Link>
      </section>
    </div>

    <div
      class={flex({
        'align': 'center',
        'gap': '12px',
        'color': 'gray.500',
        '&>a': { size: '34px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
      })}
    >
      <Link aria-label="인스타그램" href="https://www.instagram.com/withglyph">
        <Icon style={css.raw({ color: { _hover: '[#E4405F]' } })} icon={IconInstagram} />
      </Link>

      <Link aria-label="트위터" href="https://twitter.com/withglyph">
        <Icon style={css.raw({ color: { _hover: '[#1DA1F2]' } })} icon={IconTwitter} />
      </Link>
      <Link aria-label="깃헙" href="https://github.com/withglyph">
        <Icon style={css.raw({ color: { _hover: '[#181717]' } })} icon={IconGithub} />
      </Link>
    </div>
  </div>
</footer>
