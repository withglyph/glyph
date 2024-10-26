<script lang="ts">
  import IconArrowBarToDown from '~icons/tabler/arrow-bar-to-down';
  import IconCheck from '~icons/tabler/check';
  import IconCopy from '~icons/tabler/copy';
  import { fragment, graphql } from '$glitch';
  import { Button, Icon } from '$lib/components';
  import { RedeemCodeStateString } from '$lib/const/redeem';
  import { isWebView, postFlutterMessage } from '$lib/flutter';
  import { toast } from '$lib/notification';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { RedeemCode_redeem } from '$glitch';

  let _redeem: RedeemCode_redeem;
  export { _redeem as $redeem };

  let copied = false;

  $: redeem = fragment(
    _redeem,
    graphql(`
      fragment RedeemCode_redeem on Redeem {
        id
        state
        formattedCode
        qrCodeUrl
      }
    `),
  );
</script>

<li class={css({ position: 'relative', borderWidth: '1px', borderColor: 'gray.100', padding: '14px' })}>
  {#if $redeem.state !== 'AVAILABLE'}
    <div
      class={css({
        position: 'absolute',
        inset: '0',
        size: 'full',
        backgroundColor: 'gray.0',
        opacity: '80',
        pointerEvents: 'none',
      })}
    />
  {/if}

  <img class={css({ marginBottom: '8px', size: '60px' })} alt="qr-{$redeem.id}" src={$redeem.qrCodeUrl} />
  <div
    class={flex({
      direction: { smDown: 'column' },
      gap: '16px',
      sm: { alignItems: 'flex-end', justifyContent: 'space-between' },
    })}
  >
    <dl class={flex({ direction: 'column', gap: '2px' })}>
      <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
        <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>번호</dt>
        <dd class={flex({ align: 'center', gap: '4px', color: 'gray.600' })}>
          <span>{$redeem.formattedCode}</span>
          <button
            class={css({ padding: '2px', color: 'gray.400', _hover: { backgroundColor: 'gray.50' } })}
            type="button"
            on:click={async () => {
              try {
                navigator.clipboard.writeText($redeem.formattedCode);
                copied = true;

                setTimeout(() => {
                  copied = false;
                }, 1000);
              } catch (err) {
                toast.error('클립보드 복사를 실패했어요');
                console.error(err);
              }
            }}
          >
            <Icon icon={copied ? IconCheck : IconCopy} />
          </button>
        </dd>
      </div>
      <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
        <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>사용여부</dt>
        <dd
          class={css(
            { color: 'gray.600' },
            $redeem.state === 'AVAILABLE' && { fontWeight: 'medium', color: 'brand.400' },
          )}
        >
          {RedeemCodeStateString[$redeem.state]}
        </dd>
      </div>
    </dl>

    {#if $redeem.state === 'AVAILABLE'}
      {#if isWebView()}
        <Button
          style={flex.raw({ align: 'center', justify: 'center', gap: '4px', width: { base: 'full', sm: 'fit' } })}
          variant="gray-outline"
          on:click={() => {
            postFlutterMessage({ type: 'redeem:download', href: $redeem.qrCodeUrl });
          }}
        >
          <Icon icon={IconArrowBarToDown} />
          PNG
        </Button>
      {:else}
        <Button
          style={flex.raw({ align: 'center', justify: 'center', gap: '4px', width: { base: 'full', sm: 'fit' } })}
          download="qr-{$redeem.formattedCode}"
          href={$redeem.qrCodeUrl}
          type="link"
          variant="gray-outline"
        >
          <Icon icon={IconArrowBarToDown} />
          PNG
        </Button>
      {/if}
    {/if}
  </div>
</li>
