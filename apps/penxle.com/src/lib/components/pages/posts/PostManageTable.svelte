<script generics="T extends 'space' | 'me'" lang="ts">
  import { PostVisibility } from '@prisma/client';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, Badge, Button, Image, Modal, Tag, Tooltip } from '$lib/components';
  import { Checkbox, Switch } from '$lib/components/forms';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { Table, TableData, TableHead, TableRow } from '$lib/components/table';
  import { toast } from '$lib/notification';
  import type { PostManageTable_Collection, PostManageTable_Post_query, PostManageTable_SpaceMember } from '$glitch';
  import type { PublishPostInput } from '$lib/validations/post';

  const toolbarMenuOffset = 16;

  export let type: T;
  let _posts: PostManageTable_Post_query[];
  let _spaceMember: PostManageTable_SpaceMember | null = null;
  let _collections: PostManageTable_Collection[] = [];

  type $$Props = { type: typeof type; $posts: typeof _posts } & (T extends 'space'
    ? { $spaceMember: typeof _spaceMember; $collections: typeof _collections }
    : unknown);
  export { _collections as $collections, _posts as $posts, _spaceMember as $spaceMember };

  $: posts = fragment(
    _posts,
    graphql(`
      fragment PostManageTable_Post_query on Post {
        id
        permalink
        receiveFeedback
        receiveTagContribution
        discloseStats
        visibility
        createdAt
        publishedAt

        collection {
          id
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
            ...Avatar_profile
          }
        }

        publishedRevision @_required {
          id
          title
          createdAt

          tags {
            id
            name
          }

          croppedThumbnail {
            ...Image_image
          }
        }
      }
    `),
  );

  $: spaceMember = fragment(
    _spaceMember,
    graphql(`
      fragment PostManageTable_SpaceMember on SpaceMember {
        id
        role
      }
    `),
  );

  $: collections = fragment(
    _collections,
    graphql(`
      fragment PostManageTable_Collection on SpaceCollection {
        id
        name
      }
    `),
  );

  function hasPermissionToUpdatePost(memberId: string) {
    if (type === 'me') return true;

    if (!$spaceMember) throw new Error('스페이스 관리 페이지에서는 "$spaceMember" prop 가 필수예요');

    return memberId === $spaceMember.id || $spaceMember.role === 'ADMIN';
  }

  let selectedPostIds = new Set<string>();
  $: selectedPostCount = selectedPostIds.size;
  $: _selectedPostIds = [...selectedPostIds.values()];

  $: selectedPosts = $posts.filter((post) => _selectedPostIds.includes(post.id));
  $: selectedOwnPosts = type === 'me' || selectedPosts.every((post) => post.member.id === $spaceMember?.id);

  let receiveFeedback = false;
  let receiveTagContribution = false;
  let discloseStats = false;

  let openDeletePostWaring = false;
  let deletePostId: string | null = null;
  let deletePostIds: string[] | null = null;

  let openCreateCollection = false;
  let selectedCollectionId: string | null = null;

  function resetPostOptions() {
    receiveFeedback = selectedPosts.every((post) => post.receiveFeedback);
    receiveTagContribution = selectedPosts.every((post) => post.receiveTagContribution);
    discloseStats = selectedPosts.every((post) => post.discloseStats);
  }

  $: if (selectedPostIds.size > 0) {
    resetPostOptions();
  }

  function resetSelectedCollectionId() {
    const baseCollectionId = selectedPosts[0].collection?.id;

    selectedCollectionId =
      baseCollectionId && selectedPosts.every((post) => post.collection?.id === baseCollectionId)
        ? baseCollectionId
        : null;
  }

  if (selectedPostIds.size > 0) {
    resetSelectedCollectionId();
  }

  const visibilityToLocaleString = {
    PUBLIC: '전체공개',
    SPACE: '멤버공개',
    UNLISTED: '링크공개',
  };

  const visibilityToIcon = {
    PUBLIC: 'i-px-global',
    SPACE: 'i-px-people',
    UNLISTED: 'i-px-liink',
  };

  const visibilityOptions = Object.entries(visibilityToLocaleString).map(([value, label]) => ({ value, label })) as {
    value: keyof typeof visibilityToLocaleString;
    label: string;
  }[];

  const updateVisibility = graphql(`
    mutation SpaceSettingPostsPage_UpdateVisibility_Mutation($input: UpdatePostOptionsInput!) {
      updatePostOptions(input: $input) {
        id
        visibility
      }
    }
  `);

  function updateVisibilities(visibility: PostVisibility) {
    if (type === 'space') {
      mixpanel.track('space:dashboard:posts:update:visibility', { spaceId: $posts[0].space.id });
    } else {
      mixpanel.track('me:posts:update:visibility');
    }
    return Promise.all(_selectedPostIds.map((postId) => updateVisibility({ postId, visibility })));
  }

  const updatePostOptions = graphql(`
    mutation SpaceSettingPostsPage_UpdatePostOptions_Mutation($input: UpdatePostOptionsInput!) {
      updatePostOptions(input: $input) {
        id
        receiveFeedback
        receiveTagContribution
        discloseStats
      }
    }
  `);

  function updatePostsOptions(
    input: Partial<Pick<PublishPostInput, 'receiveFeedback' | 'receiveTagContribution' | 'discloseStats'>>,
  ) {
    if (type === 'space') {
      mixpanel.track('space:dashboard:posts:update:options', { spaceId: $posts[0].space.id });
    } else {
      mixpanel.track('me:posts:update:options');
    }
    return Promise.all(_selectedPostIds.map((postId) => updatePostOptions({ postId, ...input })));
  }

  const deletePost = graphql(`
    mutation SpaceSettingPostsPage_DeletePost_Mutation($input: DeletePostInput!) {
      deletePost(input: $input) {
        id
      }
    }
  `);

  async function deletePosts(postIds: string[]) {
    selectedPostIds.clear();
    selectedPostIds = selectedPostIds;

    if (type === 'space') {
      mixpanel.track('space:dashboard:posts:delete', { spaceId: $posts[0].space.id });
    } else {
      mixpanel.track('me:posts:delete');
    }
    return Promise.all(postIds.map((postId) => deletePost({ postId })));
  }

  function handleSelectAllPost(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) throw new Error('event.target is not HTMLInputElement');

    const { checked } = event.target;

    if (checked) {
      for (const post of $posts ?? []) {
        selectedPostIds.add(post.id);
      }
    } else {
      for (const post of $posts ?? []) {
        selectedPostIds.delete(post.id);
      }
    }
    selectedPostIds = selectedPostIds;
  }
  function handleSelectPost(event: Event) {
    if (!(event.target instanceof HTMLInputElement)) throw new Error('event.target is not HTMLInputElement');

    const { checked, value } = event.target;
    if (checked) {
      selectedPostIds.add(value);
    } else {
      selectedPostIds.delete(value);
    }

    selectedPostIds = selectedPostIds;
  }

  const createSpaceCollection = graphql(`
    mutation PostManageTable_CreateSpaceCollection_Mutation($input: CreateSpaceCollectionInput!) {
      createSpaceCollection(input: $input) {
        id
        name
      }
    }
  `);

  const setSpaceCollectionPosts = graphql(`
    mutation PostManageTable_SetSpaceCollectionPosts_Mutation($input: SetSpaceCollectionPostsInput!) {
      setSpaceCollectionPosts(input: $input) {
        id
      }
    }
  `);
