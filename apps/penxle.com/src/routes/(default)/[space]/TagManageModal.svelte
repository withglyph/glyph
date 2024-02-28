<script lang="ts">
  import mixpanel from 'mixpanel-browser';
  import { uid } from 'radash';
  import IconAlertCircle from '~icons/tabler/alert-circle';
  import { fragment, graphql } from '$glitch';
  import { Icon, SegmentButtonGroup, ToggleButton, Tooltip } from '$lib/components';
  import { Button, Modal } from '$lib/components/v2';
  import { createMutationForm } from '$lib/form';
  import { UpdatePostTagsInputSchema } from '$lib/validations/post';
  import PublishMenuSearch from '../../editor/[permalink]/PublishMenuSearch.svelte';
  import type { ChangeEventHandler } from 'svelte/elements';
  import type { PostCategory, PostPair, TagManageModal_post } from '$glitch';

  export { _post as $post };
  let _post: TagManageModal_post;
  export let open = false;

  $: post = fragment(
    _post,
    graphql(`
      fragment TagManageModal_post on Post {
        id
        category
        pairs
        tags {
          id
          kind

          tag {
            id
            name
          }
        }
      }
    `),
  );

  const { form, data, setInitialValues, isSubmitting } = createMutationForm({
    mutation: graphql(`
      mutation TagMangeModal_UpdatePostTags_Mutation($input: UpdatePostTagsInput!) {
        updatePostTags(input: $input) {
          id
          category
          pairs
          tags {
            id
            kind

            tag {
              id
              name
            }
          }
        }
      }
    `),
    schema: UpdatePostTagsInputSchema,
    onSuccess: async (resp) => {
      mixpanel.track('post:tags:update', { postId: resp.id });
      open = false;
    },
  });

  $: setInitialValues({
    postId: $post.id,
    category: $post.category,
    pairs: $post.pairs ?? [],
    tags: $post.tags.map((t) => ({ name: t.tag.name, kind: t.kind })),
  });

  let titleQuery = '';
  let characterQuery = '';
  let couplingQuery = '';
  let triggerQuery = '';
  let extraQuery = '';

  const checkPair = (e: Parameters<ChangeEventHandler<HTMLInputElement>>[0], pair: PostPair) => {
    const { checked } = e.currentTarget;

    $data.pairs = checked ? ($data.pairs ? [...$data.pairs, pair] : [pair]) : $data.pairs?.filter((v) => v !== pair);
  };

  const id = 'tag-manage-modal' + uid(2);

  const categories: { value: PostCategory; label: string }[] = [
    { value: 'ORIGINAL', label: '오리지널' },
    { value: 'FANFICTION', label: '2차창작' },
    { value: 'NONFICTION', label: '비문학' },
    { value: 'OTHER', label: '기타' },
  ];
  const pairs: { value: PostPair; label?: string }[] = [
    { value: 'BL' },
    { value: 'GL' },
    { value: 'HL' },
    { value: 'NONCP', label: 'Non-CP' },
    { value: 'OTHER', label: '그 외' },
  ];
</script>

<Modal size="md" bind:open>
  <svelte:fragment slot="title">태그수정</svelte:fragment>
  <form {id} class="p-y-4 p-x-5 space-y-2.5rem" use:form>
    <div>
      <h2 class="text-15-m p-t-1 p-b-3 flex gap-1">
        <span>카테고리</span>
      </h2>

      <SegmentButtonGroup>
        {#each categories as category (category.value)}
          <ToggleButton name="category" class="p-x-3 p-y-2" type="radio" value={category.value}>
            {category.label}
          </ToggleButton>
        {/each}
      </SegmentButtonGroup>
    </div>

    <div>
      <h2 class="text-15-m p-t-1 p-b-3 flex gap-1">
        <span>페어</span>
        <Tooltip class="flex center" message="중복 선택하거나 아무것도 선택하지 않을 수 있어요" placement="top">
          <Icon class="square-3.5 text-gray-400" icon={IconAlertCircle} />
        </Tooltip>
      </h2>

      <div class="grid grid-cols-4 gap-0.5625rem">
        {#each pairs as pair (pair.value)}
          <ToggleButton
            class="p-y-2"
            checked={$data.pairs?.includes(pair.value)}
            on:change={(e) => checkPair(e, pair.value)}
          >
            {pair.label ?? pair.value}
          </ToggleButton>
        {/each}
      </div>
    </div>

    <PublishMenuSearch
      kind="TITLE"
      label="작품"
      placeholder="예) 마법소녀_펜슬이"
      tooltip="여러 명칭을 쓸 수 있어요"
      bind:tags={$data.tags}
      bind:query={titleQuery}
    />

    <PublishMenuSearch
      kind="CHARACTER"
      label="캐릭터"
      placeholder="예) 펜슬이"
      tooltip="등장 캐릭터가 너무 많다면 주연만 써도 좋아요"
      bind:tags={$data.tags}
      bind:query={characterQuery}
    />

    <PublishMenuSearch
      kind="COUPLING"
      label="커플링"
      placeholder="예) AAxBB"
      tooltip="커플링명은 자주 쓰이는 이름으로 하면 좋아요"
      bind:tags={$data.tags}
      bind:query={couplingQuery}
    />

    <PublishMenuSearch
      kind="TRIGGER"
      label="트리거 주의"
      placeholder="예) 스포일러, 폭력성 등"
      tooltip="이 포스트를 독자들이 볼 때 주의해야 할 사항을 입력해주세요"
      bind:tags={$data.tags}
      bind:query={triggerQuery}
    />

    <PublishMenuSearch
      kind="EXTRA"
      label="추가 태그"
      placeholder="추가 태그"
      tooltip="위 분류에 속하지 않지만 추가적으로 넣고 싶은 태그를 입력해주세요"
      bind:tags={$data.tags}
      bind:query={extraQuery}
    />
  </form>
  <svelte:fragment slot="action">
    <Button class="flex-1" form={id} loading={$isSubmitting} size="xl" type="submit">수정</Button>
  </svelte:fragment>
</Modal>
