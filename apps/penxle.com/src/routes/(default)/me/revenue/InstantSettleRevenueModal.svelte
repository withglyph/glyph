<script lang="ts">
  import IconInfoCircle from '~icons/tabler/alert-circle';
  import { Icon, Tooltip } from '$lib/components';
  import { Button, Modal } from '$lib/components/v2';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  export let open = false;
</script>

<Modal
  actionStyle={css.raw({ borderStyle: 'none', paddingTop: '0', padding: '20px' })}
  titleStyle={css.raw({ justifyContent: 'center', marginX: '32px' })}
  bind:open
>
  <svelte:fragment slot="title">즉시출금</svelte:fragment>

  <div class={css({ paddingTop: '8px', paddingX: '20px' })}>
    <p>
      창작자님의 출금 요청하신 금액은
      <br />
      <mark class={css({ fontSize: '20px', fontWeight: 'bold', color: 'teal.500' })}>1000원</mark>
      입니다
    </p>

    <div
      class={flex({
        align: 'center',
        gap: '2px',
        marginY: '12px',
        paddingX: '10px',
        paddingY: '8px',
        borderRadius: '6px',
        fontSize: '13px',
        color: 'gray.500',
        backgroundColor: 'gray.50',
      })}
    >
      <span>카카오뱅크 3333-02-000000</span>
      <span>(홍*동)</span>
    </div>

    <dl class={css({ fontSize: '14px' })}>
      <div
        class={flex({
          align: 'center',
          gap: '16px',
          borderBottomWidth: '1px',
          borderColor: 'gray.100',
          paddingX: '10px',
          paddingY: '14px',
        })}
      >
        <dt class={css({ width: '120px' })}>총 출금 금액</dt>
        <dd class={css({ fontWeight: 'semibold' })}>{comma(1_000_000)}원</dd>
      </div>
      <div
        class={flex({
          align: 'center',
          gap: '16px',
          borderBottomWidth: '1px',
          borderColor: 'gray.100',
          paddingX: '10px',
          paddingY: '14px',
        })}
      >
        <dt class={flex({ align: 'center', gap: '2px', width: '120px' })}>
          즉시 출금 수수료
          <Tooltip message="">
            <Icon
              style={css.raw({ size: '16px', color: 'gray.500', transform: 'rotate(180deg)' })}
              icon={IconInfoCircle}
            />
          </Tooltip>
        </dt>
        <dd class={css({ fontWeight: 'semibold' })}>500원</dd>
      </div>
      <div
        class={flex({
          align: 'center',
          gap: '16px',
          borderBottomWidth: '1px',
          borderColor: 'gray.100',
          paddingX: '10px',
          paddingY: '14px',
        })}
      >
        <dt class={css({ width: '120px' })}>최종 지급 금액</dt>
        <dd class={css({ fontWeight: 'semibold' })}>{comma(1_000_000)}원</dd>
      </div>
    </dl>

    <p class={css({ marginBottom: '40px', paddingY: '10px', fontSize: '12px', color: 'gray.500' })}>
      - 즉시출금 금액은 1회 최소 1,000원 이상으로 신청 가능합니다.
      <br />
      - (정산 수수료 500원 발생)
      <br />
      - 정기출금 정산일은 매월 10일이며, 30,000원 이상의 수익금이 발생했을 때 자동으로 출금됩니다.
    </p>
  </div>

  <Button slot="action" style={css.raw({ width: 'full' })}>신청</Button>
</Modal>
