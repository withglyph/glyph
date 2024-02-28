<script generics="T extends 'space' | 'me'" lang="ts">
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import IconGlobe from '~icons/effit/globe';
  import IconLink from '~icons/effit/link';
  import IconUsers from '~icons/effit/users';
  import IconCheck from '~icons/tabler/check';
  import IconChevronDown from '~icons/tabler/chevron-down';
  import IconPlus from '~icons/tabler/plus';
  import IconTrash from '~icons/tabler/trash';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Avatar, Badge, Button, Icon, Image, Modal, Tag, Tooltip } from '$lib/components';
  import { Checkbox, Editable, Switch } from '$lib/components/forms';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { Table, TableData, TableHead, TableHeader, TableRow } from '$lib/components/table';
  import { toast } from '$lib/notification';
  import type { ChangeEventHandler } from 'svelte/elements';
  import type {
    PostManageTable_Collection,
    PostManageTable_Post_query,
    PostManageTable_SpaceMember,
    PostVisibility,
  } from '$glitch';
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

        tags {
          id

          tag {
            id
            name
          }
        }

        thumbnail {
          id
          ...Image_image
        }

        collection {
          id
        }

        space @_required {
          id
          name
          slug
        }

        member @_required {
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
  $: selectedOwnPosts = type === 'me' || selectedPosts.every((post) => post.member?.id === $spaceMember?.id);

  let receiveFeedback = false;
  let receiveTagContribution = false;
  let discloseStats = false;

  let openDeletePostWaring = false;
  let deletePostId: string | null = null;
  let deletePostIds: string[] | null = null;

  let createingCollection = false;
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
    PUBLIC: IconGlobe,
    SPACE: IconUsers,
    UNLISTED: IconLink,
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
      mixpanel.track('space:dashboard:posts:update:visibility', { spaceId: $posts[0].space?.id });
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
      mixpanel.track('space:dashboard:posts:update:options', { spaceId: $posts[0].space?.id });
    } else {
      mixpanel.track('me:posts:update:options');
    }
    return Promise.all(_selectedPostIds.map((postId) => updatePostOptions({ postId, ...input })));
  }

  const _deletePost = graphql(`
    mutation SpaceSettingPostsPage_DeletePost_Mutation($input: DeletePostInput!) {
      deletePost(input: $input) {
        id
      }
    }
  `);

  async function deletePost(props: { postId: string } | { postIds: string[] }) {
    const postIds = 'postId' in props ? [props.postId] : props.postIds;
    await Promise.all(postIds.map((postId) => _deletePost({ postId })));

    selectedPostIds.clear();
    selectedPostIds = selectedPostIds;

    if (type === 'space') {
      mixpanel.track('space:dashboard:posts:delete', { spaceId: $posts[0].space?.id, postIds });
    } else {
      mixpanel.track('me:posts:delete', { postIds });
    }
  }

  const handleSelectAllPost: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { checked } = event.currentTarget;

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
  };
  const handleSelectPost: ChangeEventHandler<HTMLInputElement> = (event) => {
    const { checked, value } = event.currentTarget;
    if (checked) {
      selectedPostIds.add(value);
    } else {
      selectedPostIds.delete(value);
    }

    selectedPostIds = selectedPostIds;
  };

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
  {#if $posts.length > 0}
    <Table class="text-left border-separate border-spacing-y-0.125rem">
      <TableHeader>
        <TableRow>
          <TableHead class="w-2.5rem">
            <Checkbox on:change={handleSelectAllPost} />
          </TableHead>
          <TableHead class="sm:max-w-14rem">제목</TableHead>
          <TableHead class="<sm:hidden max-w-10rem">
            {#if type === 'space'}
              작성자
            {:else}
              스페이스
            {/if}
          </TableHead>
          <TableHead class="w-12rem <sm:hidden">태그</TableHead>
          <TableHead class="<sm:w-5.25rem">공개옵션</TableHead>
          <TableHead class="<sm:hidden">관리</TableHead>
          <!-- 모바일 화면 너비에서 마지막에 빈 테이블 헤드 요소가 없으면 테이블 헤더 오른쪽이 잘리는 문제가 있어서 추가했습니다. -->
          <TableHead class="w-0" />
        </TableRow>
      </TableHeader>

      {#each $posts as post (post.id)}
        <TableRow
          class="rounded-2 [&[aria-selected='true']]:bg-primary border-solid border-b border-alphagray-10 last:border-b-0 [&>td>div]:(items-center <sm:justify-end) aria-selected:bg-primary"
          aria-selected={selectedPostIds.has('post.id')}
        >
          <TableData class="p-r-none!">
            <Checkbox checked={selectedPostIds.has(post.id)} value={post.id} on:change={handleSelectPost} />
          </TableData>
          <TableData class="sm:max-w-14rem">
            <a
              class="flex justify-start gap-xs"
              href={`/${post.space?.slug}/${post.permalink}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              {#if post.thumbnail}
                <Image class="square-2.625rem flex-shrink-0 rounded-2" $image={post.thumbnail} />
              {/if}
              <dl class="truncate [&>dt]:truncate">
                <dt class="body-15-b">
                  {post.publishedRevision.title ?? '(제목 없음)'}
                </dt>
                <dd class="body-13-m text-secondary">
                  {dayjs(post.publishedAt).formatAsDate()}
                </dd>
              </dl>
            </a>
          </TableData>
          <TableData class="<sm:hidden max-w-10rem">
            <div class="flex gap-1">
              {#if post.member && post.space}
                {#if type === 'space'}
                  <Avatar class="square-5 shrink-0" $profile={post.member.profile} />
                  <span class="body-13-b truncate">{post.member.profile.name}</span>
                  {#if post.member.id === $spaceMember?.id}
                    <Badge class="w-fit px-2 py-1" color="green">나</Badge>
                  {/if}
                {:else if type === 'me'}
                  <Avatar class="square-5" $profile={post.member.profile} />
                  <span class="body-13-b">{post.space.name}</span>
                {/if}
              {/if}
            </div>
          </TableData>
          <TableData class="<sm:hidden max-w-12rem">
            <div class="flex gap-1">
              {#each post.tags.slice(0, 3) as { tag } (tag.id)}
                <Tag size="sm">{tag.name}</Tag>
              {/each}
              {#if post.tags.length > 2}
                <Tooltip
                  message={post.tags
                    .slice(2)
                    .map(({ tag }) => (tag.name.length < 20 ? tag.name : `${tag.name.slice(0, 20)}...`))
                    .join(', ')}
                  placement="top"
                >
                  <span class="body-13-b">+{post.tags.length - 2}</span>
                </Tooltip>
              {/if}
            </div>
          </TableData>
          <TableData class="overflow-visible!">
            <div class="flex gap-0.125rem">
              {#if post.member}
                <Menu disabled={!hasPermissionToUpdatePost(post.member.id)} placement="bottom-end">
                  <span slot="value" class="flex items-center body-13-b [&>i]:text-icon-secondary">
                    <Icon class="square-4 m-r-0.15rem" icon={visibilityToIcon[post.visibility]} />
                    {visibilityToLocaleString[post.visibility]}
                    {#if hasPermissionToUpdatePost(post.member.id)}
                      <Icon class="square-4" icon={IconChevronDown} />
                    {/if}
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
              {/if}
            </div>
          </TableData>
          <TableData class="<sm:hidden">
            {#if post.member}
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
                  <Icon class="square-4 text-secondary hover:text-action-red-primary" icon={IconTrash} />
                </Button>
              </div>
            {/if}
          </TableData>
          <TableData></TableData>
        </TableRow>
      {/each}
    </Table>
  {:else}
    <p class="body-16-m text-center m-y-30">작성한 포스트가 없어요</p>
  {/if}
</div>

{#if $posts.length > 0}
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
        <Menu
          class={clsx(type === 'space' && '<sm:hidden')}
          as="div"
          offset={toolbarMenuOffset}
          placement="top"
          preventClose
        >
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
              <Icon class="square-4 color-green-50 invisible group-aria-pressed:visible" icon={IconCheck} />
            </MenuItem>
          {/each}
          <MenuItem class="flex items-center gap-0.62rem" on:click={() => (openCreateCollection = true)}>
            <Icon class="square-4 text-secondary" icon={IconPlus} />
            새로 만들기
          </MenuItem>
        </Menu>
      {/if}
      {#if selectedOwnPosts || $spaceMember?.role === 'ADMIN'}
        <Button
          class={clsx('whitespace-nowrap', type === 'space' && '<sm:hidden')}
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
{/if}

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
          await deletePost({ postIds: deletePostIds });
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
      class="w-[fit-content]"
      on:submit|preventDefault={async (event) => {
        if (!(event.currentTarget.collectionName instanceof HTMLInputElement))
          throw new Error('기대하지 않은 경우입니다.');
        if (!selectedPosts[0].space) return;

        const name = event.currentTarget.collectionName.value.trim() || '새 컬렉션';

        createingCollection = true;
        const { id: collectionId } = await createSpaceCollection({ name, spaceId: selectedPosts[0].space.id });
        const postIds = selectedPosts.map((post) => post.id);
        await setSpaceCollectionPosts({ collectionId, postIds });

        mixpanel.track('space:collection:create', {
          spaceId: selectedPosts[0].id,
          collectionId,
          postIds,
        });

        toast.success('새 컬렉션을 생성했어요');
        openCreateCollection = false;
        createingCollection = false;
      }}
    >
      <Editable name="collectionName" maxlength={20} placeholder="컬렉션명" type="text" />
    </form>
  </svelte:fragment>
  <svelte:fragment slot="subtitle">컬렉션에 노출되는 포스트를 관리하세요</svelte:fragment>
  <ul class="max-h-15rem overflow-y-auto space-y-1">
    {#each selectedPosts as post (post.id)}
      <li class="flex gap-xs items-center p-y-2">
        {#if post.thumbnail}
          <Image class="square-15 flex-shrink-0 rounded-2" $image={post.thumbnail} />
        {/if}
        <dl class="truncate [&>dt]:truncate">
          <dt class="body-15-b">
            {post.publishedRevision.title ?? '(제목 없음)'}
          </dt>
          <dd class="body-13-m text-secondary">
            {dayjs(post.publishedAt).formatAsDate()}
          </dd>
        </dl>
      </li>
    {/each}
  </ul>
  <Button slot="action" class="w-full" form="create-collection" loading={createingCollection} size="lg" type="submit">
    컬렉션 생성하기
  </Button>
</Modal>
