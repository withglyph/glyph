<script lang="ts">
  import dayjs from 'dayjs';
  import { fragment, graphql } from '$glitch';
  import { Avatar, Image, Tag } from '$lib/components';
  import { TiptapRenderer } from '$lib/tiptap/components';
  import type { Feed_post } from '$glitch';

  let _post: Feed_post;
  export { _post as $post };

  export let showSpaceInfo = false;

  $: post = fragment(
    _post,
    graphql(`
      fragment Feed_post on Post {
        id
        permalink

        revision {
          id
          title
          content
          createdAt

          thumbnail {
            id

            image {
              id
              ...Image_image
            }
          }
        }

        space {
          id
          slug
          name

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
            ...Avatar_profile
          }
        }
      }
    `),
  );
</script>

{#if showSpaceInfo}
  <div class="mt-2 flex items-center gap-3 pl-6 pr-3 mb-4 sm:p-0">
    <div class="relative">
      <Image class="square-10.5 rounded-3.5" $image={$post.space.icon} />
      <Avatar
        class="square-6 absolute border border-bg-primary -right-1 -bottom-1 <sm:hidden"
        $profile={$post.member.profile}
      />
    </div>
    <div class="grow flex flex-col">
      <p class="mb-0.5 body-15-b sm:hidden">{$post.space.name} · {$post.member.profile.name}</p>
      <p class="mb-0.5 body-15-b <sm:hidden">
        {$post.member.profile.name}님이 {$post.space.name}에
        <mark class="text-purple-50">유료글</mark>
        을 게시했어요
      </p>
      <time class="body-13-m text-secondary">{dayjs($post.revision.createdAt).formatAsDate()}</time>
    </div>
    <button type="button">
      <i class="i-lc-more-vertical square-6 text-secondary" />
    </button>
  </div>
{/if}

<a
  class="flex flex-col gap-2 w-full py-3 px-6 bg-cardprimary sm:(py-6 border border-secondary rounded-2xl)"
  href={`/${$post.space.slug}/${$post.permalink}`}
>
  <h2 class="title-20-eb">{$post.revision.title}</h2>
  <article class="flex gap-xs justify-between <sm:flex-wrap <sm:flex-col">
    <TiptapRenderer
      class="flex-grow bodylong-16-m text-secondary overflow-hidden line-clamp-6"
      content={$post.revision.content}
    />
    {#if $post.revision.thumbnail}
      <Image class="h-11.25rem sm:aspect-square object-cover rounded-lg" $image={$post.revision.thumbnail.image} />
    {/if}
  </article>
  <div>
    <Tag size="sm">#유료</Tag>
    <Tag size="sm">#소설</Tag>
    <Tag size="sm">#사이트</Tag>
  </div>
</a>
