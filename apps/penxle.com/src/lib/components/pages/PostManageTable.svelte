<script generics="T extends 'space' | 'me'" lang="ts">
  import { PostVisibility } from '@prisma/client';
  import clsx from 'clsx';
  import dayjs from 'dayjs';
  import { fragment, graphql } from '$glitch';
  import { Avatar, Badge, Button, Image, Modal, Tag, Tooltip } from '$lib/components';
  import { Checkbox, Switch } from '$lib/components/forms';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { Table, TableData, TableHead, TableRow } from '$lib/components/table';
  import { toast } from '$lib/notification';
  import type { PostManageTable_Post_query, PostManageTable_SpaceMember } from '$glitch';
  import type { UpdatePostOptionsInput } from '$lib/validations/post';

  export let type: T;
  export let _posts: PostManageTable_Post_query[];
  export let _spaceMember: PostManageTable_SpaceMember | null = null;

  type $$Props = { type: typeof type; $posts: typeof _posts } & (T extends 'space'
    ? { $spaceMember: typeof _spaceMember }
    : unknown);
  export { _posts as $posts, _spaceMember as $spaceMember };

  $: posts = fragment(
    _posts,
    graphql(`
      fragment PostManageTable_Post_query on Post {
        id
        permalink
        createdAt

        tags {
          id

          tag {
            id
            name
          }
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

        option {
          id
          receiveFeedback
          receiveTagContribution
          discloseStats
          visibility
        }

        revision {
          id
          title
          createdAt

          thumbnail {
            id

            thumbnail {
              id
              ...Image_image
            }
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

  function hasPermissionToUpdatePost(memberId: string) {
    if (type === 'me') return true;

    if (!$spaceMember) throw new Error('스페이스 관리 페이지에서는 "$spaceMember" prop 가 필수에요');

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

  function resetPostOptions() {
    receiveFeedback = selectedPosts.every((post) => post.option.receiveFeedback);
    receiveTagContribution = selectedPosts.every((post) => post.option.receiveTagContribution);
    discloseStats = selectedPosts.every((post) => post.option.discloseStats);
  }

  $: if (selectedPostIds.size > 0) {
    resetPostOptions();
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
        option {
          id
          visibility
        }
      }
    }
  `);

  function updateVisibilities(visibility: PostVisibility) {
    return Promise.all(_selectedPostIds.map((postId) => updateVisibility({ postId, visibility })));
  }

  const updatePostOptions = graphql(`
    mutation SpaceSettingPostsPage_UpdatePostOptions_Mutation($input: UpdatePostOptionsInput!) {
      updatePostOptions(input: $input) {
        id
        option {
          id
          receiveFeedback
          receiveTagContribution
          discloseStats
        }
      }
    }
  `);

  function updatePostsOptions(
    input: Pick<UpdatePostOptionsInput, 'receiveFeedback' | 'receiveTagContribution' | 'discloseStats'>,
  ) {
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
</script>

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
      class="rounded-2 [&[aria-selected='true']]:bg-primary border-solid border-b border-alphagray-10 last:border-b-0 [&>td>div]:(items-center <sm:justify-end)"
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
          {#if post.revision.thumbnail}
            <Image class="square-2.625rem flex-shrink-0 rounded-2" $image={post.revision.thumbnail.thumbnail} />
          {/if}
          <dl class="truncate [&>dt]:truncate">
            <dt class="body-15-b">
              {post.revision.title}
            </dt>
            <dd class="body-13-m text-secondary">
              {dayjs(post.createdAt).formatAsDate()}
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
          {#each post.tags.slice(0, 3) as tag (tag.id)}
            <Tag size="sm">{tag.tag.name}</Tag>
          {/each}
          {#if post.tags.length > 2}
            <Tooltip
              message={post.tags
                .slice(2)
                .map((tag) => tag.tag.name)
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
          <Menu
            class="flex items-center body-13-b [&>i]:text-icon-secondary disabled:[&>i.i-lc-chevron-down]:hidden "
            disabled={!hasPermissionToUpdatePost(post.member.id)}
            placement="bottom-end"
          >
            <svelte:fragment slot="value">
              <i class={clsx(visibilityToIcon[post.option.visibility], 'square-4 m-r-0.15rem')} />
              {visibilityToLocaleString[post.option.visibility]}
              <i class="i-lc-chevron-down square-4" />
            </svelte:fragment>

            {#each visibilityOptions as visibilityOption (visibilityOption.value)}
              <MenuItem
                aria-pressed={post.option.visibility === visibilityOption.value}
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

<div
  class={clsx(
    selectedPostCount > 0 ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 translate-y-1rem',
    'self-center flex <sm:flex-col flex-wrap gap-4 items-center px-6 py-2 flex-wrap sticky bottom-1rem bg-white rounded-2xl shadow-[0_0.25rem_1rem_0_rgba(0,0,0,0.15)] transition-all-300',
  )}
>
  <span class="body-15-b" aria-live="polite">
    {selectedPostCount}개의 포스트 선택됨
  </span>
  {#if selectedOwnPosts || $spaceMember?.role === 'ADMIN'}
    <div class="flex gap-4 <sm:(flex-col [&>*]:w-full)">
      <Menu as="div" offset={16} placement="top">
        <Button slot="value" color="secondary" size="md">공개범위 설정</Button>
        <MenuItem on:click={() => updateVisibilities('PUBLIC')}>전체 공개</MenuItem>
        <MenuItem on:click={() => updateVisibilities('UNLISTED')}>링크 공개</MenuItem>
        <MenuItem on:click={() => updateVisibilities('SPACE')}>멤버 공개</MenuItem>
      </Menu>
      <Menu as="div" offset={16} placement="top">
        <Button slot="value" color="secondary" size="md">포스트 옵션 설정</Button>
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
      <Tooltip message="컬렉션 기능은 아직 준비중이에요">
        <Button color="secondary" disabled size="md">컬렉션 추가</Button>
      </Tooltip>
      <Button
        color="red"
        size="md"
        on:click={() => {
          deletePostIds = _selectedPostIds;
          openDeletePostWaring = true;
        }}
      >
        삭제하기
      </Button>
    </div>
  {:else}
    <Tooltip message="컬렉션 기능은 아직 준비중이에요">
      <Button disabled>컬렉션 추가</Button>
    </Tooltip>
  {/if}
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
          throw new Error('기대하지 않은 경우에요');
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
