<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { SpaceLayout } from '$lib/layouts';

  $: query = graphql(`
    query SpaceCollectionsPage_Query($slug: String!) {
      ...SpaceLayout_query

      space(slug: $slug) {
        id
        slug
        name

        meAsMember {
          id
        }
      }
    }
  `);
</script>

<Helmet title={`컬렉션 | ${$query.space.name}`} />

<SpaceLayout {$query}>
  <div class="grow min-h-11rem w-full max-w-50rem flex flex-col center items-center <sm:(p-0 gap-2 bg-surface-primary)">
    <div class="flex flex-col center">
      <p class="body-15-b text-secondary">아직 스페이스에 업로드된 컬렉션이 없어요</p>
      {#if $query.space.meAsMember}
        <Button
          class="sm:hidden mt-5"
          href={`/${$query?.space?.slug}/dashboard/posts/collections`}
          size="lg"
          type="link"
        >
          컬렉션 생성하기
        </Button>
        <Button
          class="<sm:hidden mt-5"
          href={`/${$query?.space?.slug}/dashboard/posts/collections`}
          size="xl"
          type="link"
        >
          컬렉션 생성하기
        </Button>
      {/if}
    </div>
  </div>
</SpaceLayout>
