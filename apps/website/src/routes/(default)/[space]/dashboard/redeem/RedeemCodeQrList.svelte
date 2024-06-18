<script lang="ts">
  import qs from 'query-string';
  import IconArrowBarToDown from '~icons/tabler/arrow-bar-to-down';
  import IconCheck from '~icons/tabler/check';
  import IconCopy from '~icons/tabler/copy';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$glitch';
  import { Button, Icon, Pagination } from '$lib/components';
  import { RedeemCodeStateString } from '$lib/const/redeem';
  import { toast } from '$lib/notification';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import type { RedeemCodeQrList_redeem } from '$glitch';

  let _redeems: RedeemCodeQrList_redeem[];
  export { _redeems as $redeems };

  export let url = '';
  export let codeCount = 0;

  let copied = false;

  $: redeems = fragment(
    _redeems,
    graphql(`
      fragment RedeemCodeQrList_redeem on Redeem {
        id
        state
        formattedCode
        qrCodeUrl
      }
    `),
  );

  let initialPage = Number($page.url.searchParams.get('page')) || 1;

  const updatePage = (currentPage: number) => {
    const stringifiedURL = qs.stringifyUrl({
      url,
      query: {
        page: currentPage,
      },
    });

    location.href = stringifiedURL;
  };
</script>

<ul
  class={flex({
    direction: 'column',
    gap: '8px',
    marginTop: { base: '34px', sm: '16px' },
    width: 'full',
    sm: { maxWidth: '860px' },
  })}
>
  {#each $redeems as code (code.id)}
    <li class={css({ position: 'relative', borderWidth: '1px', borderColor: 'gray.100', padding: '14px' })}>
      {#if code.state !== 'AVAILABLE'}
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

      <img class={css({ marginBottom: '8px', size: '60px' })} alt="qr-{code.id}" src={code.qrCodeUrl} />
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
              <span>{code.formattedCode}</span>
              <button
                class={css({ padding: '2px', color: 'gray.300', _hover: { backgroundColor: 'gray.50' } })}
                type="button"
                on:click={async () => {
                  try {
                    navigator.clipboard.writeText(code.formattedCode);
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
                code.state === 'AVAILABLE' && { fontWeight: 'medium', color: 'brand.400' },
              )}
            >
              {RedeemCodeStateString[code.state]}
            </dd>
          </div>
        </dl>

        {#if code.state === 'AVAILABLE'}
          <Button
            style={flex.raw({ align: 'center', justify: 'center', gap: '4px', width: { base: 'full', sm: 'fit' } })}
            download="qr-{code.formattedCode}"
            href={code.qrCodeUrl}
            type="link"
            variant="gray-outline"
          >
            <Icon icon={IconArrowBarToDown} />
            PNG
          </Button>
        {/if}
      </div>
    </li>
  {/each}
</ul>

<Pagination style={css.raw({ marginTop: '60px' })} {initialPage} onChange={updatePage} totalItems={codeCount} />
