<script lang="ts">
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { fragment, graphql } from '$glitch';
  import { Badge, Image, Tag } from '$lib/components';
  import { filterToLocaleString } from '$lib/const/feed';
  import { humanizeNumber } from '$lib/utils';
  import type { SpaceFeed_post } from '$glitch';

  let _post: SpaceFeed_post;
  export { _post as $post };

  let _class: string | undefined = undefined;
  export { _class as class };

  $: post = fragment(
    _post,
    graphql(`
      fragment SpaceFeed_post on Post {
        id
        permalink
        blurred
        publishedAt
        contentFilters
        hasPassword
        viewCount
        discloseStats

        tags {
          id

          tag {
            id
            name
          }
        }

        thumbnail {
          id
          ...Image_image
        }

        publishedRevision @_required {
          id
          title
          previewText
          price
        }

        space @_required {
          id
          slug
          name

          icon {
            id
            ...Image_image
          }
        }

        member @_required {
          id

          profile {
            id
            name
            ...Avatar_profile
          }
        }
      }
    `),
  );
</script>

<article
  class={clsx(
    'w-full border border-secondary rounded-2xl py-4 px-6 bg-cardprimary max-w-50rem sm:(border border-secondary rounded-2xl transition hover:(border-tertiary shadow-[0_4px_16px_0_rgba(0,0,0,0.25)])) <sm:(border-none rounded-none)',
    _class,
  )}
>
  <a class="space-y-2" href={`/${$post.space.slug}/${$post.permalink}`}>
    <div class="truncate flex items-center gap-3">
      <h2 class="title-20-b truncate grow">{$post.publishedRevision?.title ?? '(제목 없음)'}</h2>

      <div class="flex gap-1">
        {#if $post.publishedRevision?.price}
          <Badge class="w-fit" color="purple">유료</Badge>
        {/if}
        {#if $post.contentFilters.length > 0}
          {#if $post.contentFilters.includes('ADULT')}
            <Badge class="w-fit" color="red">성인물</Badge>
          {/if}
          {#if !$post.contentFilters.includes('ADULT')}
            <Badge class="w-fit" color="orange">트리거 주의</Badge>
          {/if}
        {/if}
        {#if $post.hasPassword}
          <Badge class="w-fit" color="gray">비밀글</Badge>
        {/if}
      </div>
    </div>
    <p class="body-13-m m-t-1! text-secondary">
      {$post.member.profile.name}
      {#if $post.discloseStats}
        · 조회수 {humanizeNumber($post.viewCount)}
      {/if}
    </p>

    <article
      class={clsx('flex gap-xs justify-between rounded-lg <sm:(flex-wrap flex-col)', $post.blurred && 'min-h-33')}
    >
      {#if $post.blurred}
        <header
          class="p-4 rounded-2xl h-full w-full flex flex-col center gap-2.5 items-center bg-primary text-secondary border border-secondary"
          role="alert"
        >
          <i class="i-px-alert-triangle square-6" />
          <p class="body-14-sb text-center">포스트에 민감한 내용이 포함되어 있어요</p>

          <div class="flex flex-wrap gap-2.5">
            <span
              class="px-3 border border-secondary rounded-lg bg-surface-primary text-primary body-13-m h-6 flex items-center"
            >
              {filterToLocaleString[$post.contentFilters[0]]}
            </span>
            {#if $post.contentFilters.length > 1}
              <span
                class="px-3 border border-secondary rounded-lg bg-surface-primary text-primary body-13-m h-6 flex items-center"
              >
                그 외 태그 {$post.contentFilters.length - 1}개
              </span>
            {/if}
          </div>
        </header>
      {:else}
        <p class="grow bodylong-16-m text-secondary break-all line-clamp-4 whitespace-pre-line">
          {$post.publishedRevision.previewText}
        </p>

        {#if $post.thumbnail}
          <Image class="square-30 rounded-md flex-none sm:aspect-square" $image={$post.thumbnail} />
        {/if}
      {/if}
    </article>
  </a>
  <div class="flex justify-between items-center gap-3 mt-2">
    {#if $post.tags}
      <div class="flex gap-1.5 flex-wrap">
        {#each $post.tags.slice(0, 4) as { tag } (tag.id)}
          <Tag class="max-w-65" href={`/tag/${tag.name}`} size="sm">#{tag.name}</Tag>
        {/each}
        {#if $post.tags.length > 4}
          <Tag size="sm">+{$post.tags.length - 4}개의 태그</Tag>
        {/if}
      </div>
    {/if}

    <time class="body-13-m text-secondary whitespace-nowrap" datetime={$post.publishedAt}>
      {dayjs($post.publishedAt).formatAsDate()}
    </time>
  </div>
</article>
