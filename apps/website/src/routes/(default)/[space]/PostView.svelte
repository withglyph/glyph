<script lang="ts">
  import { getTextBetween } from '@tiptap/core';
  import dayjs from 'dayjs';
  import stringify from 'fast-json-stable-stringify';
  import IconBookmark from '~icons/tabler/bookmark';
  import IconBookmarkFilled from '~icons/tabler/bookmark-filled';
  import IconCheck from '~icons/tabler/check';
  import IconChevronRight from '~icons/tabler/chevron-right';
  import IconDotsVertical from '~icons/tabler/dots-vertical';
  import IconEye from '~icons/tabler/eye';
  import IconMessageCircle from '~icons/tabler/message-circle-2';
  import IconMessageCircleOff from '~icons/tabler/message-circle-off';
  import IconMoodSmile from '~icons/tabler/mood-smile';
  import IconPlus from '~icons/tabler/plus';
  import IconShare2 from '~icons/tabler/share-2';
  import { afterNavigate, goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { AdSense, Alert, Avatar, Chip, Icon, Image, ShareLinkPopover, Tag, Tooltip } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { Button } from '$lib/components/v2';
  import { TextInput } from '$lib/components/v2/forms';
  import { categoryFilter, pairFilter } from '$lib/const/feed';
  import { EmojiPicker } from '$lib/emoji';
  import Emoji from '$lib/emoji/Emoji.svelte';
  import { FormValidationError } from '$lib/errors';
  import { toast } from '$lib/notification';
  import { TiptapRenderer } from '$lib/tiptap/components';
  import { comma, humanizeNumber } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { center, flex, grid } from '$styled-system/patterns';
  import PostCard from '../(feed)/PostCard.svelte';
  import LoginRequireAlert from '../LoginRequireAlert.svelte';
  import AlertText from './AlertText.svelte';
  import Comment from './Comment.svelte';
  import CommentInput from './CommentInput.svelte';
  import SelectionBubbleMenu from './SelectionBubbleMenu.svelte';
  import ShareContent from './ShareContent.svelte';
  import TagManageModal from './TagManageModal.svelte';
  import type { Editor } from '@tiptap/core';
  import type { Post_postRevision, Post_query } from '$glitch';
  import type { SystemStyleObject } from '$styled-system/types';

  let editor: Editor | undefined;
  let loginRequireOpen = false;
  let password = '';
  let openDeletePostWarning = false;
  let blurContent = true;
  let openShareContentModal = false;
  let openTagManageModal = false;

  export let style: SystemStyleObject | undefined = undefined;

  let _query: Post_query;
  export { _query as $query };

  let _postRevision: Post_postRevision;
  export { _postRevision as $postRevision };

  $: query = fragment(
    _query,
    graphql(`
      fragment Post_query on Query {
        featureFlags

        me {
          id
          isAdulthood
          allowedAgeRating

          personalIdentity {
            id
          }

          bookmarkGroups {
            id
          }
        }

        post(permalink: $permalink) {
          id
          ...TagManageModal_post

          permalink
          shortlink
          reactionCount
          liked
          viewCount
          unlocked
          blurred
          hasPassword
          receiveFeedback
          discloseStats
          protectContent
          publishedAt
          ageRating
          category
          pairs
          commentCount
          paginationCount: commentCount(pagination: true)
          commentQualification

          tags {
            id
            kind

            tag {
              id
              name
            }
          }

          recommendedPosts {
            id
            permalink
            publishedAt
            ageRating
            hasPassword

            ...Feed_PostCard_post

            tags {
              id
              kind

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
              subtitle
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

          collection {
            id
            name
            count

            thumbnail {
              id
              ...Image_image
            }

            posts {
              id
              permalink

              publishedRevision {
                id
                title
                subtitle
              }
            }
          }

          previousPost {
            id
            permalink

            publishedRevision @_required {
              id
              title
              subtitle
            }
          }

          nextPost {
            id
            permalink

            publishedRevision @_required {
              id
              title
              subtitle
            }
          }

          bookmarkGroups {
            id
          }

          reactions {
            id
            emoji
            mine
          }

          space {
            id
            slug
            name
            description
            muted
            followed

            icon {
              id
              ...Image_image
            }

            meAsMember {
              id
              role
            }

            myMasquerade {
              id
              blocked
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

          postComments: comments(orderBy: LATEST, page: 1, take: 1000) {
            id
            content
            createdAt
            pinned

            profile {
              id
              name
            }

            children {
              id
            }

            ...PostPage_Comment_postComment
          }
        }

        ...PostPage_Comment_query
        ...EmojiPicker_query
        ...CommentInput_query
      }
    `),
  );

  $: postRevision = fragment(
    _postRevision,
    graphql(`
      fragment Post_postRevision on PostRevision {
        id
        title
        subtitle
        content
        createdAt
        paragraphIndent
        paragraphSpacing
        price
      }
    `),
  );

  // $: comments = graphql(`
  //   query Post_Comments($permalink: String!, $orderBy: CommentOrderByKind!, $page: Int!, $take: Int!) @_manual {
  //     post(permalink: $permalink) {
  //       comments(orderBy: $orderBy, page: $page, take: $take) {
  //         id
  //         ...PostPage_Comment_postComment
  //       }
  //     }
  //   }
  // `);

  let page = 2;
  const take = 1000;

  // let _postComments: typeof $query.post.postComments = [];
  let initialize = false;
  // $: postComments = derived(comments, ($comments) => {
  //   return $comments?.post.comments ?? [];
  // });
  $: postComments = $query.post.postComments;

  $: if (!initialize) {
    // _postComments = $query.post.postComments;
    initialize = true;
  }

  const fetchComments = async () => {
    // const refetchedComments = await comments.refetch({
    //   permalink: $query.post.permalink,
    //   orderBy: 'LATEST',
    //   page,
    //   take,
    // });

    // _postComments = [..._postComments, ...refetchedComments.post.comments];
    page += 1;
  };

  $: if (blurContent) {
    blurContent = $query.post.blurred;
  }

  afterNavigate(() => {
    blurContent = $query.post.blurred;
  });

  const muteSpace = graphql(`
    mutation Post_MuteSpace_Mutation($input: MuteSpaceInput!) {
      muteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  const unmuteSpace = graphql(`
    mutation Post_UnmuteSpace_Mutation($input: UnmuteSpaceInput!) {
      unmuteSpace(input: $input) {
        id
        muted
      }
    }
  `);

  const unlockPasswordedPost = graphql(`
    mutation Post_UnlockPasswordedPost_Mutation($input: UnlockPasswordedPostInput!) {
      unlockPasswordedPost(input: $input) {
        id
        unlocked

        publishedRevision {
          id
          content
        }
      }
    }
  `);

  const followSpace = graphql(`
    mutation Post_FollowSpace_Mutation($input: FollowSpaceInput!) {
      followSpace(input: $input) {
        id
        followed
      }
    }
  `);

  const unfollowSpace = graphql(`
    mutation Post_UnfollowSpace_Mutation($input: UnfollowSpaceInput!) {
      unfollowSpace(input: $input) {
        id
        followed
      }
    }
  `);

  const deletePost = graphql(`
    mutation Post_DeletePost_Mutation($input: DeletePostInput!) {
      deletePost(input: $input) {
        id

        space {
          id
          slug
        }
      }
    }
  `);

  const bookmarkPost = graphql(`
    mutation Post_BookmarkPost_Mutation($input: BookmarkPostInput!) {
      bookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);

  const unbookmarkPost = graphql(`
    mutation Post_UnbookmarkPost_Mutation($input: UnbookmarkPostInput!) {
      unbookmarkPost(input: $input) {
        id

        bookmarkGroups {
          id
        }
      }
    }
  `);

  $: triggerTags = $query.post.tags.filter(({ kind }) => kind === 'TRIGGER');
  $: shortLink = `https://glph.to/${$query.post.shortlink}`;
</script>

<article class={css({ flexGrow: '1', paddingX: '20px', width: 'full', backgroundColor: 'gray.5' }, style)}>
  <div
    class={flex({
      direction: 'column',
      marginX: 'auto',
      paddingTop: { base: '20px', sm: '40px' },
      width: 'full',
      maxWidth: '860px',
    })}
  >
    {#if $query.post.collection}
      <a
        class={flex({
          align: 'center',
          gap: '2px',
          marginBottom: { base: '16px', sm: '20px' },
          fontSize: { base: '14px', sm: '16px' },
          color: 'gray.500',
          width: 'fit',
        })}
        href={`/${$query.post.space?.slug}/collections/${$query.post.collection.id}`}
      >
        {$query.post.collection.name}
        <Icon icon={IconChevronRight} />
      </a>
    {/if}

    {#if $postRevision.price}
      <Chip style={css.raw({ marginBottom: '2px', paddingY: '3px', paddingX: '7px', width: 'fit' })} color="blue">
        유료
      </Chip>
    {/if}

    <div class={flex({ justify: 'space-between', align: 'flex-start', gap: '16px' })}>
      <div>
        <h1 class={css({ fontSize: { base: '22px', sm: '28px' }, fontWeight: 'bold', wordBreak: 'break-all' })}>
          {$postRevision.title ?? '(제목 없음)'}
        </h1>
        {#if $postRevision.subtitle}
          <h2 class={css({ marginTop: '2px', fontWeight: 'medium', wordBreak: 'break-all' })}>
            {$postRevision.subtitle}
          </h2>
        {/if}
      </div>

      <Menu placement="bottom-end">
        <Icon slot="value" style={css.raw({ marginTop: '4px', hideFrom: 'sm' })} icon={IconDotsVertical} size={24} />

        {#if $query.post.space?.meAsMember}
          <MenuItem href={`/editor/${$query.post.permalink}`} type="link">수정하기</MenuItem>
          <MenuItem on:click={() => (openDeletePostWarning = true)}>삭제하기</MenuItem>
        {:else}
          <MenuItem
            on:click={async () => {
              if (!$query.post.space) return;

              if ($query.post.space.muted) {
                await unmuteSpace({ spaceId: $query.post.space.id });
                mixpanel.track('space:unmute', { spaceId: $query.post.space.id, via: 'post' });
              } else {
                if (!$query.me) {
                  loginRequireOpen = true;
                  return;
                }

                await muteSpace({ spaceId: $query.post.space.id });
                mixpanel.track('space:mute', { spaceId: $query.post.space.id, via: 'post' });
              }
            }}
          >
            {#if $query.post.space?.muted}
              스페이스 뮤트 해제
            {:else}
              스페이스 뮤트
            {/if}
          </MenuItem>
        {/if}
      </Menu>
    </div>

    <div
      class={flex({
        justify: 'space-between',
        borderBottomWidth: '1px',
        borderBottomColor: 'gray.100',
        paddingY: '20px',
        truncate: true,
      })}
    >
      <div class={flex({ gap: '10px' })}>
        {#if $query.post.space && $query.post.member}
          <a class={css({ position: 'relative', flex: 'none', size: '36px' })} href={`/${$query.post.space.slug}`}>
            <Image
              style={css.raw({
                borderWidth: '[0.8px]',
                marginTop: '2px',
                borderColor: 'gray.100',
                size: '36px',
              })}
              $image={$query.post.space.icon}
              size={48}
            />
            <Avatar
              style={css.raw({
                position: 'absolute',
                right: '-4px',
                bottom: '-4px',
                borderWidth: '[0.8px]',
                borderColor: 'gray.100',
                size: '24px',
              })}
              $profile={$query.post.member.profile}
              size={24}
            />
          </a>
        {:else}
          <div class={css({ position: 'relative', flex: 'none', size: '36px' })}>
            <div class={css({ size: '36px', backgroundColor: 'gray.50' })} />
            <div
              class={css({
                position: 'absolute',
                right: '-4px',
                bottom: '-4px',
                borderRadius: 'full',
                backgroundColor: 'gray.5',
                size: '24px',
              })}
            />
          </div>
        {/if}

        <div class={flex({ direction: 'column', gap: '2px', truncate: true })}>
          <a
            class={flex({ align: 'center', gap: '2px', wrap: 'wrap', truncate: true })}
            href={`/${$query.post.space?.slug}`}
          >
            <span class={css({ fontSize: '14px', truncate: true })}>
              {$query.post.space?.name ?? '스페이스'}
            </span>
            <span class={css({ fontSize: '14px' })}>
              by {$query.post.member?.profile.name ?? '작성자'}
            </span>
          </a>

          <div class={flex({ align: 'center', fontSize: '13px', color: 'gray.500' })}>
            <time datetime={$query.post.publishedAt ?? $postRevision.createdAt}>
              {dayjs($query.post.publishedAt ?? $postRevision.createdAt).formatAsDate()}
            </time>

            {#if $query.post.discloseStats}
              <div
                class={flex({
                  align: 'center',
                  _before: { content: '""', marginX: '8px', width: '1px', height: '12px', backgroundColor: 'gray.100' },
                })}
              >
                <div class={flex({ align: 'center', gap: '2px', marginRight: '6px' })}>
                  <Icon icon={IconEye} />
                  {humanizeNumber($query.post.viewCount)}
                </div>
                <div class={flex({ align: 'center', gap: '2px', marginRight: '6px' })}>
                  <Icon icon={IconMoodSmile} />
                  {humanizeNumber($query.post.reactionCount)}
                </div>
                <div class={flex({ align: 'center', gap: '2px' })}>
                  <Icon style={css.raw({ size: '15px' })} icon={IconMessageCircle} />
                  {humanizeNumber($query.post.commentCount)}
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div class={flex({ align: 'center', gap: '16px', hideBelow: 'sm' })}>
        <ShareLinkPopover href={shortLink}>
          <Icon icon={IconShare2} size={24} />
        </ShareLinkPopover>

        <button
          class={css({
            _hover: {
              '& path': {
                fill: '[currentColor]',
              },
            },
            _pressed: {
              '& path': {
                fill: '[currentColor]',
              },
            },
          })}
          type="button"
          on:click={async () => {
            if ($query.post.bookmarkGroups.length > 0) {
              await unbookmarkPost({ bookmarkGroupId: $query.post.bookmarkGroups[0].id, postId: $query.post.id });
              mixpanel.track('post:unbookmark', { postId: $query.post.id, via: 'post' });
            } else {
              if (!$query.me) {
                loginRequireOpen = true;
                return;
              }

              await bookmarkPost({ postId: $query.post.id });
              mixpanel.track('post:bookmark', { postId: $query.post.id, via: 'post' });
            }
          }}
        >
          {#if $query.post.bookmarkGroups.length > 0}
            <Icon icon={IconBookmarkFilled} size={24} />
          {:else}
            <Icon icon={IconBookmark} size={24} />
          {/if}
        </button>

        <Menu placement="bottom-end">
          <Icon slot="value" icon={IconDotsVertical} size={24} />

          {#if $query.post.space?.meAsMember}
            <MenuItem href={`/editor/${$query.post.permalink}`} type="link">수정하기</MenuItem>
            <MenuItem on:click={() => (openDeletePostWarning = true)}>삭제하기</MenuItem>
          {:else}
            <MenuItem
              on:click={async () => {
                if (!$query.post.space) return;

                if ($query.post.space.muted) {
                  await unmuteSpace({ spaceId: $query.post.space.id });
                  mixpanel.track('space:unmute', { spaceId: $query.post.space.id, via: 'post' });
                } else {
                  if (!$query.me) {
                    loginRequireOpen = true;
                    return;
                  }

                  await muteSpace({ spaceId: $query.post.space.id });
                  mixpanel.track('space:mute', { spaceId: $query.post.space.id, via: 'post' });
                }
              }}
            >
              {#if $query.post.space?.muted}
                스페이스 뮤트 해제
              {:else}
                스페이스 뮤트
              {/if}
            </MenuItem>
          {/if}
        </Menu>
      </div>
    </div>

    {#if !$query.post.hasPassword || $query.post.space?.meAsMember || $query.post.unlocked}
      <div>
        {#if $query.post.space?.myMasquerade?.blocked}
          <AlertText
            description="해당 스페이스의 게시물을 볼 수 없어요"
            title="차단당했습니다"
            titleStyle={css.raw({ color: 'red.600' })}
          />
        {:else if blurContent}
          {#if $query.post.ageRating === 'ALL'}
            <AlertText
              description="해당 포스트에는 민감한 내용이 포함되어 있어요"
              title="보기 전 주의사항"
              {triggerTags}
            >
              <Button
                style={css.raw({ marginTop: '16px', width: '158px', fontSize: '14px', fontWeight: 'semibold' })}
                size="md"
                variant="gray-sub-fill"
                on:click={() => (blurContent = false)}
              >
                보기
              </Button>
            </AlertText>
          {:else if $query.post.ageRating === 'R15'}
            <AlertText
              description={$query.me
                ? $query.me.personalIdentity
                  ? ''
                  : '해당 내용을 감상하려면 본인 인증이 필요해요'
                : '해당 내용을 감상하려면 본인 인증이 필요해요\n 로그인 후 이용해주세요'}
              title="15세 콘텐츠"
              {triggerTags}
            >
              <Button
                style={css.raw({ marginTop: '16px', width: '158px', fontSize: '14px', fontWeight: 'semibold' })}
                size="sm"
                variant="gray-sub-fill"
                on:click={async () => {
                  if (!$query.me) {
                    await goto('/login');
                    return;
                  }

                  if (!$query.me.personalIdentity) {
                    await goto('/me/settings');
                    return;
                  }

                  blurContent = false;
                }}
              >
                {$query.me ? ($query.me.personalIdentity ? '보기' : '본인 인증') : '로그인 및 본인 인증'}
              </Button>
            </AlertText>
          {:else if $query.post.ageRating === 'R19'}
            <AlertText
              description={$query.me
                ? $query.me.personalIdentity
                  ? $query.me.isAdulthood
                    ? ''
                    : '해당 내용은 20세 이상만 열람할 수 있어요'
                  : '해당 내용을 감상하려면 본인 인증이 필요해요'
                : '해당 내용을 감상하려면 본인 인증이 필요해요\n 로그인 후 이용해주세요'}
              title="성인용 콘텐츠"
              {triggerTags}
            >
              <Button
                style={css.raw({ marginTop: '16px', width: '158px', fontSize: '14px', fontWeight: 'semibold' })}
                size="sm"
                variant="gray-sub-fill"
                on:click={async () => {
                  if (!$query.me) {
                    await goto('/login');
                    return;
                  }

                  if (!$query.me.personalIdentity) {
                    await goto('/me/settings');
                    return;
                  }

                  if (!$query.me.isAdulthood) {
                    history.back();
                  }

                  blurContent = false;
                }}
              >
                {$query.me
                  ? $query.me.personalIdentity
                    ? $query.me.isAdulthood
                      ? '보기'
                      : '돌아가기'
                    : '본인 인증'
                  : '로그인 및 본인 인증'}
              </Button>
            </AlertText>
          {/if}
        {:else}
          {#key stringify($postRevision.content)}
            <TiptapRenderer
              style={css.raw({ paddingTop: '20px', paddingBottom: { base: '40px', sm: '60px' } })}
              content={$postRevision.content}
              options={{
                paragraphIndent: $postRevision.paragraphIndent,
                paragraphSpacing: $postRevision.paragraphSpacing,
                protectContent: $query.post.protectContent,
              }}
              bind:editor
            />
          {/key}

          <div class={flex({ align: 'center', justify: 'space-between', gap: { base: '40px', sm: '60px' } })}>
            <div>
              <dl class={flex({ wrap: 'wrap' })}>
                <div
                  class={flex({
                    align: 'center',
                    wrap: 'wrap',
                    marginBottom: '14px',
                    _after: {
                      content: '""',
                      marginX: '10px',
                      marginY: 'auto',
                      width: '1px',
                      height: '8px',
                      backgroundColor: 'gray.200',
                    },
                    _lastOfType: {
                      _after: {
                        display: 'none',
                      },
                    },
                  })}
                >
                  <dt
                    class={css({
                      flex: 'none',
                      marginRight: '8px',
                      fontSize: '14px',
                      fontWeight: 'medium',
                      color: 'gray.500',
                    })}
                  >
                    카테고리
                  </dt>
                  <dd class={flex({})}>
                    <Tag as="div" size="sm">
                      #{categoryFilter[$query.post.category]}
                    </Tag>
                  </dd>
                </div>

                {#if $query.post.pairs.length > 0}
                  <div class={flex({ align: 'center', gap: '4px', wrap: 'wrap', marginBottom: '14px' })}>
                    <dt
                      class={css({
                        flex: 'none',
                        marginRight: '4px',
                        fontSize: '14px',
                        fontWeight: 'medium',
                        color: 'gray.500',
                      })}
                    >
                      페어
                    </dt>
                    {#each $query.post.pairs as pair (pair)}
                      <dd class={flex({})}>
                        <Tag as="div" size="sm">
                          #{pairFilter[pair]}
                        </Tag>
                      </dd>
                    {/each}
                  </div>
                {/if}
              </dl>
              <dl class={flex({ wrap: 'wrap' })}>
                {#if $query.post.tags.some(({ kind }) => kind === 'TITLE')}
                  <div
                    class={flex({
                      align: 'center',
                      gap: '4px',
                      wrap: 'wrap',
                      marginBottom: '14px',
                      _after: {
                        content: '""',
                        marginX: '10px',
                        marginY: 'auto',
                        width: '1px',
                        height: '8px',
                        backgroundColor: 'gray.200',
                      },
                      _lastOfType: {
                        _after: {
                          display: 'none',
                        },
                      },
                    })}
                  >
                    <dt
                      class={css({
                        flex: 'none',
                        marginRight: '4px',
                        fontSize: '14px',
                        fontWeight: 'medium',
                        color: 'gray.500',
                      })}
                    >
                      작품
                    </dt>
                    {#each $query.post.tags as { tag, kind } (tag.id)}
                      {#if kind === 'TITLE'}
                        <dd class={flex({})}>
                          <Tag href={`/tag/${tag.name}`} size="sm">
                            #{tag.name}
                          </Tag>
                        </dd>
                      {/if}
                    {/each}
                  </div>
                {/if}

                {#if $query.post.tags.some(({ kind }) => kind === 'CHARACTER')}
                  <div
                    class={flex({
                      align: 'center',
                      gap: '4px',
                      wrap: 'wrap',
                      marginBottom: '14px',
                      _after: {
                        content: '""',
                        marginX: '10px',
                        marginY: 'auto',
                        width: '1px',
                        height: '8px',
                        backgroundColor: 'gray.200',
                      },
                      _lastOfType: {
                        _after: {
                          display: 'none',
                        },
                      },
                    })}
                  >
                    <dt
                      class={flex({
                        flex: 'none',
                        marginRight: '4px',
                        fontSize: '14px',
                        fontWeight: 'medium',
                        color: 'gray.500',
                      })}
                    >
                      캐릭터
                    </dt>
                    {#each $query.post.tags as { tag, kind } (tag.id)}
                      {#if kind === 'CHARACTER'}
                        <dd class={flex({})}>
                          <Tag href={`/tag/${tag.name}`} size="sm">
                            #{tag.name}
                          </Tag>
                        </dd>
                      {/if}
                    {/each}
                  </div>
                {/if}

                {#if $query.post.tags.some(({ kind }) => kind === 'COUPLING')}
                  <div
                    class={flex({
                      align: 'center',
                      gap: '4px',
                      wrap: 'wrap',
                      marginBottom: '14px',
                      _after: {
                        content: '""',
                        marginX: '10px',
                        marginY: 'auto',
                        width: '1px',
                        height: '8px',
                        backgroundColor: 'gray.200',
                      },
                      _lastOfType: {
                        _after: {
                          display: 'none',
                        },
                      },
                    })}
                  >
                    <dt
                      class={flex({
                        flex: 'none',
                        marginRight: '4px',
                        fontSize: '14px',
                        fontWeight: 'medium',
                        color: 'gray.500',
                      })}
                    >
                      커플링
                    </dt>
                    {#each $query.post.tags as { tag, kind } (tag.id)}
                      {#if kind === 'COUPLING'}
                        <dd class={flex({})}>
                          <Tag href={`/tag/${tag.name}`} size="sm">
                            #{tag.name}
                          </Tag>
                        </dd>
                      {/if}
                    {/each}
                  </div>
                {/if}

                {#if $query.post.tags.some(({ kind }) => kind === 'EXTRA')}
                  <div class={flex({ align: 'center', gap: '4px', wrap: 'wrap', marginBottom: '14px' })}>
                    <dt
                      class={flex({
                        flex: 'none',
                        marginRight: '4px',
                        fontSize: '14px',
                        fontWeight: 'medium',
                        color: 'gray.500',
                      })}
                    >
                      추가태그
                    </dt>
                    {#each $query.post.tags as { tag, kind } (tag.id)}
                      {#if kind === 'EXTRA'}
                        <dd class={flex({})}>
                          <Tag href={`/tag/${tag.name}`} size="sm">
                            #{tag.name}
                          </Tag>
                        </dd>
                      {/if}
                    {/each}
                  </div>
                {/if}
              </dl>
            </div>

            {#if $query.post.space?.meAsMember}
              <Button
                style={css.raw({ flex: 'none', marginBottom: '14px' })}
                size="xs"
                variant="gray-outline"
                on:click={() => (openTagManageModal = true)}
              >
                태그수정
              </Button>
            {/if}
          </div>
        {/if}
      </div>
    {:else}
      <AlertText description="해당 내용은 비밀번호 입력이 필요해요" title="비밀글">
        <form
          class={flex({ marginTop: '14px' })}
          on:submit|preventDefault={async () => {
            try {
              await unlockPasswordedPost({
                postId: $query.post.id,
                password,
              });
              mixpanel.track('post:unlock', { postId: $query.post.id });
            } catch (err) {
              if (err instanceof FormValidationError) toast(err.message);
            }
          }}
        >
          <TextInput
            style={css.raw({ fontSize: '14px!' })}
            placeholder="비밀번호를 입력해주세요"
            type="password"
            bind:value={password}
          />
          <Button style={css.raw({ width: '68px' })} size="sm" type="submit">입력</Button>
        </form>
      </AlertText>
    {/if}

    <div
      class={flex({
        align: 'center',
        justify: 'space-between',
        paddingY: '18px',
        backgroundColor: 'gray.5',
        smDown: {
          flexGrow: '1',
          position: 'sticky',
          bottom: '0',
          borderYWidth: '1px',
          borderYColor: 'gray.100',
          zIndex: '1',
          height: '64px',
          marginX: '-20px',
          paddingX: '20px',
        },
      })}
    >
      <div class={flex({ align: 'center' })}>
        {#if $query.post.commentQualification === 'NONE'}
          <Tooltip
            style={center.raw({ marginRight: '16px', size: '34px', hideFrom: 'sm' })}
            message="해당 게시물은 댓글이 허용되어 있지 않아요"
            offset={10}
            placement="top"
          >
            <Icon style={css.raw({ color: 'gray.400' })} icon={IconMessageCircleOff} size={24} />
          </Tooltip>
        {:else}
          <a class={center({ marginRight: '16px', size: '34px', hideFrom: 'sm' })} href="#comment">
            <Icon icon={IconMessageCircle} size={24} />
            {#if $query.post.commentCount > 0}
              <span class={css({ marginLeft: '4px', fontSize: '13px', fontWeight: 'medium' })}>
                {$query.post.commentCount}
              </span>
            {/if}
          </a>
        {/if}

        <div class={flex({ align: 'center', wrap: 'wrap' })}>
          <Tooltip
            enabled={!$query.post.receiveFeedback}
            message="피드백 받기를 설정하지 않은 포스트예요"
            placement="top"
          >
            <EmojiPicker style={css.raw({ marginRight: '8px' })} {$query} disabled={!$query.post.receiveFeedback} />
          </Tooltip>

          <ul class={flex({ align: 'center', hideFrom: 'sm' })}>
            {#each $query.post.reactions.slice(0, 3) as reaction (reaction.id)}
              <li class={css({ size: '24px' })}>
                <Emoji emoji={reaction.emoji} mine={reaction.mine} postId={$query.post.id} />
              </li>
            {/each}
            {#if $query.post.reactions.length > 3}
              <li class={css({ marginLeft: '6px', fontSize: '13px', fontWeight: 'medium', color: 'gray.500' })}>
                ..+ {$query.post.reactions.length - 3}
              </li>
            {/if}
          </ul>

          <ul class={flex({ align: 'center', hideBelow: 'sm' })}>
            {#each $query.post.reactions.slice(0, 26) as reaction (reaction.id)}
              <li>
                <Emoji emoji={reaction.emoji} mine={reaction.mine} postId={$query.post.id} />
              </li>
            {/each}
            {#if $query.post.reactions.length > 26}
              <li class={css({ marginLeft: '6px', fontSize: '13px', fontWeight: 'medium', color: 'gray.500' })}>
                ..+ {$query.post.reactions.length - 26}
              </li>
            {/if}
          </ul>
        </div>
      </div>

      <div class={flex({ align: 'center', gap: '16px' })}>
        <ShareLinkPopover href={shortLink}>
          <Icon icon={IconShare2} size={24} />
        </ShareLinkPopover>
        <button
          class={css({
            _supportHover: {
              '& path': {
                fill: '[currentColor]',
              },
            },
            _pressed: {
              '& path': {
                fill: '[currentColor]',
              },
            },
          })}
          type="button"
          on:click={async () => {
            if ($query.post.bookmarkGroups.length > 0) {
              await unbookmarkPost({ bookmarkGroupId: $query.post.bookmarkGroups[0].id, postId: $query.post.id });
              mixpanel.track('post:unbookmark', { postId: $query.post.id, via: 'post' });
            } else {
              if (!$query.me) {
                loginRequireOpen = true;
                return;
              }

              await bookmarkPost({ postId: $query.post.id });
              mixpanel.track('post:bookmark', { postId: $query.post.id, via: 'post' });
            }
          }}
        >
          {#if $query.post.bookmarkGroups.length > 0}
            <Icon icon={IconBookmarkFilled} size={24} />
          {:else}
            <Icon icon={IconBookmark} size={24} />
          {/if}
        </button>
      </div>
    </div>

    {#if $query.post.collection}
      {@const positionInCollection = $query.post.collection.posts.findIndex((post) => post.id === $query.post.id)}
      <div class={css({ smDown: { marginX: '-20px' }, sm: { borderWidth: '1px', borderColor: 'gray.200' } })}>
        <a
          class={flex({ align: 'center', gap: '10px', padding: '20px' })}
          href={`/${$query.post.space?.slug}/collections/${$query.post.collection.id}`}
        >
          <Image
            style={css.raw({ flex: 'none', width: '60px', aspectRatio: '3/4', objectFit: 'cover' })}
            $image={$query.post.collection.thumbnail}
            placeholder
            size={96}
          />

          <div class={css({ truncate: true })}>
            <div class={flex({ align: 'center', fontSize: '12px', color: 'gray.600' })}>
              <p>컬렉션</p>
              <Icon icon={IconChevronRight} size={12} />
            </div>
            <p class={css({ marginBottom: '8px', fontSize: '16px', fontWeight: 'semibold', truncate: true })}>
              {$query.post.collection.name}
            </p>
            <p class={css({ fontSize: '12px', color: 'gray.500', truncate: true })}>
              총 {$query.post.collection.count}개의 포스트
            </p>
          </div>
        </a>

        {#if positionInCollection > -1}
          <div class={css({ backgroundColor: 'gray.5' })}>
            {#if positionInCollection > 0}
              {@const previousPost = $query.post.collection.posts[positionInCollection - 1]}
              <a
                class={flex({
                  align: 'center',
                  gap: '32px',
                  borderTopWidth: '1px',
                  borderTopColor: 'gray.200',
                  padding: '20px',
                  height: '82px',
                  transition: 'common',
                  truncate: true,
                  _hover: { backgroundColor: 'gray.50' },
                })}
                href={`/${$query.post.space?.slug}/${previousPost.permalink}`}
              >
                <span class={css({ fontSize: '14px', color: 'gray.500' })}>이전글</span>

                <div class={css({ truncate: true })}>
                  <p class={css({ fontSize: '14px', fontWeight: 'semibold', truncate: true })}>
                    {previousPost.publishedRevision?.title ?? '(제목 없음)'}
                  </p>
                  {#if previousPost.publishedRevision?.subtitle}
                    <p class={css({ fontSize: '14px', color: 'gray.500', truncate: true })}>
                      {previousPost.publishedRevision.subtitle}
                    </p>
                  {/if}
                </div>
              </a>
            {/if}
            {#if positionInCollection < $query.post.collection.posts.length - 1}
              {@const nextPost = $query.post.collection.posts[positionInCollection + 1]}
              <a
                class={flex({
                  align: 'center',
                  gap: '32px',
                  borderTopWidth: '1px',
                  borderTopColor: 'gray.100',
                  padding: '20px',
                  height: '82px',
                  transition: 'common',
                  truncate: true,
                  _hover: { backgroundColor: 'gray.50' },
                })}
                href={`/${$query.post.space?.slug}/${nextPost.permalink}`}
              >
                <span class={css({ fontSize: '14px', color: 'gray.500' })}>다음글</span>

                <div class={css({ truncate: true })}>
                  <p class={css({ fontSize: '14px', fontWeight: 'semibold', truncate: true })}>
                    {nextPost.publishedRevision?.title ?? '(제목 없음)'}
                  </p>
                  {#if nextPost.publishedRevision?.subtitle}
                    <p class={css({ fontSize: '14px', color: 'gray.500', truncate: true })}>
                      {nextPost.publishedRevision.subtitle}
                    </p>
                  {/if}
                </div>
              </a>
            {/if}
          </div>
        {/if}
      </div>
    {:else if $query.post.previousPost || $query.post.nextPost}
      <div class={css({ smDown: { marginX: '-20px' }, sm: { borderWidth: '1px', borderColor: 'gray.200' } })}>
        {#if $query.post.previousPost}
          <a
            class={flex({
              align: 'center',
              gap: '32px',
              padding: '20px',
              height: '82px',
              transition: 'common',
              truncate: true,
              _hover: { backgroundColor: 'gray.50' },
            })}
            href={`/${$query.post.space?.slug}/${$query.post.previousPost.permalink}`}
          >
            <span class={css({ fontSize: '14px', color: 'gray.500' })}>이전글</span>

            <div class={css({ truncate: true })}>
              <p class={css({ fontSize: '14px', fontWeight: 'semibold', truncate: true })}>
                {$query.post.previousPost.publishedRevision.title ?? '(제목 없음)'}
              </p>
              {#if $query.post.previousPost.publishedRevision.subtitle}
                <p class={css({ fontSize: '14px', color: 'gray.500', truncate: true })}>
                  {$query.post.previousPost.publishedRevision.subtitle}
                </p>
              {/if}
            </div>
          </a>
        {/if}
        {#if $query.post.nextPost}
          <a
            class={flex({
              align: 'center',
              gap: '32px',
              borderTopWidth: '1px',
              borderTopColor: 'gray.100',
              padding: '20px',
              height: '82px',
              transition: 'common',
              truncate: true,
              _hover: { backgroundColor: 'gray.50' },
            })}
            href={`/${$query.post.space?.slug}/${$query.post.nextPost.permalink}`}
          >
            <span class={css({ fontSize: '14px', color: 'gray.500' })}>다음글</span>

            <div class={css({ truncate: true })}>
              <p class={css({ fontSize: '14px', fontWeight: 'semibold', truncate: true })}>
                {$query.post.nextPost.publishedRevision.title ?? '(제목 없음)'}
              </p>
              {#if $query.post.nextPost.publishedRevision.subtitle}
                <p class={css({ fontSize: '14px', color: 'gray.500', truncate: true })}>
                  {$query.post.nextPost.publishedRevision.subtitle}
                </p>
              {/if}
            </div>
          </a>
        {/if}
      </div>
    {/if}

    <aside
      class={flex({
        gap: '10px',
        padding: '20px',
        backgroundColor: 'gray.50',
        sm: { justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' },
        smDown: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginX: '-20px' },
      })}
    >
      <div class={flex({ gap: '12px', marginRight: 'auto' })}>
        <a class={css({ flex: 'none' })} href={`/${$query.post.space?.slug}`}>
          <Image
            style={css.raw({ borderWidth: '[0.8px]', borderColor: 'gray.100', size: '60px' })}
            $image={$query.post.space?.icon}
            placeholder
            size={64}
          />
        </a>

        <article class={css({ marginY: 'auto', truncate: true })}>
          <a class={css({ width: 'full', truncate: true })} href={`/${$query.post.space?.slug}`}>
            <p
              class={css({
                width: 'full',
                fontSize: '16px',
                fontWeight: 'semibold',
                truncate: true,
              })}
            >
              {#if $query.post.space}
                {$query.post.space.name}
              {:else}
                스페이스 이름
              {/if}
            </p>
          </a>
          <a class={css({ width: 'full', whiteSpace: 'pre-wrap' })} href={`/${$query.post.space?.slug}`}>
            <p
              class={css({
                marginTop: '2px',
                width: 'full',
                fontSize: '12px',
                color: 'gray.500',
                wordBreak: 'break-all',
              })}
            >
              {$query.post.space?.description ?? ''}
            </p>
          </a>
        </article>
      </div>

      {#if !$query.post.space?.meAsMember}
        {#if $query.post.space?.followed}
          <Button
            style={center.raw({ gap: '4px', flex: 'none', marginLeft: 'auto', width: '86px' })}
            size="sm"
            variant="gray-outline"
            on:click={async () => {
              if (!$query.post.space) return;

              await unfollowSpace({ spaceId: $query.post.space.id });
              mixpanel.track('space:unfollow', { spaceId: $query.post.space.id, via: 'post' });
            }}
          >
            <Icon icon={IconCheck} />
            구독중
          </Button>
        {:else}
          <Button
            style={center.raw({ gap: '4px', flex: 'none', marginLeft: 'auto', width: '86px' })}
            disabled={$query.post.space?.myMasquerade?.blocked}
            size="sm"
            on:click={async () => {
              if (!$query.post.space) return;

              if (!$query.me) {
                loginRequireOpen = true;
                return;
              }

              await followSpace({ spaceId: $query.post.space.id });
              mixpanel.track('space:follow', { spaceId: $query.post.space.id, via: 'post' });
            }}
          >
            <Icon icon={IconPlus} />
            구독
          </Button>
        {/if}
      {/if}
    </aside>

    {#if $query.featureFlags.includes('SHOW_AD')}
      <AdSense style={css.raw({ marginTop: '60px', width: 'full', minHeight: '150px' })} slotId="3261823000" />
    {/if}

    {#if $query.post.space && !blurContent && !$query.post.space.myMasquerade?.blocked}
      <div class={css({ marginTop: '60px' })}>
        {#if $query.post.commentQualification !== 'NONE'}
          <p
            id="comment"
            class={css({
              marginBottom: '10px',
              fontWeight: 'semibold',
              scrollMarginY: '70px',
            })}
          >
            댓글 {comma($query.post.commentCount)}
          </p>
          <hr
            class={css({
              marginTop: '6px',
              height: '1px',
              backgroundColor: 'gray.150',
              smDown: { marginX: '-20px' },
            })}
          />
          <div class={css({ marginY: '24px' })}>
            <CommentInput {$query} />
          </div>

          <ul class={css({ marginTop: '24px' })}>
            {#each postComments as comment (comment.id)}
              <Comment $postComment={comment} {$query} />
            {/each}
            {#if take * (page - 1) < $query.post.paginationCount}
              <li class={css({ textAlign: 'center' })}>
                <button
                  type="button"
                  on:click={async () => {
                    fetchComments();
                  }}
                >
                  더보기
                </button>
              </li>
            {/if}
          </ul>
        {:else}
          <p
            class={css({
              borderTopWidth: '1px',
              borderTopColor: 'gray.200',
              paddingX: '20px',
              paddingY: '24px',
              fontSize: '15px',
              color: 'gray.400',
            })}
          >
            해당 게시물은 댓글이 허용되어 있지 않아요
          </p>
        {/if}
      </div>
    {/if}
  </div>

  <hr class={css({ border: 'none', marginTop: '24px', marginX: '-20px', height: '16px', backgroundColor: 'gray.5' })} />

  {#if $query.post.recommendedPosts.length > 0}
    <div
      class={css({
        marginTop: { base: '34px', sm: '60px' },
        marginX: 'auto',
        marginBottom: { base: '96px', sm: '120px' },
        maxWidth: '860px',
      })}
    >
      <p class={css({ paddingY: '8px', fontSize: '21px', fontWeight: 'bold' })}>추천 포스트</p>

      <ul class={grid({ columns: { base: 2, sm: 4 }, gap: '12px', rowGap: { base: '32px', sm: '42px' } })}>
        {#each $query.post.recommendedPosts as post (post.id)}
          <li>
            <PostCard $post={post} showSpace={false} showTags />
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</article>

{#if editor}
  <SelectionBubbleMenu {editor}>
    <button type="button" on:click={() => (openShareContentModal = true)}>공유</button>
  </SelectionBubbleMenu>
{/if}

{#if editor && openShareContentModal}
  <ShareContent
    body={getTextBetween(editor.state.doc, editor.state.selection)}
    spaceName={$query.post.space?.name ?? ''}
    title={$postRevision.title ?? '(제목 없음)'}
    bind:open={openShareContentModal}
  />
{/if}

<LoginRequireAlert bind:open={loginRequireOpen} />

<Alert bind:open={openDeletePostWarning}>
  <p slot="title" class={css({ textAlign: 'left' })}>포스트를 삭제하시겠어요?</p>
  <p slot="content" class={css({ textAlign: 'left' })}>삭제된 글은 복구할 수 없어요</p>

  <svelte:fragment slot="action">
    <Button
      style={css.raw({ hideFrom: 'sm' })}
      size="lg"
      variant="gray-sub-fill"
      on:click={() => (openDeletePostWarning = false)}
    >
      취소
    </Button>
    <Button
      style={css.raw({ hideBelow: 'sm' })}
      size="lg"
      variant="gray-outline"
      on:click={() => (openDeletePostWarning = false)}
    >
      취소
    </Button>
    <Button
      size="lg"
      variant="red-fill"
      on:click={async () => {
        await goto(`/${$query.post.space?.slug}`);
        await deletePost({ postId: $query.post.id });
        mixpanel.track('post:delete', { postId: $query.post.id, via: 'post' });
      }}
    >
      삭제
    </Button>
  </svelte:fragment>
</Alert>

<TagManageModal $post={$query.post} bind:open={openTagManageModal} />
