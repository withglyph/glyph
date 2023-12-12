<script lang="ts">
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { toast } from '$lib/notification';
  import LoginRequireModal from '../../LoginRequireModal.svelte';

  let loginRequireOpen = false;

  $: query = graphql(`
    query TagLayout_Query($name: String!) {
      me {
        id
      }

      tag(name: $name) {
        id
        name
        followed
        muted

        parents {
          id
          name
        }
      }
    }
  `);

  const followTag = graphql(`
    mutation TagLayout_FollowTag_Mutation($input: FollowTagInput!) {
      followTag(input: $input) {
        id
        followed
      }
    }
  `);

  const unfollowTag = graphql(`
    mutation TagLayout_UnfollowTag_Mutation($input: UnfollowTagInput!) {
      unfollowTag(input: $input) {
        id
        followed
      }
    }
  `);

  const muteTag = graphql(`
    mutation TagLayout_MuteTag_Mutation($input: MuteTagInput!) {
      muteTag(input: $input) {
        id
        muted
      }
    }
  `);

  const unmuteTag = graphql(`
    mutation TagLayout_UnmuteTag_Mutation($input: UnmuteTagInput!) {
      unmuteTag(input: $input) {
        id
        muted
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
        <!-- <p class="body-13-m text-disabled mt-2">2023.07.27 03:55에 크**님이 마지막으로 수정함</p> -->
      </div>
      <div class="flex items-center gap-2">
        {#if $query.tag.followed}
          <Button
            color="secondary"
            size="lg"
            on:click={async () => {
              await unfollowTag({ tagId: $query.tag.id });
              mixpanel.track('tag:unfollow', { tagId: $query.tag.id, via: 'tag' });
              toast.success('관심 태그 해제되었어요');
            }}
          >
            관심 해제
          </Button>
        {:else}
          <Button
            size="lg"
            on:click={async () => {
              if (!$query.me) {
                loginRequireOpen = true;
                return;
              }

              await followTag({ tagId: $query.tag.id });
              mixpanel.track('tag:follow', { tagId: $query.tag.id, via: 'tag' });
              toast.success('관심 태그에 추가했어요');
            }}
          >
            + 관심
          </Button>
        {/if}

        <Menu placement="bottom-start">
          <button slot="value" class="i-lc-more-vertical square-6 text-disabled" type="button" />

          {#if $query.tag.muted}
            <MenuItem
              on:click={async () => {
                await unmuteTag({ tagId: $query.tag.id });
                mixpanel.track('tag:unmute', { tagId: $query.tag.id, via: 'tag' });
                toast.success('태그 숨기기 해제되었어요');
              }}
            >
              태그 안보기 해제
            </MenuItem>
          {:else}
            <MenuItem
              on:click={async () => {
                if (!$query.me) {
                  loginRequireOpen = true;
                  return;
                }

                await muteTag({ tagId: $query.tag.id });
                mixpanel.track('tag:mute', { tagId: $query.tag.id, via: 'tag' });
                toast.success('태그를 숨겼어요');
              }}
            >
              태그 안보기
            </MenuItem>
          {/if}
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

<LoginRequireModal bind:open={loginRequireOpen} />