</script>

<div class="overflow-auto">
  <Table class="text-left border-separate border-spacing-y-0.125rem">
    <TableRow>
      <TableHead class="w-2.5rem">
        <Checkbox class="gap-3" on:change={handleSelectAllPost} />
      </TableHead>
      <TableHead class="<sm:p-l-0.25rem">포스트</TableHead>
      <TableHead class="<sm:hidden">작성자</TableHead>
      <TableHead class="min-w-10rem <sm:hidden">태그</TableHead>
      <TableHead class="<sm:(p-r-1.3rem w-5.25rem)">공개옵션</TableHead>
      <TableHead class="<sm:hidden">관리</TableHead>
      <!-- 모바일 화면 너비에서 마지막에 빈 테이블 헤드 요소가 없으면 테이블 헤더 오른쪽이 잘리는 문제가 있어서 추가했습니다. -->
      <TableHead class="w-0" />
    </TableRow>
    {#each $posts as post (post.id)}
      <TableRow
        class="rounded-2 [&[aria-selected='true']]:bg-primary border-solid border-b border-alphagray-10 last:border-b-0 [&>td>div]:(items-center <sm:justify-end) aria-selected:bg-primary"
        aria-selected={selectedPostIds.has('post.id')}
      >
        <TableData class="p-r-none!">
          <Checkbox checked={selectedPostIds.has(post.id)} value={post.id} on:change={handleSelectPost} />
        </TableData>
        <TableData>
          <a
            class="flex justify-start gap-xs"
            href={`/${post.space.slug}/${post.permalink}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {#if post.publishedRevision.croppedThumbnail}
              <Image class="square-2.625rem flex-shrink-0 rounded-2" $image={post.publishedRevision.croppedThumbnail} />
            {/if}
            <dl class="truncate [&>dt]:truncate">
              <dt class="body-15-b">
                {post.publishedRevision.title}
              </dt>
              <dd class="body-13-m text-secondary">
                {dayjs(post.publishedAt).formatAsDate()}
              </dd>
            </dl>
          </a>
        </TableData>
        <TableData class="<sm:hidden">
          <div class="flex gap-1">
            {#if type === 'space'}
              <Avatar class="square-5" $profile={post.member.profile} />
              <span class="body-13-b">{post.member.profile.name}</span>
              {#if post.member.id === $spaceMember?.id}
                <Badge class="w-fit px-2 py-1" color="green">나</Badge>
              {/if}
            {:else if type === 'me'}
              <Avatar class="square-5" $profile={post.member.profile} />
              <span class="body-13-b">{post.space.name}</span>
            {/if}
          </div>
        </TableData>
        <TableData class="<sm:hidden">
          <div class="flex gap-1">
            {#each post.publishedRevision.tags.slice(0, 3) as tag (tag.id)}
              <Tag size="sm">{tag.name}</Tag>
            {/each}
            {#if post.publishedRevision.tags.length > 2}
              <Tooltip
                message={post.publishedRevision.tags
                  .slice(2)
                  .map((tag) => tag.name)
                  .join(', ')}
                placement="top"
              >
                <span class="body-13-b">+{post.publishedRevision.tags.length - 2}</span>
              </Tooltip>
            {/if}
          </div>
        </TableData>
        <TableData class="overflow-visible!">
          <div class="flex gap-0.125rem">
            <Menu
              class="disabled:[&>i.i-lc-chevron-down]:hidden "
              disabled={!hasPermissionToUpdatePost(post.member.id)}
              placement="bottom-end"
            >
              <span slot="value" class="flex items-center body-13-b [&>i]:text-icon-secondary">
                <i class={clsx(visibilityToIcon[post.visibility], 'square-4 m-r-0.15rem')} />
                {visibilityToLocaleString[post.visibility]}
                <i class="i-lc-chevron-down square-4" />
              </span>

              {#each visibilityOptions as visibilityOption (visibilityOption.value)}
                <MenuItem
                  aria-pressed={post.visibility === visibilityOption.value}
                  on:click={() =>
                    updateVisibility({
                      postId: post.id,
                      visibility: visibilityOption.value,
                    })}
                >
                  {visibilityOption.label}
                </MenuItem>
              {/each}
            </Menu>
          </div>
        </TableData>
        <TableData class="<sm:hidden">
          <div class={clsx('flex gap-2')} hidden={!hasPermissionToUpdatePost(post.member.id)}>
            <Button
              class="disabled:invisible"
              color="tertiary"
              disabled={type === 'space' && post.member.id !== $spaceMember?.id}
              external
              href={`/editor/${post.permalink}`}
              size="sm"
              type="link"
              variant="outlined"
            >
              수정
            </Button>
            <Button
              class="p-none! disabled:invisible"
              disabled={type === 'space' && (post.member.id !== $spaceMember?.id || $spaceMember?.role !== 'ADMIN')}
              size="sm"
              variant="text"
              on:click={() => {
                deletePostId = post.id;
                openDeletePostWaring = true;
              }}
            >
              <i class="i-lc-trash-2 square-4 text-secondary hover:text-action-red-primary" />
            </Button>
          </div>
        </TableData>
        <TableData></TableData>
      </TableRow>
    {/each}
  </Table>
</div>

<div
  class={clsx(
    selectedPostCount > 0 ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 translate-y-1rem',
    'self-center flex justify-center flex-wrap gap-4 items-center px-6 py-2 flex-wrap sticky bottom-1rem bg-white rounded-2xl shadow-[0_0.25rem_1rem_0_rgba(0,0,0,0.15)] transition-all-300',
  )}
>
  <span class="body-15-b" aria-live="polite">
    {selectedPostCount}개의 포스트 선택됨
  </span>
  <div class="flex gap-4 flex-wrap justify-center">
    {#if selectedOwnPosts || $spaceMember?.role === 'ADMIN'}
      <Menu class="<sm:hidden" as="div" offset={toolbarMenuOffset} placement="top">
        <Button slot="value" class="whitespace-nowrap" color="secondary" size="md">공개범위 설정</Button>
        <MenuItem on:click={() => updateVisibilities('PUBLIC')}>전체 공개</MenuItem>
        <MenuItem on:click={() => updateVisibilities('UNLISTED')}>링크 공개</MenuItem>
        <MenuItem on:click={() => updateVisibilities('SPACE')}>멤버 공개</MenuItem>
      </Menu>
      <Menu class="<sm:hidden" as="div" offset={toolbarMenuOffset} placement="top">
        <Button slot="value" class="whitespace-nowrap" color="secondary" size="md">포스트 옵션 설정</Button>
        <MenuItem type="div">
          <Switch
            class="flex gap-0.63rem body-14-m items-center justify-between"
            checked={receiveFeedback}
            on:change={(event) => {
              receiveFeedback = event.currentTarget.checked;

              updatePostsOptions({ receiveFeedback });
            }}
          >
            피드백
          </Switch>
        </MenuItem>
        <MenuItem type="div">
          <Switch
            class="flex gap-0.63rem body-14-m items-center justify-between"
            checked={receiveTagContribution}
            on:change={(event) => {
              receiveTagContribution = event.currentTarget.checked;

              updatePostsOptions({ receiveTagContribution });
            }}
          >
            태그 수정
          </Switch>
        </MenuItem>
        <MenuItem type="div">
          <Switch
            class="flex gap-0.63rem body-14-m items-center justify-between"
            checked={discloseStats}
            on:change={(event) => {
              discloseStats = event.currentTarget.checked;

              updatePostsOptions({ discloseStats });
            }}
          >
            통계 공개
          </Switch>
        </MenuItem>
      </Menu>
    {/if}
    {#if type === 'space'}
      <Menu as="div" offset={toolbarMenuOffset}>
        <Button slot="value" class="whitespace-nowrap" color="secondary" size="md">컬렉션 추가</Button>
        {#each $collections as collection (collection.id)}
          <MenuItem
            class="flex gap-0.62rem group"
            aria-pressed={selectedCollectionId === collection.id}
            on:click={async () => {
              await setSpaceCollectionPosts({
                collectionId: collection.id,
                postIds: selectedPosts.map((post) => post.id),
              });

              toast.success('컬렉션에 추가했어요');
            }}
          >
            {collection.name}
            <i class="i-lc-check square-4 color-green-50 invisible group-aria-pressed:visible" aria-label="선택됨" />
          </MenuItem>
        {/each}
        <MenuItem class="flex items-center gap-0.62rem" on:click={() => (openCreateCollection = true)}>
          <i class="i-lc-plus square-4 text-secondary" />
          새로 만들기
        </MenuItem>
      </Menu>
    {/if}
    {#if selectedOwnPosts || $spaceMember?.role === 'ADMIN'}
      <Button
        class="<sm:hidden whitespace-nowrap"
        color="red"
        size="md"
        on:click={() => {
          deletePostIds = _selectedPostIds;
          openDeletePostWaring = true;
        }}
      >
        삭제하기
      </Button>
    {/if}
  </div>
</div>

<Modal size="sm" bind:open={openDeletePostWaring}>
  <svelte:fragment slot="title">정말 포스트를 삭제하시겠어요?</svelte:fragment>

  <div slot="action" class="flex gap-2 w-full [&>button]:grow">
    <Button
      color="secondary"
      size="md"
      on:click={() => {
        openDeletePostWaring = false;

        deletePostIds = null;
        deletePostId = null;
      }}
    >
      취소
    </Button>
    <Button
      size="md"
      on:click={async () => {
        if (deletePostId) {
          await deletePost({ postId: deletePostId });
        } else if (deletePostIds) {
          await deletePosts(deletePostIds);
        } else {
          throw new Error('기대하지 않은 경우예요');
        }

        openDeletePostWaring = false;

        deletePostId = null;
        deletePostIds = null;

        toast.success('포스트를 삭제했어요');
      }}
    >
      삭제
    </Button>
  </div>
</Modal>

<Modal size="md" bind:open={openCreateCollection}>
  <svelte:fragment slot="title">
    <form
      id="create-collection"
      on:submit|preventDefault={async (event) => {
        if (
          !(event.target instanceof HTMLFormElement) ||
          !('collectionName' in event.target) ||
          !(event.target.collectionName instanceof HTMLInputElement)
        )
          throw new Error('기대하지 않은 경우입니다.');

        const name = event.target.collectionName.value;

        const { id: collectionId } = await createSpaceCollection({ name, spaceId: selectedPosts[0].space.id });
        await setSpaceCollectionPosts({ collectionId, postIds: selectedPosts.map((post) => post.id) });

        toast.success('새 컬렉션을 생성했어요');
        openCreateCollection = false;
      }}
    >
      <input
        name="collectionName"
        class="title_20_b w-[fit-content] text-primary disabled:text-disabled"
        maxlength="10"
        placeholder="컬렉션명"
        type="text"
      />
    </form>
  </svelte:fragment>
  <svelte:fragment slot="subtitle">컬렉션에 노출되는 포스트를 관리하세요</svelte:fragment>
  <ul class="max-h-110 overflow-y-auto">
    {#each selectedPosts as post (post.id)}
      <li class="flex gap-xs items-center">
        {#if post.publishedRevision.croppedThumbnail}
          <Image class="square-15 flex-shrink-0 rounded-2" $image={post.publishedRevision.croppedThumbnail} />
        {/if}
        <dl class="truncate [&>dt]:truncate">
          <dt class="body-15-b">
            {post.publishedRevision.title}
          </dt>
          <dd class="body-13-m text-secondary">
            {dayjs(post.publishedAt).formatAsDate()}
          </dd>
        </dl>
      </li>
    {/each}
  </ul>
  <Button class="w-full" form="create-collection" size="lg" type="submit">컬렉션 생성하기</Button>
</Modal>
