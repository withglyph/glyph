<script lang="ts">
  import dayjs from 'dayjs';
  import IconArrowLeft from '~icons/tabler/arrow-left';
  import IconCoin from '~icons/tabler/coin';
  import IconMinus from '~icons/tabler/minus';
  import IconPlus from '~icons/tabler/plus';
  import { goto } from '$app/navigation';
  import { graphql } from '$glitch';
  import { analytics } from '$lib/analytics';
  import { Button, Helmet, Icon, Image } from '$lib/components';
  import { TextArea } from '$lib/components/forms';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  let amount = 1;
  let description = '';

  $: query = graphql(`
    query SpaceDashboardRedeemNextPage_Query($permalink: String!) {
      post(permalink: $permalink) {
        id
        permalink

        space @_required {
          id
          slug
          name
        }

        thumbnail {
          id
          ...Image_image
        }

        publishedRevision {
          id
          title
          subtitle
          price
          createdAt
        }
      }
    }
  `);

  const createRedeemCodeGroup = graphql(`
    mutation CreateRedeemCodeGroupMutation($input: CreateRedeemCodeGroupInput!) {
      createRedeemCodeGroup(input: $input) {
        id
      }
    }
  `);

  const regularizeAmount = (amount: number) => {
    if (Number.isNaN(Number(amount))) {
      return 1;
    } else {
      if (amount < 1) {
        return 1;
      } else if (amount > 999) {
        return 999;
      } else {
        return Math.floor(Number(amount));
      }
    }
  };
</script>

<Helmet
  description={`${$query.post.space.name} 스페이스 리딤코드 생성`}
  title={`리딤코드 생성 | ${$query.post.space.name}`}
/>

<div
  class={flex({
    direction: 'column',
    align: 'center',
    grow: '1',
    bgGradient: 'to-br',
    gradientFrom: '[#FEFEFE]',
    gradientTo: 'gray.50',
    width: 'full',
  })}
