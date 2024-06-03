<script lang="ts">
  import IconCheck from '~icons/tabler/check';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import ChallengeTitle from '$assets/icons/challenge-202406-1.svg?component';
  import CompactLogo from '$assets/logos/compact.svg?component';
  import { graphql } from '$glitch';
  import { Helmet, Icon } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import Post from '../Post.svelte';

  $: query = graphql(`
    query FeedChallengePage_Query {
      recommendFeed {
        id
        ...Feed_Post_post
      }

      ...Feed_Post_query
    }
  `);
</script>

<Helmet description="진행 중인 챌린지를 확인하고 참여해보세요" title="챌린지 피드" />

<div
  class={css({
    paddingY: '14px',
    paddingX: '16px',
    bgGradient: 'to-r',
    gradientFrom: '[#B597F6]',
    gradientTo: '[#8364E8]',
    textAlign: 'center',
  })}
>
  <span class={css({ marginRight: '14px', fontSize: '14px', fontWeight: 'semibold', color: 'gray.0' })}>
    참여만 해도 2,000P 지급
  </span>
  <a class={css({ fontSize: '12px', color: 'gray.0', textDecoration: 'underline' })} href="/">자세히보기</a>
</div>

<div
  class={css({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    marginX: 'auto',
    paddingX: '20px',
    width: 'full',
    maxWidth: '900px',
  })}
>
  <div
    class={center({
      flexDirection: 'column',
      paddingY: '32px',
      backgroundColor: '[#f7f7f7]',
      smDown: { paddingX: '20px', marginX: '-20px' },
      sm: { marginTop: '24px', borderWidth: '1px', borderColor: 'gray.100' },
    })}
  >
    <div class={css({ width: 'full', maxWidth: '389px' })}>
      <div class={css({ textAlign: 'center', height: { base: '25px', sm: '30px' } })}>
        <ChallengeTitle class={css({ height: { base: '25px', sm: '30px' } })} />
      </div>

      <ul class={flex({ align: 'center', justify: 'space-between', marginTop: '24px', marginBottom: '32px' })}>
        <li>
          <div
            class={center({
              position: 'relative',
              borderWidth: '2px',
              borderColor: 'brand.400',
              borderRadius: 'full',
              backgroundColor: '[#F2EEFF]',
              size: '60px',
            })}
          >
            <CompactLogo class={css({ color: 'brand.400', width: '1/4' })} />
            <div
              class={css({
                position: 'absolute',
                bottom: '0',
                right: '0',
                borderRadius: 'full',
                padding: '4px',
                backgroundColor: 'brand.400',
              })}
            >
              <Icon style={css.raw({ color: 'gray.0' })} icon={IconCheck} size={12} />
            </div>
          </div>

          <dl class={css({ marginTop: '8px', textAlign: 'center' })}>
            <dt class={css({ fontSize: '12px', fontWeight: 'semibold', color: 'gray.600' })}>6월 1주차</dt>
            <dd class={css({ fontSize: '11px', color: '[#818181]' })}>06.03-06.09</dd>
          </dl>
        </li>
        <li>
          <div
            class={center({
              borderWidth: '1px',
              borderColor: '[#d1d1d1]',
              borderStyle: 'dashed',
              borderRadius: 'full',
              backgroundColor: 'gray.100',
              size: '60px',
            })}
          >
            <CompactLogo class={css({ color: 'gray.300', width: '1/4' })} />
          </div>

          <dl class={css({ marginTop: '8px', textAlign: 'center' })}>
            <dt class={css({ fontSize: '12px', fontWeight: 'semibold', color: 'gray.600' })}>6월 2주차</dt>
            <dd class={css({ fontSize: '11px', color: '[#818181]' })}>06.10-06.16</dd>
          </dl>
        </li>
        <li>
          <div
            class={center({
              borderWidth: '1px',
              borderColor: '[#d1d1d1]',
              borderStyle: 'dashed',
              borderRadius: 'full',
              backgroundColor: 'gray.100',
              size: '60px',
            })}
          >
            <CompactLogo class={css({ color: 'gray.300', width: '1/4' })} />
          </div>

          <dl class={css({ marginTop: '8px', textAlign: 'center' })}>
            <dt class={css({ fontSize: '12px', fontWeight: 'semibold', color: 'gray.600' })}>6월 3주차</dt>
            <dd class={css({ fontSize: '11px', color: '[#818181]' })}>06.17-06.23</dd>
          </dl>
        </li>
        <li>
          <div
            class={center({
              borderWidth: '1px',
              borderColor: '[#d1d1d1]',
              borderStyle: 'dashed',
              borderRadius: 'full',
              backgroundColor: 'gray.100',
              size: '60px',
            })}
          >
            <CompactLogo class={css({ color: 'gray.300', width: '1/4' })} />
          </div>

          <dl class={css({ marginTop: '8px', textAlign: 'center' })}>
            <dt class={css({ fontSize: '12px', fontWeight: 'semibold', color: 'gray.600' })}>6월 4주차</dt>
            <dd class={css({ fontSize: '11px', color: '[#818181]' })}>06.24-06.30</dd>
          </dl>
        </li>
      </ul>

      <Button
        style={flex.raw({ align: 'center', justify: 'center', gap: '4px', backgroundColor: 'gray.0', width: 'full' })}
        variant="gray-outline"
      >
        참여하기
        <Icon icon={IconChevronRight} />
      </Button>
    </div>
  </div>

  <ul class={flex({ direction: 'column', flexGrow: '1' })}>
    {#each $query.recommendFeed as post (post.id)}
      <li
        class={css({
          '& + &': { borderTopWidth: '1px', borderColor: 'gray.50' },
        })}
      >
        <Post $post={post} {$query} showBookmark showDate showSpace timeDisplay="relative" />
      </li>
    {:else}
      <li class={css({ marginY: 'auto', fontWeight: 'semibold', color: 'gray.400', textAlign: 'center' })}>
        아직 작성된 포스트가 없어요. 챌린지에 참여해보세요
      </li>
    {/each}
  </ul>
</div>
