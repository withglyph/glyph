<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { Badge, Image, Tag } from '$lib/components';
  import type { PostItem_post } from '$glitch';

  let _post: PostItem_post;
  export { _post as $post };

  $: post = fragment(
    _post,
    graphql(`
      fragment PostItem_post on Post {
        id
        blurred
        permalink

        publishedRevision @_required {
          id
          price
          previewText

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
          name
          slug
        }

        member {
          id

          profile {
            id
            name
          }
        }
      }
    `),
  );
</script>

<li
  class="border border-secondary rounded-2xl bg-cardprimary py-4 px-6 transition hover:(border-tertiary shadow-[0_4px_16px_0_rgba(0,0,0,0.25)])"
>
  <a href={`/${$post.space.slug}/${$post.permalink}`}>
    <div class="flex flex-wrap gap-1">
      {#if $post.publishedRevision?.price}
        <Badge class="w-fit mb-2" color="purple">유료</Badge>
      {/if}
      {#if $post.blurred}
        <Badge class="w-fit mb-2" color="orange">트리거 주의</Badge>
      {/if}
    </div>

    <div class="flex justify-between gap-4">
      <div>
        <p class="body-15-sb text-secondary">{$post.space.name} · {$post.member.profile.name}</p>
        <p class="title-20-b">제목</p>
        <p class="body-14-m text-secondary break-all line-clamp-2 whitespace-pre-line">
          {$post.publishedRevision?.previewText}
        </p>
      </div>
      {#if $post.publishedRevision?.croppedThumbnail}
        <Image
          class="h-20 w-25 rounded-5 flex-none border border-secondary sm:aspect-square"
          $image={$post.publishedRevision?.croppedThumbnail}
        />
      {/if}
    </div>
  </a>
  {#if $post.publishedRevision?.tags}
    <div class="flex flex-wrap gap-1.5 mt-2">
      {#each $post.publishedRevision?.tags.slice(0, 4) as tag (tag.id)}
        <Tag href={`/tag/${tag.name}`} size="sm">#{tag.name}</Tag>
      {/each}
      {#if $post.publishedRevision?.tags.length > 4}
        <Tag size="sm">+{$post.publishedRevision?.tags.length - 4}개의 태그</Tag>
      {/if}
    </div>
  {/if}
</li>