>
  <div class={css({ width: 'full', sm: { maxWidth: '860px' } })}>
    <h1
      class={flex({
        align: 'center',
        gap: '8px',
        fontSize: { base: '17px', sm: '24px' },
        fontWeight: { base: 'semibold', sm: 'bold' },
        smDown: { paddingX: '20px', paddingY: '13px' },
        sm: { marginTop: '40px', marginBottom: '34px' },
      })}
    >
      <a href="/{$query.post.space.slug}/dashboard/redeem">
        <Icon style={css.raw({ hideFrom: 'sm' })} icon={IconArrowLeft} size={24} />
        <Icon style={css.raw({ hideBelow: 'sm' })} icon={IconArrowLeft} size={28} />
      </a>
      리딤코드 만들기
    </h1>

    <div
      class={flex({
        align: 'center',
        gap: '6px',
        marginBottom: '16px',
        paddingX: { base: '20px', sm: '32px' },
        smDown: { marginTop: '16px' },
      })}
    >
      <div
        class={center({
          size: '18px',
          fontSize: '11px',
          fontWeight: 'medium',
          color: 'gray.500',
          backgroundColor: 'gray.100',
        })}
      >
        1
      </div>
      <h2 class={css({ fontSize: { sm: '18px' }, fontWeight: 'semibold' })}>유료 포스트 선택</h2>
    </div>

    <div
      class={flex({
        align: 'center',
        gap: { base: '8px', sm: '12px' },
        marginBottom: { base: '24px', sm: '20px' },
        paddingX: { base: '20px', sm: '32px' },
        smDown: { marginTop: '16px' },
      })}
    >
      <Image
        style={css.raw({
          flex: 'none',
          borderWidth: '[0.8px]',
          borderColor: 'gray.100',
          width: { base: '88px', sm: '102px' },
          aspectRatio: '16/10',
          objectFit: 'cover',
        })}
        $image={$query.post.thumbnail}
        placeholder
        size={96}
      />

      <div class={css({ width: 'full', truncate: true })}>
        <h3 class={css({ fontSize: '14px', fontWeight: 'semibold', color: 'gray.800', truncate: true })}>
          {$query.post.publishedRevision?.title ?? '(제목 없음)'}
        </h3>
        <h4 class={css({ fontSize: '13px', color: 'gray.600', height: '19px', truncate: true })}>
          {$query.post.publishedRevision?.subtitle ?? ''}
        </h4>

        <div
          class={flex({
            align: 'center',
            gap: '8px',
            marginTop: '6px',
            fontSize: '12px',
            color: 'gray.500',
          })}
        >
          <div class={flex({ align: 'center', gap: '2px' })}>
            <Icon icon={IconCoin} />
            <span>{comma($query.post.publishedRevision?.price ?? 0)}원</span>
          </div>

          <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: 'gray.100' })} />

          <time datetime={$query.post.publishedRevision?.createdAt}>
            {dayjs($query.post.publishedRevision?.createdAt).formatAsDate()}
          </time>
        </div>
      </div>
    </div>

    <div
      class={css({
        paddingBottom: { base: '60px', sm: '120px' },
        smDown: { paddingTop: '20px', paddingX: '20px', backgroundColor: 'gray.0' },
      })}
    >
      <div
        class={css({ backgroundColor: 'gray.0', sm: { padding: '32px', borderWidth: '1px', borderColor: 'gray.150' } })}
      >
        <div class={flex({ align: 'center', gap: '6px' })}>
          <div
            class={center({
              size: '18px',
              fontSize: '11px',
              fontWeight: 'medium',
              color: 'gray.500',
              backgroundColor: 'gray.100',
            })}
          >
            2
          </div>
          <h2 class={css({ fontSize: { sm: '18px' }, fontWeight: 'semibold' })}>메모</h2>
          <span class={css({ marginLeft: '-4px', fontSize: '12px', color: 'gray.500' })}>(선택)</span>
        </div>

        <TextArea
          style={css.raw({ marginTop: { base: '8px', sm: '16px' } })}
          placeholder="리딤코드를 생성하는 이유 등 간략한 메모를 적을 수 있어요. 이 메모는 나만 확인할 수 있어요"
          rows={4}
          bind:value={description}
        />
      </div>

      <div
        class={css({
          marginTop: { base: '40px', sm: '8px' },
          backgroundColor: 'gray.0',
          sm: { padding: '32px', borderWidth: '1px', borderColor: 'gray.150' },
        })}
      >
        <div class={flex({ align: 'center', gap: '6px' })}>
          <div
            class={center({
              size: '18px',
              fontSize: '11px',
              fontWeight: 'medium',
              color: 'gray.500',
              backgroundColor: 'gray.100',
            })}
          >
            3
          </div>
          <h2 class={css({ fontSize: { sm: '18px' }, fontWeight: 'semibold' })}>발급 갯수</h2>
        </div>
        <p class={css({ marginTop: '2px', fontSize: '13px', color: 'gray.500' })}>
          리딤코드는 한 계정에만 등록할 수 있으며, 중복 사용이 불가능해요. 포스트를 배포할 인원 수만큼 코드를
          발급해주세요
        </p>

        <div
          class={flex({
            align: 'center',
            marginTop: '20px',
            borderWidth: '1px',
            borderColor: 'gray.200',
            width: 'fit',
          })}
        >
          <button
            class={css({ padding: '7px', backgroundColor: 'gray.50', _disabled: { color: 'gray.300' } })}
            disabled={amount <= 1}
            type="button"
            on:click={() => {
              amount = Number.isNaN(Number(amount)) ? 1 : Math.max(amount - 1, 1);
            }}
          >
            <Icon icon={IconMinus} size={20} />
          </button>

          <input
            class={css({
              paddingY: '7px',
              paddingX: '8px',
              fontSize: '14px',
              fontWeight: 'medium',
              textAlign: 'center',
              width: '56px',
            })}
            inputmode="numeric"
            type="text"
            bind:value={amount}
            on:blur={() => {
              regularizeAmount(amount);
            }}
          />

          <button
            class={css({ padding: '7px', backgroundColor: 'gray.50', _disabled: { color: 'gray.300' } })}
            disabled={amount >= 999}
            type="button"
            on:click={() => {
              amount = Number.isNaN(Number(amount)) ? 1 : Math.min(Number(amount + 1), 999);
            }}
          >
            <Icon icon={IconPlus} size={20} />
          </button>
        </div>

        <div class={css({ marginTop: '12px', padding: '14px', backgroundColor: '[#f4f4f4]' })}>
          <p class={css({ fontSize: '13px', fontWeight: 'semibold', color: 'gray.800' })}>유효기간</p>
          <p class={css({ marginTop: '2px', fontSize: '13px', color: 'gray.600' })}>
            리딤코드는 발급 이후 1년간 사용가능해요
          </p>
        </div>
      </div>

      <div
        class={flex({
          align: 'center',
          justify: { sm: 'flex-end' },
          gap: '8px',
          marginTop: '20px',
          smDown: { position: 'sticky', bottom: '0', paddingY: '20px', backgroundColor: 'gray.0', zIndex: '1' },
        })}
      >
        <Button
          style={css.raw({ backgroundColor: 'gray.0', width: 'full', sm: { maxWidth: '160px' } })}
          href="/{$query.post.space.slug}/dashboard/redeem/create"
          type="link"
          variant="gray-outline"
        >
          이전
        </Button>
        <Button
          style={css.raw({ width: 'full', sm: { maxWidth: '160px' } })}
          loading={$createRedeemCodeGroup.inflight}
          type="button"
          variant="brand-fill"
          on:click={async () => {
            if ($createRedeemCodeGroup.inflight) {
              return;
            }

            if (amount !== regularizeAmount(amount)) {
              // 이 경우에는 숫자가 변하는 걸 인지하지 못할 수 있으니 버튼을 다시 누르게 만들어야함
              amount = regularizeAmount(amount);
              return;
            }

            const redeemCodeGroup = await createRedeemCodeGroup({
              postId: $query.post.id,
              count: amount,
              description,
            });
            analytics.track('redeem-code-group:create', { id: redeemCodeGroup.id });
            await goto(`/${$query.post.space.slug}/dashboard/redeem/complete?id=${redeemCodeGroup.id}`);
          }}
        >
          리딤코드 만들기
        </Button>
      </div>
    </div>
  </div>
</div>
