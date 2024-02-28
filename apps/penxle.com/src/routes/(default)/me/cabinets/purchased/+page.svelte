<script lang="ts">
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Helmet, Image } from '$lib/components';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  $: query = graphql(`
    query MeCabinetsPurchasedPage_Query {
      auth(scope: USER)

      me @_required {
        id

        purchasedPosts {
          id
          permalink
          purchasedAt

          space @_required {
            id
            slug
            name

            icon {
              id
              ...Image_image
            }
          }

          purchasedRevision {
            id
            title
          }

          member @_required {
            id

            profile {
              id
              name
            }
          }
        }
      }
    }
  `);
</script>

<Helmet description="구매한 포스트 목록을 둘러보세요" title="구매한 포스트" />

{#each $query.me.purchasedPosts as post (post.id)}
  <li>
    <div
      class={flex({
        align: 'center',
        justify: 'space-between',
        gap: '12px',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: 'medium',
        color: 'gray.500',
      })}
    >
      <p>
        <time>{dayjs(post.purchasedAt).formatAsDate()}</time>
        <span class={css({ _before: { content: '|', marginX: '4px' } })}>결제됨</span>
      </p>
      <a class={css({ textAlign: 'right' })} href={`/${post.space?.slug}/purchased/${post.permalink}`}>구매버전 보기</a>
    </div>

    <a
      class={flex({
        align: 'center',
        gap: '16px',
        borderWidth: '1px',
        borderColor: 'gray.200',
        borderRadius: '16px',
        paddingX: '16px',
        paddingY: '12px',
      })}
      href={`/${post.space?.slug}/${post.permalink}`}
    >
      {#if post.space}
        <Image
          style={css.raw({
            flex: 'none',
            borderWidth: '1px',
            borderColor: 'gray.200',
            borderRadius: '12px',
            size: '50px',
          })}
          $image={post.space.icon}
        />
      {/if}

      <div class={css({ truncate: true })}>
        <p class={css({ fontWeight: 'bold', truncate: true })}>{post.purchasedRevision?.title ?? '(제목 없음)'}</p>
        <p class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.500', truncate: true })}>
          {post.space?.name} · {post.member?.profile.name}
        </p>
      </div>
    </a>
  </li>
{:else}
  <p class={css({ paddingY: '40px', fontWeight: 'medium', color: 'gray.500', textAlign: 'center' })}>
    구매한 포스트가 없어요
  </p>
{/each}
