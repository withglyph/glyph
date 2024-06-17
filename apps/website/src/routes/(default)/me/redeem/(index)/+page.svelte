<script lang="ts">
  import qs from 'query-string';
  import IconScan from '~icons/tabler/scan';
  import { graphql } from '$glitch';
  import { Button, Helmet, Icon } from '$lib/components';
  import { TextInput } from '$lib/components/forms';
  import { toast } from '$lib/notification';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  const registerRedeemCode = graphql(`
    mutation RegisterRedeemCodeMutation($input: RegisterRedeemCodeInput!) {
      registerRedeemCode(input: $input) {
        id
      }
    }
  `);

  let code: string;
</script>

<Helmet description="리딤코드를 등록해보세요" title="리딤코드 등록" />

<div
  class={css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: { base: '60px', sm: '68px' },
    paddingBottom: { base: '120px', sm: '140px' },
    textAlign: 'center',
    smDown: { paddingX: '20px' },
  })}
>
  <h2
    class={css({
      marginBottom: '4px',
      fontSize: { base: '24px', sm: '30px' },
      fontWeight: '[800]',
    })}
  >
    리딤코드 등록
  </h2>

  <p class={css({ fontSize: { base: '13px', sm: '14px' }, color: 'gray.600' })}>
    리딤코드는 종이책과 유료포스트를 함께 이용할 수 있게 도와주는 서비스로
    <br />
    해당 코드를 스캔하거나 입력하면
    <mark class={css({ color: 'brand.400' })}>글리프에서 발행한 유료포스트가 자동으로 구매 완료</mark>
    되어 이용할 수 있어요
  </p>

  <form
    class={flex({ align: 'center', marginTop: '40px', width: 'full', maxWidth: '366px' })}
    on:submit|preventDefault={async () => {
      try {
        const { id } = await registerRedeemCode({ code });
        location.href = qs.stringifyUrl({ url: '/me/redeem/complete/', query: { id } });
      } catch (err) {
        if (err instanceof Error) {
          toast.error(err.message);
        }
      }
    }}
  >
    <TextInput
      name="code"
      style={css.raw({ width: 'full' })}
      placeholder="코드를 입력해주세요"
      size="md"
      bind:value={code}
    >
      <Icon slot="left-icon" style={css.raw({ color: 'gray.400' })} icon={IconScan} />
    </TextInput>
    <Button
      style={css.raw({
        flex: 'none',
        outlineWidth: '0',
        borderWidth: '1px',
        borderColor: 'brand.400',
        width: { base: '68px', sm: '86px' },
        height: '44px',
      })}
      loading={$registerRedeemCode.inflight}
      type="submit"
      variant="brand-fill"
    >
      등록
    </Button>
  </form>
</div>
