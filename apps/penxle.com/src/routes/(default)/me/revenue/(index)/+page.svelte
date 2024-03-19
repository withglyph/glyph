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

            thumbnail {
              id
              ...Image_image
            }

            publishedRevision @_required {
              id
              title
            }

            space @_required {
              id
              name
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

  const updatePage = () => {
    const stringifiedURL = qs.stringifyUrl({
      url: '/me/revenue',
      query: {
        page: initialPage,
      },
    });

    location.href = stringifiedURL;
  };
</script>

<Helmet description="내 수익을 확인하세요" title="내 수익" />

{#if $query.me.revenues.length > 0}
  <ul>
    {#each $query.me.revenues as revenue (revenue.id)}
      <li
        class={flex({
          gap: '16px',
          borderTopWidth: '1px',
          borderColor: 'gray.100',
          paddingY: '20px',
          _firstOfType: { borderTopWidth: '0' },
        })}
      >
        <svelte:element
          this={revenue.post?.state === 'DELETED' ? 'div' : 'a'}
          class={css({ marginY: '4px' })}
          href={revenue.post?.state === 'DELETED' ? undefined : '/'}
        >
          {#if revenue.post?.thumbnail}
            <Image
              style={css.raw({ flex: 'none', borderRadius: '6px', size: '86px' })}
              $image={revenue.post.thumbnail}
            />
          {:else}
            <svg
              class={css({ flex: 'none', borderRadius: '6px', size: '86px' })}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect fill="#0c0a091a" height="24" width="24" />
              <path
                d="M7.36 3.86c2.3 5.04.42 10.01-.1 11.36-.08.23-.13.36-.11.36a15.7 15.7 0 0 1 9.45 4.6l-1.58-2.74L13 14.07a1.1 1.1 0 1 1 .53-.35l3.53 6.11c-1.4-4.68.63-10.12.63-10.12-6.15-.67-10.33-5.85-10.33-5.85Z"
                fill="#FAFAF9"
              />
            </svg>
          {/if}
        </svelte:element>

        <svelte:element
          this={revenue.post?.state === 'DELETED' ? 'div' : 'a'}
          class={css(
            { display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
            revenue.post?.state === 'DELETED' && { color: 'gray.400' },
          )}
          href={revenue.post?.state === 'DELETED' ? undefined : '/'}
        >
          <div class={flex({ flexDirection: 'column' })}>
            <time
              class={css(
                { fontSize: '12px', fontWeight: 'light', color: 'gray.500' },
                revenue.post?.state === 'DELETED' && { color: 'gray.400' },
              )}
            >
              {dayjs(revenue.createdAt).formatAsDateTime()} 결제
            </time>
            <p class={css({ fontSize: '14px', fontWeight: 'medium' })}>
              {revenue.post?.publishedRevision?.title ?? '(제목 없음)'}
              {#if revenue.post?.state === 'DELETED'}(삭제된 포스트){/if}
            </p>
            <p class={flex({ align: 'center', gap: '4px' })}>
              <span class={css({ fontSize: '14px', fontWeight: 'medium' })}>{revenue.post?.space?.name}</span>
              <span class={css({ fontSize: '12px' })}>by {revenue.post?.member?.profile.name}</span>
            </p>
          </div>
          <p
            class={css(
              { fontWeight: 'semibold', color: 'teal.500' },
              revenue.post?.state === 'DELETED' && { color: 'gray.400' },
            )}
          >
            {comma(revenue.amount)}P
          </p>
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
  <div class={css({ paddingY: '40px', fontWeight: 'semibold', textAlign: 'center', color: 'gray.400' })}>
    아직 수익내역이 없어요
  </div>
{/if}
