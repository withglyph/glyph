<script lang="ts">
  import { graphql } from '$glitch';
  import { Button, Tag } from '$lib/components';
  import { TabContentItem, TabHead, TabHeadItem } from '$lib/components/tab';
  import Footer from '../Footer.svelte';
  import Header from '../Header.svelte';

  $: query = graphql(`
    query SpaceLayout_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name

        meAsMember {
          id
        }
      }

      ...DefaultLayout_Header_query
    }
  `);
</script>

<Header {$query} />

<main class="flex flex-col items-center w-full">
  <div class="flex center w-full border-b">
    <div class="pt-6 px-4 bg-cardprimary w-full max-w-200">
      <div class="flex flex-wrap items-start">
        <div class="w-full sm:(flex items-center) sm:mb-8">
          <div class="flex items-start justify-between">
            <div class="square-15 rounded-2xl bg-black sm:(square-30 rounded-3xl mr-6)" />
            <button
              class="square-9 flex center rounded-xl transition duration-300 hover:bg-primary sm:hidden"
              type="button"
            >
              <span class="i-lc-more-vertical square-6 text-icon-secondary" />
            </button>
          </div>
          <div class="flex items-start justify-between w-full">
            <div class="w-full">
              <div class="my-5 sm:(mt-0 mb-3)">
                <h1 class="title-20-eb mb-2 sm:(title-24-eb mb-3)">{$query.space.name}</h1>
                <div class="flex items-center mb-2">
                  <span class="text-secondary body-16-sb">관심 독자</span>
                  <span class="text-primary ml-2 subtitle-18-b">3</span>
                  <span class="ml-3 text-secondary body-16-sb">포스트</span>
                  <span class="text-primary ml-2 subtitle-18-b">17</span>
                </div>
                <p class="body-15-sb text-secondary">penxle.com/penxle.. 외 2개</p>
              </div>
              <div class="flex flex-wrap gap-2 sm:hidden">
                <Tag>#태그</Tag>
                <Tag>#태그</Tag>
                <Tag>#태그</Tag>
                <Tag>#태그</Tag>
                <Tag>#태그</Tag>
              </div>
              <div class="flex flex-wrap gap-2 <sm:hidden">
                <Tag size="sm">#태그</Tag>
                <Tag size="sm">#태그</Tag>
                <Tag size="sm">#태그</Tag>
                <Tag size="sm">#태그</Tag>
                <Tag size="sm">#태그</Tag>
              </div>
            </div>
            <div class="flex items-center gap-2 <sm:hidden">
              {#if $query.space.meAsMember}
                <Button href={`/${$query.space.slug}/publish/post`} size="md" type="link">포스트 작성</Button>
                <a
                  class="border border-secondary rounded-xl square-9 p-1 flex center transition duration-300 hover:border-primary"
                  href={`/${$query.space.slug}/settings`}
                >
                  <span class="i-lc-settings square-6 text-secondary" />
                </a>
              {:else}
                <Button class="w-full" size="md">+ 관심</Button>
              {/if}
              <button class="square-9 flex center rounded-xl transition duration-300 hover:bg-primary" type="button">
                <span class="i-lc-more-vertical square-6 text-icon-secondary" />
              </button>
            </div>
          </div>
        </div>
        <div class="flex gap-2 w-full mt-6 mb-3 sm:hidden">
          {#if $query.space.meAsMember}
            <Button class="<sm:w-full" href={`/${$query.space.slug}/publish/post`} size="xl" type="link">
              포스트 작성
            </Button>
            <Button
              class="square-12.5"
              color="tertiary"
              href={`/${$query.space.slug}/settings`}
              size="xl"
              type="link"
              variant="outlined"
            >
              <span class="i-lc-settings square-6 text-secondary" />
            </Button>
          {:else}
            <Button class="w-full" size="xl">관심 스페이스 등록하기</Button>
          {/if}
        </div>
      </div>

      <TabHead class="border-none" variant="secondary">
        <TabHeadItem id={1} href="/{$query.space.slug}" variant="secondary">
          <span>홈</span>
        </TabHeadItem>
        <TabHeadItem id={2} href="/{$query.space.slug}/collections" variant="secondary">
          <span>컬렉션</span>
        </TabHeadItem>
        <TabHeadItem id={3} href="/{$query.space.slug}/about" variant="secondary">
          <span>소개</span>
        </TabHeadItem>
      </TabHead>

      <div class="flex center bg-gray-5 sm:bg-cardprimary! min-h-100%">
        <TabContentItem id={1}>
          <div class="flex flex-col center gap-5">
            <span class="text-3.75 font-bold text-secondary">아직 스페이스에 업로드된 포스트가 없어요</span>
            {#if $query.space.meAsMember}
              <Button href={`/${$query.space.slug}/publish/post`} size="lg" type="link">포스트 작성하기</Button>
            {/if}
          </div>
        </TabContentItem>
        <TabContentItem id={2}>컬렉션</TabContentItem>
        <TabContentItem id={3}>소개</TabContentItem>
      </div>
    </div>
  </div>
  <slot />
</main>

<Footer />
