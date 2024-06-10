<script lang="ts">
  import dayjs from 'dayjs';
  import { nanoid } from 'nanoid';
  import IconBank002 from '~icons/glyph/bank-002';
  import IconBank003 from '~icons/glyph/bank-003';
  import IconBank004 from '~icons/glyph/bank-004';
  import IconBank007 from '~icons/glyph/bank-007';
  import IconBank011 from '~icons/glyph/bank-011';
  import IconBank020 from '~icons/glyph/bank-020';
  import IconBank023 from '~icons/glyph/bank-023';
  import IconBank027 from '~icons/glyph/bank-027';
  import IconBank031 from '~icons/glyph/bank-031';
  import IconBank032 from '~icons/glyph/bank-032';
  import IconBank034 from '~icons/glyph/bank-034';
  import IconBank035 from '~icons/glyph/bank-035';
  import IconBank045 from '~icons/glyph/bank-045';
  import IconBank048 from '~icons/glyph/bank-048';
  import IconBank050 from '~icons/glyph/bank-050';
  import IconBank071 from '~icons/glyph/bank-071';
  import IconBank081 from '~icons/glyph/bank-081';
  import IconBank089 from '~icons/glyph/bank-089';
  import IconBank090 from '~icons/glyph/bank-090';
  import IconBank092 from '~icons/glyph/bank-092';
  import IconAlertCircle from '~icons/tabler/alert-circle';
  import IconChevronLeft from '~icons/tabler/chevron-left';
  import IconMinus from '~icons/tabler/minus';
  import { page } from '$app/stores';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Icon, Modal, ProgressBar } from '$lib/components';
  import { FormField, TextInput } from '$lib/components/forms';
  import { banks } from '$lib/const/revenue';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { VerifySettlementIdentitySchema } from '$lib/validations';
  import { css } from '$styled-system/css';
  import { flex, grid } from '$styled-system/patterns';
  import type { ComponentType } from 'svelte';
  import type { MeRevenuePage_VerifySettlementIdentityModal_user } from '$glitch';

  let _user: MeRevenuePage_VerifySettlementIdentityModal_user;
  export { _user as $user };

  export let open = false;

  $: user = fragment(
    _user,
    graphql(`
      fragment MeRevenuePage_VerifySettlementIdentityModal_user on User {
        personalIdentity {
          id
          name
          birthday
        }
      }
    `),
  );

  const { form, data, errors, touched, handleSubmit } = createMutationForm({
    mutation: graphql(`
      mutation MeRevenuePage_VerifySettlementIdentityModal_VerifySettlementIdentity_Mutation(
        $input: VerifySettlementIdentityInput!
      ) {
        verifySettlementIdentity(input: $input) {
          id
        }
      }
    `),
    schema: VerifySettlementIdentitySchema,
    onSuccess: () => {
      mixpanel.track('user:verify-settlement-identity');
      open = false;
    },
  });

  let currPage = 1;

  $: title = {
    1: '계좌인증',
    2: '은행선택',
    3: '입금 계좌번호 확인',
  }[currPage];

  $: disabled = {
    1: !$user.personalIdentity || !$touched.residentRegistrationNumberBack || !$touched.idCardIssuedDate,
    2: !!$errors.bankCode,
    3: !!$errors.bankAccountNumber,
  }[currPage];

  const bankIcons: Record<string, ComponentType> = {
    '002': IconBank002,
    '003': IconBank003,
    '004': IconBank004,
    '007': IconBank007,
    '011': IconBank011,
    '012': IconBank011,
    '020': IconBank020,
    '023': IconBank023,
    '027': IconBank027,
    '031': IconBank031,
    '032': IconBank032,
    '034': IconBank034,
    '035': IconBank035,
    '037': IconBank034,
    '039': IconBank032,
    '045': IconBank045,
    '048': IconBank048,
    '050': IconBank050,
    '071': IconBank071,
    '081': IconBank081,
    '088': IconBank035,
    '089': IconBank089,
    '090': IconBank090,
    '092': IconBank092,
  };

  const handleUserIdentityVerification = () => {
    mixpanel.track('user:personal-identity-verification:start');

    // @ts-expect-error portone 관련 코드
    IMP.init('imp72534540');

    // @ts-expect-error portone 관련 코드
    IMP.certification(
      {
        merchant_uid: nanoid(),
        company: 'Glyph',
        m_redirect_url: `${$page.url.origin}/api/identification/callback`,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (resp: any) => {
        if (resp.error_msg) {
          toast.error(resp.error_msg);
          return;
        }
      },
    );
  };
</script>

<svelte:head>
  <script src="https://cdn.iamport.kr/v1/iamport.js">
  </script>
</svelte:head>

<Modal
  style={css.raw({ paddingTop: '0', minHeight: { base: '332px', sm: '412px' } })}
  actionStyle={css.raw(
    currPage === 2 && {
      borderTopWidth: '1px',
      borderColor: 'gray.100',
    },
  )}
  bind:open
>
  <svelte:fragment slot="title-left">
    {#if currPage > 1}
      <button type="button" on:click={() => (currPage -= 1)}>
        <Icon icon={IconChevronLeft} size={24} />
      </button>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="title">{title}</svelte:fragment>

  <div class={css({ marginX: '-20px' })}>
    <ProgressBar max={3} value={currPage} />
  </div>

  <form class={flex({ flexDirection: 'column', flexGrow: '1' })} use:form>
    <div
      class={css(
        { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: '1' },
        currPage !== 1 && { display: 'none' },
      )}
    >
      <div class={css({ marginY: '20px' })}>
        <div class={flex({ align: 'flex-end', paddingBottom: '18px' })}>
          <label class={css({ flexGrow: '1', display: 'inline-block', marginBottom: '6px', fontSize: '14px' })}>
            이름
            <div class={flex({ align: 'center', marginTop: '6px', height: '46px' })}>
              <input
                class={css({
                  padding: '14px',
                  fontSize: '14px',
                  backgroundColor: 'gray.100',
                  width: 'full',
                  lineHeight: 'none',
                })}
                placeholder={$user.personalIdentity ? '' : '본인인증을 먼저 진행해주세요'}
                readonly
                type="text"
                value={$user.personalIdentity?.name ?? ''}
              />
            </div>
          </label>

          <Button
            style={css.raw({ marginBottom: '6px', width: '113px', height: '46px', flex: 'none' })}
            disabled={!!$user.personalIdentity}
            on:click={() => {
              if (!$user.personalIdentity) handleUserIdentityVerification();
            }}
          >
            {$user.personalIdentity ? '본인인증완료' : '본인인증'}
          </Button>
        </div>

        <div class={flex({ align: 'center', gap: '5px' })}>
          <FormField name="" style={css.raw({ flexGrow: '1' })} label="주민등록번호">
            <TextInput disabled maxlength={7} value={dayjs($user.personalIdentity?.birthday).format('YYMMDD')} />
          </FormField>
          <Icon icon={IconMinus} />
          <FormField
            name="residentRegistrationNumberBack"
            style={css.raw({ flexGrow: '1', marginTop: '26px' })}
            hideLabel
            label="주민등록번호 뒷자리"
          >
            <TextInput disabled={!$user.personalIdentity} maxlength={7} placeholder="뒤 7자리" type="password" />
          </FormField>
        </div>

        <FormField name="idCardIssuedDate" label="주민등록증 발급일자">
          <TextInput
            disabled={!$user.personalIdentity}
            max={dayjs(new Date()).format('YYYY.MM.DD')}
            maxlength={10}
            placeholder="예) 2024.01.01"
            on:input={(e) => {
              if (e.currentTarget.value.length === 10) {
                e.currentTarget.blur();
              }
            }}
            on:keydown={(e) => {
              if (e.key === 'Backspace') return;

              if (e.currentTarget.value.length === 4 || e.currentTarget.value.length === 7) {
                e.currentTarget.value += '.';
              }
            }}
          />
        </FormField>

        <p class={css({ fontSize: '12px', color: 'gray.500' })}>
          글리프에서 발생한 수익에 대한 부가가치세 신고를 하기 위해 꼭 필요한 정보예요. 제출하신 정보는 안전하게
          암호화된 이후 세무 신고에 사용되고, 이용 목적을 달성한 이후 개인정보처리방침에 따라 파기돼요.
        </p>
      </div>
    </div>

    <div
      class={css(
        { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: '1' },
        currPage !== 2 && { display: 'none' },
      )}
    >
      <div
        class={grid({
          columns: 2,
          gap: '10px',
          paddingTop: '16px',
        })}
      >
        {#each Object.entries(banks) as [code, name] (code)}
          <button
            class={css({
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderWidth: '1px',
              borderColor: 'gray.100',
              paddingX: '10px',
              paddingY: '12px',
              fontSize: '14px',
              backgroundColor: { _hover: 'gray.100', _pressed: 'gray.100' },
              transition: 'common',
            })}
            aria-pressed={$data.bankCode === code}
            type="button"
            on:click={() => ($data.bankCode = code)}
          >
            <Icon icon={bankIcons[code]} size={24} />
            {name}
          </button>
        {/each}
      </div>
    </div>

    <div
      class={css(
        {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexGrow: '1',
          marginY: '16px',
          paddingTop: '8px',
        },
        currPage !== 3 && { display: 'none' },
      )}
    >
      <button
        class={flex({
          align: 'center',
          gap: '6px',
          marginBottom: '24px',
          padding: '8px',
          fontSize: '13px',
          fontWeight: 'medium',
          backgroundColor: 'gray.50',
          width: 'fit',
        })}
        type="button"
        on:click={() => (currPage = 2)}
      >
        <Icon icon={bankIcons[$data.bankCode]} />
        {banks[$data.bankCode]}
      </button>

      <FormField name="bankAccountNumber" label="계좌번호">
        <TextInput placeholder="'-'를 제외한 계좌번호를 입력해주세요" />
      </FormField>

      {#if $data.bankCode === '012' || $data.bankCode === '011'}
        <p class={flex({ align: 'center', gap: '2px', fontSize: '13px', color: 'brand.400' })}>
          <Icon style={css.raw({ fontSize: '14px' })} icon={IconAlertCircle} />
          중앙농협은행인지 지역농축협은행인지 다시 한 번 확인해주세요
        </p>
      {/if}
    </div>
  </form>

  <div slot="action" class={css({ width: 'full' })}>
    <p
      class={css({ marginBottom: '20px', fontSize: '12px', color: 'gray.500' }, currPage !== 3 && { display: 'none' })}
    >
      수익금이 입금될 본인 명의의 계좌번호를 입력해주세요
    </p>
    <Button
      slot="action"
      style={css.raw({ width: 'full' })}
      {disabled}
      size="lg"
      variant={currPage === 3 ? 'gradation-fill' : 'gray-primary-fill'}
      on:click={() => {
        handleSubmit();
        if ($errors.residentRegistrationNumberBack || $errors.idCardIssuedDate || currPage === 3) return;

        currPage += 1;
      }}
    >
      {currPage === 3 ? '완료' : '다음'}
    </Button>
  </div>
</Modal>
