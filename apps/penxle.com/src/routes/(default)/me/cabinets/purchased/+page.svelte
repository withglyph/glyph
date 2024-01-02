<script lang="ts">
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Image } from '$lib/components';

  $: query = graphql(`
    query MeCabinetsPurchasedPage_Query {
      auth(scope: USER)

      me @_required {
        id

        purchasedPosts {
          id
          permalink
          purchasedAt

          space {
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
  `);
</script>

{#each $query.me.purchasedPosts as post (post.id)}
  <li>
    <div class="flex items-center justify-between gap-3 body-14-m text-secondary mb-2">
      <p>
        <time>{dayjs(post.purchasedAt).formatAsDate()}</time>
        <span class="before:(content-['|'] mx-1)">결제됨</span>
      </p>
      <a class="text-right" href={`/${post.space.slug}/purchased/${post.permalink}`}>구매버전 보기</a>
    </div>

    <a
      class="border border-secondary rounded-2xl py-3 px-4 flex items-center gap-4"
      href={`/${post.space.slug}/${post.permalink}`}
    >
      <Image class="square-12.5 rounded-xl flex-none border border-secondary" $image={post.space.icon} />

      <div class="truncate">
        <p class="body-16-eb truncate">{post.purchasedRevision?.title}</p>
        <p class="body-14-m text-secondary truncate">{post.space.name} · {post.member.profile.name}</p>
      </div>
    </a>
  </li>
{:else}
  <p class="text-secondary text-center body-16-m py-10">구매한 포스트가 없어요</p>
{/each}
