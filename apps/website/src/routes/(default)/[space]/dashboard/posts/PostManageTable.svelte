<script lang="ts">
  import dayjs from 'dayjs';
  import * as R from 'radash';
  import IconCoin from '~icons/tabler/coin';
  import IconDotsVertical from '~icons/tabler/dots-vertical';
  import IconEye from '~icons/tabler/eye';
  import IconMessageCircle from '~icons/tabler/message-circle';
  import IconMoodSmile from '~icons/tabler/mood-smile';
  import IconUser from '~icons/tabler/user';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Alert, Chip, Icon, Image, Tag, Tooltip } from '$lib/components';
  import { Checkbox } from '$lib/components/forms';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { Button } from '$lib/components/v2';
  import { Select, SelectItem } from '$lib/components/v2/select';
  import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from '$lib/components/v2/table';
  import { comma, humanizeNumber } from '$lib/utils';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';
  import SwitchCollectionModal from './SwitchCollectionModal.svelte';
  import UpdateCommentOptionModal from './UpdateCommentOptionModal.svelte';
  import UpdatePostOptionsModal from './UpdatePostOptionsModal.svelte';
  import UpdateReaderOptionModal from './UpdateReaderOptionModal.svelte';
  import UpdateTagModal from './UpdateTagModal.svelte';
  import UpdateThumbnailModal from './UpdateThumbnailModal.svelte';
  import type { PostManageTable_post, PostManageTable_query } from '$glitch';

  let _query: PostManageTable_query;
  let _posts: PostManageTable_post[];
  export { _posts as $posts, _query as $query };

  let selectedPosts: string[] = [];
  let switchCollectionOpen = false;
  let updateTagOpen = false;
  let updateThumbnilOpen = false;
  let updateReaderOptionOpen = false;
  let updateCommentOptionOpen = false;
  let updatePostOptionsOpen = false;
  let deletePostOpen = false;
  let deletePostId: string | null = null;

  $: query = fragment(
    _query,
    graphql(`
      fragment PostManageTable_query on Query {
        me @_required {
          id
          ...UpdateReaderOptionModal_user
          ...UpdateCommentOptionModal_user
        }

        space(slug: $slug) {
          id

          collections {
            id
            ...PostManageTable_SwitchCollectionModal_spaceCollection
          }
        }
      }
    `),
  );

  $: posts = fragment(
    _posts,
    graphql(`
      fragment PostManageTable_post on Post {
        id
        permalink
        visibility
        viewCount
        reactionCount
        commentCount
        createdAt
        discloseStats
        ageRating
        hasPassword

        space {
          id
        }

        publishedRevision @_required {
          id
          title
          subtitle
          price
        }

        tags {
          id
          kind

          tag {
            id
            name
          }
        }

        collection {
          id
          name
        }

        thumbnail {
          id
          ...Image_image
        }

        space @_required {
          id
          slug
        }
      }
    `),
  );

  $: allSelected =
    $posts.length > 0 &&
    R.diff(
      $posts.map((p: (typeof $posts)[number]) => p.id),
      selectedPosts,
    ).length === 0;

  const visibilityToLocaleString = {
    PUBLIC: '전체공개',
    SPACE: '멤버공개',
    UNLISTED: '링크공개',
  };

  const deletePost = graphql(`
    mutation PostManageTable_DeletePost_Mutation($input: DeletePostInput!) {
      deletePost(input: $input) {
        id
      }
    }
  `);
</script>

