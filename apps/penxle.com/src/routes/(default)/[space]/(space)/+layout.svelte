<script lang="ts">
  import IconLock from '~icons/effit/lock';
  import IconClipboard from '~icons/tabler/clipboard';
  import IconDotsVertical from '~icons/tabler/dots-vertical';
  import IconShare2 from '~icons/tabler/share-2';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, Image, ShareLinkPopover } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { TabHead, TabHeadItem } from '$lib/components/tab';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import LoginRequireModal from '../../LoginRequireModal.svelte';

  let moveToLoginOpen = false;
  let revealMutedSpace = false;

  $: query = graphql(`
    query SpaceLayout_Query($slug: String!) {
      me {
        id
      }

      space(slug: $slug) {
        id
        slug
        name
        muted
        followed
        followerCount
        postCount
        visibility

        myMasquerade {
          id
          blocked
        }

        members {
          id

          profile {
            id
            name
          }
        }

        icon {
          id
          ...Image_image
        }

        meAsMember {
          id
        }
      }
    }
  `);

  const followSpace = graphql(`
    mutation SpaceLayout_FollowSpace_Mutation($input: FollowSpaceInput!) {
      followSpace(input: $input) {
        id
        followed
        followerCount
      }
    }
  `);

  const unfollowSpace = graphql(`
    mutation SpaceLayout_UnfollowSpace_Mutation($input: UnfollowSpaceInput!) {
      unfollowSpace(input: $input) {
        id
        followed
        followerCount
      }
    }
  `);

  const muteSpace = graphql(`
    mutation SpaceLayout_MuteSpace_Mutation($input: MuteSpaceInput!) {
      muteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  const unmuteSpace = graphql(`
    mutation SpaceLayout_UnmuteSpace_Mutation($input: UnmuteSpaceInput!) {
      unmuteSpace(input: $input) {
        id
        muted
      }
    }
  `);
</script>

<main
  class={flex({
    direction: 'column',
    align: 'center',
    grow: '1',
    paddingBottom: { base: '96px', sm: '120px' },
    width: 'full',
    background: 'gray.5',
  })}
>
  <div class={css({ backgroundColor: 'gray.50', width: 'full', height: { base: '100px', sm: '180px' } })} />

  <div class={css({ paddingX: '20px', width: 'full' })}>
    <div class={flex({ direction: 'column', flexGrow: '1', marginX: 'auto', width: 'full', maxWidth: '860px' })}>
      <div
        class={flex({
          marginBottom: { base: '10px', sm: '32px' },
          smDown: { flexDirection: 'column' },
          sm: { gap: '24px' },
        })}
      >
        <Image
          style={css.raw({ size: { base: '100px', sm: '240px' }, marginTop: { base: '-63px', sm: '-60px' } })}
          $image={$query.space.icon}
        />

        <div
          class={css(
            { marginTop: 'auto', smDown: { paddingY: '14px' } },
            $query.space.myMasquerade?.blocked && { color: 'gray.400' },
          )}
        >
          <h1
            class={flex({
              align: 'center',
              gap: '4px',
              fontSize: { base: '20px', sm: '28px' },
              fontWeight: 'bold',
              truncate: true,
            })}
          >
            {$query.space.name}
            {#if $query.space.visibility === 'PRIVATE'}
              <Icon style={css.raw({ hideBelow: 'sm' })} icon={IconLock} size={28} />
              <Icon style={css.raw({ hideFrom: 'sm' })} icon={IconLock} size={24} />
            {/if}
          </h1>
          <p class={css({ fontSize: { base: '14px', sm: '20px' } })}>
            by {$query.space.members[0].profile.name}
          </p>

          <dl
            class={css(
              {
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginTop: { base: '6px', sm: '8px' },
                marginBottom: '20px',
                fontSize: '13px',
                color: 'gray.500',
              },
              $query.space.myMasquerade?.blocked && { color: 'gray.400' },
            )}
          >
            <dt>구독자</dt>
            <dd class={css({ marginRight: '10px' })}>{$query.space.followerCount}명</dd>
            <dt>포스트</dt>
            <dd>{$query.space.postCount}개</dd>
          </dl>

          <div class={flex({ align: 'center', gap: '8px' })}>
            {#if $query.space.meAsMember}
              <Button
                style={css.raw({ width: '96px', height: '37px' })}
                href={`/${$query.space.slug}/dashboard/settings`}
                size="sm"
                type="link"
              >
                스페이스 관리
              </Button>
            {:else if $query.space.followed}
              <Button
                style={css.raw({ width: '96px', height: '37px' })}
                size="sm"
                variant="gray-outline"
                on:click={async () => {
                  await unfollowSpace({ spaceId: $query.space.id });
                  mixpanel.track('space:unfollow', { spaceId: $query.space.id, via: 'space' });
                }}
              >
                구독중
              </Button>
            {:else}
              <Button
                style={css.raw({ width: '96px', height: '37px' })}
                disabled={$query.space.myMasquerade?.blocked}
                size="sm"
                on:click={async () => {
                  if (!$query.me) {
                    moveToLoginOpen = true;
                    return;
                  }

                  await followSpace({ spaceId: $query.space.id });
                  mixpanel.track('space:follow', { spaceId: $query.space.id, via: 'space' });
                }}
              >
                구독
              </Button>
            {/if}

            {#if !$query.space.meAsMember}
              <Menu
                style={center.raw({
                  outlineWidth: '1px',
                  outlineColor: 'gray.200',
                  backgroundColor: { _enabled: { _hover: 'gray.100' } },
                  size: '37px',
                  transition: 'common',
                })}
                disabled={$query.space.myMasquerade?.blocked}
              >
                <Icon slot="value" style={css.raw({ color: 'gray.500' })} icon={IconDotsVertical} />

                {#if $query.space.muted}
                  <MenuItem
                    on:click={async () => {
                      await unmuteSpace({ spaceId: $query.space.id });
                      mixpanel.track('space:unmute', { spaceId: $query.space.id, via: 'space' });
                    }}
                  >
                    스페이스 숨기기 해제
                  </MenuItem>
                {:else}
                  <MenuItem
                    on:click={async () => {
                      await muteSpace({ spaceId: $query.space.id });
                      mixpanel.track('space:mute', { spaceId: $query.space.id, via: 'space' });
                    }}
                  >
                    스페이스 숨기기
                  </MenuItem>
                {/if}
              </Menu>
            {/if}

            <ShareLinkPopover href="{location.origin}/{$query.space.slug}">
              <div class={center({ outlineWidth: '1px', outlineColor: 'gray.200', size: '37px' })}>
                <Icon icon={IconShare2} />
              </div>
            </ShareLinkPopover>
          </div>
        </div>
      </div>

      <TabHead style={css.raw({ fontSize: '16px' })}>
        <TabHeadItem id={1} pathname="/{$query.space.slug}">
          <span>홈</span>
        </TabHeadItem>
        <TabHeadItem id={2} pathname="/{$query.space.slug}/posts">
          <span>포스트</span>
        </TabHeadItem>
        <TabHeadItem id={3} pathname="/{$query.space.slug}/collections">
          <span>컬렉션</span>
        </TabHeadItem>
        <TabHeadItem id={4} pathname="/{$query.space.slug}/about">
          <span>소개</span>
        </TabHeadItem>
      </TabHead>

      {#if $query.space.muted && !revealMutedSpace}
        <div
          class={center({
            flexDirection: 'column',
            flexGrow: '1',
            width: 'full',
            maxWidth: '800px',
            minHeight: '176px',
            fontWeight: 'semibold',
            color: 'gray.400',
            textAlign: 'center',
          })}
        >
          <p>
            해당 스페이스의 내용을 보시겠어요?
            <br />
            스페이스 숨김은 그대로 유지됩니다
          </p>

          <Button
            style={flex.raw({ align: 'center', justify: 'center', gap: '4px', marginTop: '16px', width: '140px' })}
            size="sm"
            variant="cyan-fill"
            on:click={() => (revealMutedSpace = true)}
          >
            <Icon icon={IconClipboard} />
            내용보기
          </Button>
        </div>
      {:else if $query.space.myMasquerade?.blocked}
        <div class={center({ flexDirection: 'column', flexGrow: '1', minHeight: '176px' })}>
          <p class={css({ marginBottom: '4px', fontSize: '24px', fontWeight: 'bold' })}>차단되었습니다</p>
          <p class={css({ color: 'gray.600' })}>{$query.space.name}을 구독하거나 게시물을 볼 수 없습니다</p>
        </div>
      {:else}
        <slot />
      {/if}
    </div>
  </div>
</main>

<LoginRequireModal bind:open={moveToLoginOpen} />
