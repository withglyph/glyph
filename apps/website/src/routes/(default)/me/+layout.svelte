<script lang="ts">
  import IconArchive from '~icons/tabler/archive';
  import IconCoin from '~icons/tabler/coin';
  import IconFilterCog from '~icons/tabler/filter-cog';
  import IconPigMoney from '~icons/tabler/pig-money';
  import IconScan from '~icons/tabler/scan';
  import IconSettings from '~icons/tabler/settings';
  import IconStar from '~icons/tabler/star';
  import { isWebView } from '$lib/flutter';
  import { flex } from '$styled-system/patterns';
  import NavItem from './NavItem.svelte';
</script>

<div
  class={flex({
    direction: { base: 'column', sm: 'row' },
    grow: '1',
    marginX: 'auto',
    width: 'full',
    maxWidth: '1280px',
  })}
>
  {#if !isWebView()}
    <nav
      class={flex({
        direction: { base: 'row', sm: 'column' },
        flex: 'none',
        borderColor: 'gray.150',
        width: { base: 'full', sm: '302px' },
        smDown: {
          gap: '28px',
          position: 'sticky',
          top: '62px',
          borderBottomWidth: '1px',
          paddingX: '20px',
          paddingY: '14px',
          backgroundColor: 'gray.0',
          height: '54px',
          scrollbar: 'hidden',
          overflowX: 'auto',
          zIndex: '50',
        },
        sm: {
          paddingTop: '40px',
          borderRightWidth: '1px',
        },
      })}
    >
      <NavItem icon={IconArchive} pathname="/me/cabinets" title="보관함" />
      <NavItem icon={IconStar} pathname="/me/subscribes" title="구독" />
      <NavItem icon={IconCoin} pathname="/me/point" title="포인트" />
      <NavItem icon={IconPigMoney} pathname="/me/revenue" title="수익/출금" />
      <NavItem icon={IconFilterCog} pathname="/me/contentfilters" title="뮤트/쿠션" />
      <NavItem icon={IconScan} pathname="/me/redeem" title="리딤코드 등록" />
      <NavItem icon={IconSettings} pathname="/me/settings" title="계정설정" />
    </nav>
  {/if}

  <main
    class={flex({
      direction: 'column',
      grow: '1',
      paddingBottom: { base: '96px', sm: '120px' },
      minWidth: '0',
      width: 'full',
      sm: { marginTop: '40px', paddingX: '60px' },
    })}
  >
    <slot />
  </main>
</div>