<Table>
  <TableHeader>
    <TableRow style={css.raw({ textAlign: 'left' })}>
      <TableHead style={css.raw({ width: '50px' })}>
        <Checkbox
          checked={allSelected}
          variant="brand"
          on:change={() => {
            selectedPosts = allSelected ? [] : $posts.map((p) => p.id);
          }}
        />
      </TableHead>
      <TableHead style={css.raw({ paddingLeft: '0', fontSize: '13px', fontWeight: 'medium', color: 'gray.500' })}>
        <div
          class={flex({ align: 'center', justify: 'space-between', gap: { base: '10px', sm: '86px' }, wrap: 'wrap' })}
        >
          <p>
            {#if selectedPosts.length > 0}
              {selectedPosts.length}개 선택됨
            {:else}
              {$posts.length}개의 포스트
            {/if}
          </p>

          <div class={flex({ align: 'center', gap: '8px', marginLeft: 'auto' })}>
            <Select
              style={css.raw({
                borderColor: 'gray.200',
                paddingY: '4px',
                paddingLeft: '8px',
                paddingRight: '6px!',
                height: '25px!',
              })}
              listStyle={css.raw({ top: '25px!' })}
              size="xs"
            >
              <svelte:fragment slot="placeholder">
                <Tooltip
                  enabled={selectedPosts.length === 0}
                  message="옵션을 변경할 포스트를 선택해주세요"
                  placement="top"
                >
                  발행 옵션 변경
                </Tooltip>
              </svelte:fragment>

              <SelectItem disabled={selectedPosts.length === 0} on:click={() => (switchCollectionOpen = true)}>
                컬렉션 변경
              </SelectItem>
              <SelectItem disabled={selectedPosts.length === 0} on:click={() => (updateTagOpen = true)}>
                태그 변경
              </SelectItem>
              <SelectItem disabled={selectedPosts.length === 0} on:click={() => (updateThumbnilOpen = true)}>
                썸네일 변경
              </SelectItem>
              <SelectItem disabled={selectedPosts.length === 0} on:click={() => (updateReaderOptionOpen = true)}>
                대상 독자 변경
              </SelectItem>
              <SelectItem disabled={selectedPosts.length === 0} on:click={() => (updateCommentOptionOpen = true)}>
                댓글옵션 변경
              </SelectItem>
              <SelectItem disabled={selectedPosts.length === 0} on:click={() => (updatePostOptionsOpen = true)}>
                세부옵션 변경
              </SelectItem>
            </Select>

            <Button
              style={css.raw({
                height: '25px',
                outlineWidth: '0!',
                borderWidth: '1px',
                borderColor: 'gray.200',
                backgroundColor: 'gray.0',
              })}
              size="xs"
              variant="gray-outline"
              on:click={() => {
                deletePostOpen = true;
                deletePostId = null;
              }}
            >
              삭제
            </Button>
          </div>
        </div>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each $posts as post (post.id)}
      <TableRow>
        <TableData style={css.raw({ whiteSpace: 'no-wrap' })}>
          <Checkbox
            checked={selectedPosts.includes(post.id)}
            variant="brand"
            on:change={() =>
              (selectedPosts = selectedPosts.includes(post.id)
                ? selectedPosts.filter((id) => id !== post.id)
                : [...selectedPosts, post.id])}
          />
        </TableData>
        <TableData style={css.raw({ padding: '20px', paddingLeft: '0', maxWidth: '1px', truncate: true })}>
          <div class={css({ position: 'relative' })}>
            <a href="/{post.space.slug}/{post.permalink}">
              <div class={flex({ align: 'flex-start', justify: 'space-between', gap: { base: '10px', sm: '86px' } })}>
                <div class={css({ truncate: true })}>
                  {#if post.collection}
                    <p class={css({ marginBottom: '2px', fontSize: '13px', fontWeight: 'medium', truncate: true })}>
                      {post.collection.name}
                    </p>
                  {/if}
                  <p class={css({ fontSize: '14px', fontWeight: 'semibold', truncate: true })}>
                    {post.publishedRevision?.title ?? '(제목 없음)'}
                  </p>
                  <p
                    class={css({
                      marginBottom: '4px',
                      fontSize: '13px',
                      color: 'gray.600',
                      height: '19px',
                      truncate: true,
                    })}
                  >
                    {post.publishedRevision?.subtitle ?? ''}
                  </p>

                  <ul
                    class={flex({
                      align: 'center',
                      gap: '4px',
                      height: '21px',
                      overflow: 'auto',
                      scrollbar: 'hidden',
                    })}
                  >
                    {#each post.tags as { tag } (tag.id)}
                      <Tag style={css.raw({ flex: 'none' })} as="div" size="sm">{tag.name}</Tag>
                    {/each}
                  </ul>
                </div>

                <div
                  class={css({
                    position: 'relative',
                    flex: 'none',
                    width: '124px',
                    aspectRatio: '16/10',
                  })}
                >
                  <Image
                    style={css.raw({ size: 'full', aspectRatio: '16/10', objectFit: 'cover' })}
                    $image={post.thumbnail}
                    placeholder
                    size={128}
                  />

                  <div class={css({ position: 'absolute', left: '6px', bottom: '6px', display: 'flex', gap: '4px' })}>
                    {#if post.ageRating === 'R15'}
                      <Chip color="pink">15세</Chip>
                    {/if}
                    {#if post.ageRating === 'R19'}
                      <Chip color="pink">성인</Chip>
                    {/if}
                    {#if post.hasPassword}
                      <Chip color="gray">비밀글</Chip>
                    {/if}
                  </div>
                </div>
              </div>

              <div
                class={flex({
                  direction: { base: 'column', sm: 'row' },
                  align: { base: 'flex-start', sm: 'center' },
                  gap: '8px',
                  wrap: 'wrap',
                  marginTop: '10px',
                  paddingRight: '24px',
                  fontSize: '12px',
                  color: 'gray.400',
                })}
              >
                <div class={flex({ align: 'center', gap: '2px' })}>
                  <Icon icon={IconUser} />
                  <p class={css({ marginRight: '4px' })}>{visibilityToLocaleString[post.visibility]}</p>
                  <Icon style={css.raw(!!post.publishedRevision?.price && { color: 'brand.400' })} icon={IconCoin} />
                  <p class={css(!!post.publishedRevision?.price && { color: 'brand.400' })}>
                    {post.publishedRevision?.price ? `${comma(post.publishedRevision.price)}P` : '무료'}
                  </p>
                </div>
                <div class={flex({ align: 'center', gap: '8px' })}>
                  {#if post.discloseStats}
                    <hr
                      class={css({
                        border: 'none',
                        width: '1px',
                        height: '12px',
                        backgroundColor: 'gray.100',
                        hideBelow: 'sm',
                      })}
                    />

                    <div class={flex({ align: 'center', gap: '2px' })}>
                      <Icon icon={IconEye} />
                      <p class={css({ marginRight: '4px' })}>{humanizeNumber(post.viewCount)}</p>
                      <Icon icon={IconMoodSmile} />
                      <p class={css({ marginRight: '4px' })}>{humanizeNumber(post.reactionCount)}</p>
                      <Icon icon={IconMessageCircle} />
                      <p>{humanizeNumber(post.commentCount)}</p>
                    </div>
                  {/if}

                  <hr
                    class={css(
                      { border: 'none', width: '1px', height: '12px', backgroundColor: 'gray.100' },
                      !post.discloseStats && { hideBelow: 'sm' },
                    )}
                  />

                  <time datetime={post.createdAt}>{dayjs(post.createdAt).formatAsDate()}</time>
                </div>
              </div>
            </a>
            <Menu style={css.raw({ position: 'absolute', bottom: '0', right: '-6px' })} placement="bottom-end">
              <Icon slot="value" style={css.raw({ color: 'gray.400' })} icon={IconDotsVertical} size={24} />

              <MenuItem href="/editor/{post.permalink}" type="link">수정</MenuItem>
              <MenuItem
                style={css.raw({ color: 'red.600' })}
                on:click={() => {
                  deletePostOpen = true;
                  deletePostId = post.id;
                }}
              >
                삭제
              </MenuItem>
            </Menu>
          </div>
        </TableData>
      </TableRow>
    {:else}
      <TableRow>
        <th
          class={css({ paddingTop: '106px', paddingBottom: '48px', fontSize: '15px', color: 'gray.500' })}
          colspan="3"
        >
          포스트가 없어요
        </th>
      </TableRow>
    {/each}
  </TableBody>
</Table>

<SwitchCollectionModal
  $collections={$query.space.collections}
  spaceId={$query.space.id}
  bind:open={switchCollectionOpen}
  bind:selectedPostIds={selectedPosts}
/>
<UpdateTagModal bind:open={updateTagOpen} bind:selectedPostIds={selectedPosts} />
<UpdateThumbnailModal bind:open={updateThumbnilOpen} bind:selectedPostIds={selectedPosts} />
<UpdateReaderOptionModal $user={$query.me} bind:open={updateReaderOptionOpen} bind:selectedPostIds={selectedPosts} />
<UpdateCommentOptionModal $user={$query.me} bind:open={updateCommentOptionOpen} bind:selectedPostIds={selectedPosts} />
<UpdatePostOptionsModal bind:open={updatePostOptionsOpen} bind:selectedPostIds={selectedPosts} />

<Alert bind:open={deletePostOpen}>
  <p slot="title" class={css({ textAlign: 'left' })}>포스트를 삭제하시겠어요?</p>
  <p slot="content" class={css({ textAlign: 'left' })}>삭제된 글은 복구할 수 없어요</p>

  <svelte:fragment slot="action">
    <Button
      style={css.raw({ hideFrom: 'sm' })}
      size="lg"
      variant="gray-sub-fill"
      on:click={() => (deletePostOpen = false)}
    >
      취소
    </Button>
    <Button
      style={css.raw({ hideBelow: 'sm' })}
      size="lg"
      variant="gray-outline"
      on:click={() => (deletePostOpen = false)}
    >
      취소
    </Button>
    <Button
      size="lg"
      variant="red-fill"
      on:click={async () => {
        if (deletePostId) {
          await deletePost({ postId: deletePostId });
          mixpanel.track('post:delete', { postId: deletePostId, via: 'space-dashboard' });
        } else {
          await Promise.all(selectedPosts.map((postId) => deletePost({ postId })));
          mixpanel.track('post:delete', { postIds: selectedPosts, via: 'space-dashboard' });
          selectedPosts = [];
        }
        deletePostId = null;
        deletePostOpen = false;
      }}
    >
      삭제
    </Button>
  </svelte:fragment>
</Alert>
