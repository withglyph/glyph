<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import clsx from 'clsx';
  import { graphql } from '$glitch';
  import { Button, Feed } from '$lib/components';

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

          ...Feed_post
        }
      }
    }
  `);
</script>

<Helmet title={`홈 | ${$query.space.name}`} />

<article
  class={clsx(
    'w-full min-h-11rem max-w-50rem flex flex-col items-center py-9 gap-8 grow <sm:(p-0 gap-2 bg-surface-primary)',
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

  {#each $query.space.posts as post (post.id)}
    <Feed $post={post} />
  {/each}
</article>
