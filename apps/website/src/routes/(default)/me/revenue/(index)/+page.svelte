<script lang="ts">
  import dayjs from 'dayjs';
  import qs from 'query-string';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Helmet, Image, Pagination } from '$lib/components';
  import { comma } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  $: query = graphql(`
    query MeRevenuePage_Query($page: Int! = 1, $take: Int! = 10) {
      auth(scope: USER)

      me @_required {
        id

        revenues(page: $page, take: $take) {
          id
          amount
          createdAt

          post {
            id
            state
            permalink

            thumbnail {
              id
              ...Image_image
            }

            publishedRevision @_required {
              id
              title
              subtitle
            }

            space {
              id
              name
              slug

              icon {
                id
                ...Image_image
              }
            }

            member {
              id

              profile {
                id
                name
              }
            }
          }
        }
      }
    }
  `);

  let initialPage = Number($page.url.searchParams.get('page')) || 1;

  const updatePage = (currentPage: number) => {
    const stringifiedURL = qs.stringifyUrl({
      url: '/me/revenue',
      query: {
        page: currentPage,
      },
    });

    location.href = stringifiedURL;
  };
</script>

<Helmet description="수익 내역을 확인하세요" title="수익 내역" />

{#if $query.me.revenues.length > 0}
  <ul>
    {#each $query.me.revenues as revenue (revenue.id)}
      <li
        class={css({
          borderTopWidth: '1px',
          borderColor: 'gray.100',
          paddingY: { base: '20px', sm: '24px' },
          _firstOfType: { borderTopWidth: '0', paddingTop: '8px' },
        })}
      >
        <svelte:element
          this={revenue.post?.state === 'DELETED' ? 'div' : 'a'}
          class={css(
            {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: { base: '14px', sm: '80px' },
            },
            revenue.post?.state === 'DELETED' && { color: 'gray.400' },
          )}
          href={revenue.post?.state === 'DELETED'
            ? undefined
            : `/${revenue.post?.space?.slug}/${revenue.post?.permalink}}`}
        >
          <div class={flex({ flexDirection: 'column', truncate: true })}>
            <div class={flex({ align: 'center', marginBottom: '2px', fontSize: '12px', wrap: 'wrap' })}>
              <time
                class={css(
                  {
                    color: 'gray.500',
                  },
                  revenue.post?.state === 'DELETED' && { color: 'gray.400' },
                )}
                datetime={revenue.createdAt}
              >
                {dayjs(revenue.createdAt).formatAsDateTime()} 판매
              </time>
              <hr
                class={css({
                  border: 'none',
                  marginX: '4px',
                  width: '1px',
                  height: '10px',
                  backgroundColor: 'gray.400',
                })}
              />
              <p
                class={css(
                  {
                    fontWeight: 'semibold',
                    color: 'brand.400',
                  },
                  revenue.post?.state === 'DELETED' && { color: 'gray.400' },
                )}
              >
                {comma(revenue.amount)}P
              </p>
            </div>
            <p class={css({ fontSize: { base: '14px', sm: '15px' }, fontWeight: 'semibold', truncate: true })}>
              {revenue.post?.publishedRevision?.title ?? '(제목 없음)'}
              {#if revenue.post?.state === 'DELETED'}(삭제된 포스트){/if}
            </p>
            <p
              class={css({
                fontSize: '13px',
                fontWeight: { sm: 'medium' },
                color: 'gray.600',
                height: '19px',
                truncate: true,
              })}
            >
              {revenue.post?.publishedRevision?.subtitle ?? ''}
            </p>
            <div class={flex({ align: 'center', gap: '4px', marginTop: '6px', truncate: true })}>
              <Image
                style={css.raw({ flex: 'none', size: '18px' })}
                $image={revenue.post?.space?.icon}
                placeholder
                size={24}
              />

              <p class={flex({ align: 'center', gap: '4px', fontSize: '12px', truncate: true })}>
                {revenue.post?.space?.name ?? '스페이스'} by {revenue.post?.member?.profile.name ?? '작성자'}
              </p>
            </div>
          </div>

          <Image
            style={css.raw({ flex: 'none', width: { base: '100px', sm: '150px' }, aspectRatio: '16/10' })}
            $image={revenue.post?.thumbnail}
            placeholder
            size={128}
          />
        </svelte:element>
      </li>
    {/each}
  </ul>

  <Pagination
    style={css.raw({ marginTop: '32px', paddingBottom: '0' })}
    {initialPage}
    onChange={updatePage}
    totalItems={$query.me.revenues.length}
  />
{:else}
  <div class={css({ paddingY: '60px', fontSize: '14px', textAlign: 'center', color: 'gray.500' })}>
    수익내역이 없어요
  </div>
{/if}
