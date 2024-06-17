<script lang="ts">
  import dayjs from 'dayjs';
  import IconSearch from '~icons/glyph/search';
  import IconArrowLeft from '~icons/tabler/arrow-left';
  import IconCoin from '~icons/tabler/coin';
  import { graphql } from '$glitch';
  import { Button, Helmet, Icon, Image } from '$lib/components';
  import { Radio, TextInput } from '$lib/components/forms';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';

  $: query = graphql(`
    query SpaceDashboardRedeemCreatePage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name

        posts(priceCategory: PAID) {
          id
          permalink

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
    }
  `);

  let selectedPost: (typeof $query.space.posts)[number] | null = null;
  let keyword = '';
</script>

<Helmet description={`${$query.space.name} 스페이스 리딤코드 생성`} title={`리딤코드 생성 | ${$query.space.name}`} />

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
      <a href="/{$query.space.slug}/dashboard/redeem">
        <Icon style={css.raw({ hideFrom: 'sm' })} icon={IconArrowLeft} size={24} />
        <Icon style={css.raw({ hideBelow: 'sm' })} icon={IconArrowLeft} size={28} />
      </a>
      리딤코드 만들기
    </h1>

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
            1
          </div>
          <h2 class={css({ fontSize: { sm: '18px' }, fontWeight: 'semibold' })}>유료 포스트 선택</h2>
        </div>

        <p class={css({ marginTop: '2px', marginBottom: '24px', fontSize: '13px', color: 'gray.500' })}>
          리딤코드는 유료 포스트만 생성할 수 있어요
        </p>

        <TextInput
          style={css.raw({ sm: { maxWidth: '340px' } })}
          placeholder="유료 포스트를 검색해주세요"
          size="sm"
          bind:value={keyword}
        >
          <Icon slot="left-icon" style={css.raw({ color: 'gray.400' })} icon={IconSearch} />
        </TextInput>

        <ul class={css({ marginTop: '8px' })}>
          {#each $query.space.posts.filter((post) => post.publishedRevision?.title?.includes(keyword) || post.publishedRevision?.subtitle?.includes(keyword)) as post (post.id)}
            <li class={css({ '& + &': { borderTopWidth: '1px', borderColor: 'gray.50' } })}>
              <Radio
                style={css.raw(
                  { paddingY: '16px', paddingLeft: '12px', cursor: 'pointer' },
                  selectedPost === post && { backgroundColor: '[#FBFBFB]' },
                )}
                checked={selectedPost === post}
                size="sm"
                variant="brand"
                on:change={() => {
                  selectedPost = post;
                }}
              >
                <div class={flex({ align: 'center', gap: '8px', marginLeft: '12px' })}>
                  <Image
                    style={css.raw({
                      flex: 'none',
                      borderWidth: '[0.8px]',
                      borderColor: 'gray.100',
                      width: '88px',
                      aspectRatio: '16/10',
                      objectFit: 'cover',
                    })}
                    $image={post.thumbnail}
                    placeholder
                    size={96}
                  />

                  <div class={css({ width: 'full', truncate: true })}>
                    <h3 class={css({ fontSize: '14px', fontWeight: 'semibold', color: 'gray.800', truncate: true })}>
                      {post.publishedRevision?.title ?? '(제목 없음)'}
                    </h3>
                    <h4 class={css({ fontSize: '13px', color: 'gray.600', height: '19px', truncate: true })}>
                      {post.publishedRevision?.subtitle ?? ''}
                    </h4>

                    <div
                      class={flex({
                        align: 'center',
                        gap: '8px',
                        marginTop: '4px',
                        fontSize: '12px',
                        color: 'gray.400',
                      })}
                    >
                      <div class={flex({ align: 'center', gap: '2px' })}>
                        <Icon icon={IconCoin} />
                        <span>{comma(post.publishedRevision?.price ?? 0)}원</span>
                      </div>

                      <hr class={css({ border: 'none', width: '1px', height: '12px', backgroundColor: 'gray.100' })} />

                      <time datetime={post.publishedRevision?.createdAt}>
                        {dayjs(post.publishedRevision?.createdAt).formatAsDate()}
                      </time>
                    </div>
                  </div>
                </div>
              </Radio>
            </li>
          {:else}
            <li class={css({ paddingY: '77px', fontSize: '15px', color: 'gray.500', textAlign: 'center' })}>
              발행한 유료포스트가 없어요
            </li>
          {/each}
        </ul>
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
        {#if $query.space.posts.length > 0}
          <Button
            style={css.raw({ backgroundColor: 'gray.0', width: 'full', sm: { maxWidth: '160px' } })}
            href="/{$query.space.slug}/dashboard/redeem"
            type="link"
            variant="gray-outline"
          >
            취소
          </Button>
          <Button
            style={css.raw({ width: 'full', sm: { maxWidth: '160px' } })}
            disabled={!selectedPost}
            href="/{$query.space.slug}/dashboard/redeem/next?p={selectedPost?.permalink}"
            type="link"
            variant="brand-fill"
          >
            다음
          </Button>
        {:else}
          <Button
            style={css.raw({ backgroundColor: 'gray.0', width: 'full', sm: { maxWidth: '160px' } })}
            href="/{$query.space.slug}/dashboard/redeem"
            type="link"
            variant="gray-outline"
          >
            돌아가기
          </Button>
        {/if}
      </div>
    </div>
  </div>
</div>
