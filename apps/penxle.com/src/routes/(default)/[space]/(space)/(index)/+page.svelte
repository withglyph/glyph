<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Badge, Button, Image, Tag } from '$lib/components';
  import { humanizeNumber } from '$lib/utils';

  $: query = graphql(`
    query SpacePage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name
        slug

        meAsMember {
          id
        }

        posts {
          id
          contentFilters
          hasPassword
          viewCount
          permalink
          publishedAt

          publishedRevision @_required {
            id
            title
            previewText
            price

            croppedThumbnail {
              id
              ...Image_image
            }

            tags {
              id
              name
            }
          }

          space {
            id
            slug
          }

          member {
            id

            profile {
              id
              name
              ...Avatar_profile
            }
          }
        }
      }
    }
  `);
</script>

<Helmet title={`홈 | ${$query.space.name}`} />

<article
  class={clsx(
    'w-full min-h-11rem max-w-50rem flex flex-col items-center py-9 grow <sm:(p-0 gap-2 bg-surface-primary)',
    $query.space.posts.length === 0 && 'center',
  )}
>
  {#if $query.space.posts.length === 0}
    <div class="flex flex-col center">
      <h2 class="body-15-b text-secondary">아직 스페이스에 업로드된 포스트가 없어요</h2>
      {#if $query.space.meAsMember}
        <Button class="mt-5 sm:hidden" href={`/editor?space=${$query.space.slug}`} size="lg" type="link">
          포스트 작성하기
        </Button>
        <Button class="mt-5 <sm:hidden" href={`/editor?space=${$query.space.slug}`} size="xl" type="link">
          포스트 작성하기
        </Button>
      {/if}
    </div>
  {/if}

  <ul class="space-y-8">
    {#each $query.space.posts as post (post.id)}
      <li class="w-full border border-secondary rounded-2xl py-4 px-6 bg-cardprimary max-w-50rem">
        <a class="space-y-2" href={`/${post.space.slug}/${post.permalink}`}>
          <div class="truncate flex items-center gap-3">
            <h2 class="title-20-b truncate grow">{post.publishedRevision?.title}</h2>

            <div class="flex gap-1">
              {#if post.publishedRevision?.price}
                <Badge class="w-fit" color="purple">유료</Badge>
              {/if}
              {#if post.contentFilters.length > 0}
                {#if post.contentFilters.includes('ADULT')}
                  <Badge class="w-fit" color="red">성인물</Badge>
                {/if}
                {#if !post.contentFilters.includes('ADULT')}
                  <Badge class="w-fit" color="orange">트리거 주의</Badge>
                {/if}
              {/if}
              {#if post.hasPassword}
                <Badge class="w-fit" color="gray">비밀글</Badge>
              {/if}
            </div>
          </div>
          <p class="body-13-m text-secondary">{post.member.profile.name} · 조회수 {humanizeNumber(post.viewCount)}</p>

          <div class="flex justify-between gap-3">
            <div class="body-14-m text-secondary break-all line-clamp-4 whitespace-pre-line">
              {post.publishedRevision?.previewText}
            </div>

            {#if post.publishedRevision?.croppedThumbnail}
              <Image
                class="square-30 rounded-md flex-none sm:aspect-square"
                $image={post.publishedRevision.croppedThumbnail}
              />
            {/if}
          </div>
        </a>
        <div class="flex justify-between items-center gap-3 mt-2">
          {#if post.publishedRevision?.tags}
            <div class="flex gap-1.5">
              {#each post.publishedRevision.tags.slice(0, 4) as tag (tag.id)}
                <Tag href={`tag/${tag.name}`} size="sm">#{tag.name}</Tag>
              {/each}
              {#if post.publishedRevision.tags.length > 4}
                <Tag size="sm">+{post.publishedRevision.tags.length - 4}개의 태그</Tag>
              {/if}
            </div>
          {/if}

          <time class="body-13-m text-secondary">{dayjs(post.publishedAt).formatAsDate()}</time>
        </div>
      </li>
    {/each}
  </ul>
</article>
