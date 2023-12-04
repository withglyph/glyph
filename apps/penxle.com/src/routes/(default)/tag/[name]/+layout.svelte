<script lang="ts">
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { TabHead, TabHeadItem } from '$lib/components/tab';

  $: query = graphql(`
    query TagLayout_Query($name: String!) {
      tag(name: $name) {
        id
        name

        parents {
          id
          name
        }
      }
    }
  `);
</script>

<div class="w-full max-w-200 my-7 flex flex-col grow">
  <div class="bg-gray-70 rounded-t-xl px-6 pt-4 pb-10">
    <div class="flex body-13-m text-disabled mb-2.5">
      {#each $query.tag.parents as parent (parent.id)}
        <span class="after:(content-['|'] mx-2)">{parent.name}</span>
      {/each}
    </div>

    <div class="flex items-start justify-between">
      <div>
        <h1 class="title-24-eb text-darkprimary">{$query.tag.name}</h1>
        <p class="body-13-m text-disabled mt-2">2023.07.27 03:55에 크**님이 마지막으로 수정함</p>
      </div>
      <div class="flex items-center gap-2">
        <Button size="lg">+ 관심</Button>

        <Menu placement="bottom-start">
          <button slot="value" class="i-lc-more-vertical square-6 text-disabled" type="button" />

          <MenuItem>태그 안보기</MenuItem>
          <MenuItem>태그 신고</MenuItem>
        </Menu>
      </div>
    </div>
  </div>

  <div class="py-4 px-6 rounded-xl bg-cardprimary space-y-4 -mt-3 grow">
    <TabHead class="w-full" variant="secondary">
      <TabHeadItem id={1} href={`/tag/${$page.params.name}`}>위키</TabHeadItem>
      <TabHeadItem id={2} href={`/tag/${$page.params.name}/post`}>포스트</TabHeadItem>
      <!-- <TabHeadItem id={3}>스페이스</TabHeadItem> -->
    </TabHead>

    <slot />
  </div>
</div>
