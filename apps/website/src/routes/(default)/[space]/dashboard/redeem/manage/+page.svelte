<script lang="ts">
  import dayjs from 'dayjs';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import IconCoin from '~icons/tabler/coin';
  import { graphql } from '$glitch';
  import { Button, Helmet, Icon, Image } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  $: query = graphql(`
    query SpaceDashboardRedeemManagePage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug

        redeemCodeGroups {
          id
          description
          codeCount
          availableCodeCount
          createdAt
          expiresAt

          post {
            id
            permalink
            publishedAt

            thumbnail {
              id
              ...Image_image
            }

            publishedRevision {
              id
              title
              subtitle
              price
            }
          }
        }

        posts {
          id
          permalink
        }
      }
    }
  `);
</script>

<Helmet description="생성한 리딤코드를 관리해보세요" title="리딤코드 관리" />

<p
  class={css({
    marginTop: { base: '16px', sm: '32px' },
    marginBottom: { base: '8px', sm: '16px' },
    fontSize: '15px',
    color: 'gray.500',
  })}
>
  총 {$query.space.redeemCodeGroups.length}개의 리딤코드
</p>

<ul class={flex({ direction: 'column', gap: '16px' })}>
  {#each $query.space.redeemCodeGroups as group (group.id)}
    <li
      class={css({
        position: 'relative',
        borderWidth: '1px',
        borderColor: 'gray.100',
        paddingX: '14px',
        paddingY: { base: '15px', sm: '14px' },
      })}
    >
      {#if group.availableCodeCount === 0}
        <div
          class={css({
            position: 'absolute',
            inset: '0',
            size: 'full',
            backgroundColor: 'gray.0',
            opacity: '60',
            pointerEvents: 'none',
          })}
        />
      {/if}

      <a
        class={flex({ align: 'center', justify: 'space-between', width: 'full', truncate: true })}
        href="/{$query.space.slug}/dashboard/redeem/manage/{group.id}"
      >
        <div class={flex({ align: 'center', gap: { base: '8px', sm: '12px' }, width: 'full', truncate: true })}>
          <Image
            style={css.raw({ flex: 'none', width: '88px', aspectRatio: '16/10', objectFit: 'cover' })}
            $image={group.post.thumbnail}
            placeholder
            size={96}
          />

          <div class={css({ truncate: true })}>
            <h3 class={css({ fontSize: '14px', fontWeight: 'semibold', color: 'gray.800', truncate: true })}>
              {group.post.publishedRevision?.title ?? '(제목 없음)'}
            </h3>
            <h4 class={css({ fontSize: '13px', color: 'gray.600', height: '19px', truncate: true })}>
              {group.post.publishedRevision?.subtitle ?? ''}
            </h4>
            <div
              class={flex({
                align: 'center',
                gap: '8px',
                marginTop: { base: '3px', sm: '6px' },
                fontSize: '12px',
                color: 'gray.500',
              })}
            >
              <div class={flex({ align: 'center', gap: '2px' })}>
                <Icon icon={IconCoin} />
                <span>{comma(group.post.publishedRevision?.price ?? 0)}원</span>
              </div>

              <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: 'gray.100' })} />

              <time datetime={group.post.publishedAt}>{dayjs(group.post.publishedAt).formatAsDate()}</time>
            </div>
          </div>
        </div>
        <Icon style={css.raw({ color: 'gray.400', hideBelow: 'sm' })} icon={IconChevronRight} size={24} />
      </a>
      <hr class={css({ marginY: '16px', border: 'none', width: 'full', height: '1px', backgroundColor: 'gray.100' })} />

      <dl class={flex({ direction: 'column', gap: '2px' })}>
        <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
          <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>사용가능</dt>
          <dd class={css({ color: 'gray.600' })}>{group.availableCodeCount}/{group.codeCount}</dd>
        </div>
        <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
          <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>생성일</dt>
          <dd class={css({ color: 'gray.600' })}>
            <time datetime={group.createdAt}>{dayjs(group.createdAt).formatAsDateTime()}</time>
          </dd>
        </div>
        <div class={flex({ align: 'center', gap: '12px', fontSize: '13px' })}>
          <dt class={css({ fontWeight: 'semibold', color: 'gray.800', width: '46px' })}>만료일</dt>
          <dd class={css({ color: 'gray.600' })}>
            <time datetime={group.expiresAt}>{dayjs(group.expiresAt).formatAsDateTime()}</time>
          </dd>
        </div>
      </dl>

      <p class={css({ marginTop: '8px', fontSize: '13px', color: 'gray.600', whiteSpace: 'pre-wrap' })}>
        {group.description}
      </p>

      <Button
        style={css.raw({ display: 'block', marginTop: '16px', width: 'full', hideFrom: 'sm' })}
        href="/{$query.space.slug}/dashboard/redeem/manage/{group.id}"
        type="link"
        variant="gray-outline"
      >
        세부사항 보기
      </Button>
    </li>
  {:else}
    <li class={css({ margin: 'auto', paddingY: '60px', fontSize: '14px', color: 'gray.500' })}>
      리딤코드 생성 내역이 없어요
    </li>
  {/each}
</ul>
