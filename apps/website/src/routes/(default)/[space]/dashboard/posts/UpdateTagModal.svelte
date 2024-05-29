<script lang="ts">
  import IconHelpLine from '~icons/glyph/help-line';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, SegmentButtonGroup, ToggleButton, Tooltip } from '$lib/components';
  import { Button, Modal } from '$lib/components/v2';
  import { toast } from '$lib/notification';
  import { css } from '$styled-system/css';
  import { center, flex, grid } from '$styled-system/patterns';
  import PublishMenuSearch from '../../../../editor/[permalink]/PublishMenuSearch.svelte';
  import type { ChangeEventHandler } from 'svelte/elements';
  import type { PostCategory, PostPair, PostTagKind } from '$glitch';

  export let open = false;
  export let selectedPostIds: string[];

  type TagInput = {
    name: string;
    kind: PostTagKind;
  };

  const categories: { value: PostCategory; label: string }[] = [
    { value: 'ORIGINAL', label: '오리지널' },
    { value: 'FANFICTION', label: '2차창작' },
    { value: 'NONFICTION', label: '비문학' },
    { value: 'OTHER', label: '기타' },
  ];

  const pairsToLocaleString: { value: PostPair; label?: string }[] = [
    { value: 'BL' },
    { value: 'GL' },
    { value: 'HL' },
    { value: 'NONCP', label: 'Non-CP' },
    { value: 'OTHER', label: '그 외' },
  ];

  const updatePostTags = graphql(`
    mutation UpdateTagModal_UpdatePostTags_Mutation($input: UpdatePostTagsInput!) {
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
  `);

  let tags: TagInput[] = [];
  let selectedCategory: PostCategory = 'OTHER';
  let pairs: PostPair[] = [];

  let titleQuery = '';
  let characterQuery = '';
  let couplingQuery = '';
  let triggerQuery = '';
  let extraQuery = '';

  const checkPair = (e: Parameters<ChangeEventHandler<HTMLInputElement>>[0], pair: PostPair) => {
    const { checked } = e.currentTarget;

    pairs = checked ? (pairs ? [...pairs, pair] : [pair]) : pairs.filter((v) => v !== pair);
  };
</script>

<Modal bind:open>
  <svelte:fragment slot="title">태그수정</svelte:fragment>

  <form class={flex({ direction: 'column', gap: '42px' })}>
    <div>
      <h2 class={css({ paddingBottom: '8px', fontSize: '14px' })}>카테고리</h2>

      <SegmentButtonGroup>
        {#each categories as category (category.value)}
          <ToggleButton
            name="category"
            checked={selectedCategory === category.value}
            type="radio"
            value={category.value}
            on:change={() => (selectedCategory = category.value)}
          >
            {category.label}
          </ToggleButton>
        {/each}
      </SegmentButtonGroup>
    </div>

    <div>
      <h2 class={flex({ align: 'center', gap: '4px', paddingBottom: '8px', fontSize: '14px' })}>
        <span>페어</span>
        <Tooltip style={center.raw()} message="중복 선택하거나 아무것도 선택하지 않을 수 있어요" placement="top">
          <Icon
            style={css.raw({ 'color': 'gray.400', 'size': '14px', '& *': { strokeWidth: '[1]' } })}
            icon={IconHelpLine}
            size={12}
          />
        </Tooltip>
      </h2>

      <div class={grid({ columns: 4, gap: '8px' })}>
        {#each pairsToLocaleString as pair (pair.value)}
          <ToggleButton
            style={css.raw({ paddingY: '8px' })}
            checked={pairs.includes(pair.value)}
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
      placeholder="작품 이름을 입력해주세요 (예시: 마법소녀_글리프)"
      tooltip="여러 명칭을 쓸 수 있어요"
      bind:tags
      bind:query={titleQuery}
    />

    <PublishMenuSearch
      kind="CHARACTER"
      label="캐릭터"
      placeholder="캐릭터 이름을 입력해주세요 (예시: 글리핑)"
      tooltip="등장 캐릭터가 너무 많다면 주연만 써도 좋아요"
      bind:tags
      bind:query={characterQuery}
    />

    <PublishMenuSearch
      kind="COUPLING"
      label="커플링"
      placeholder="커플링을 입력해주세요 (예시: AAxBB)"
      tooltip="커플링명은 자주 쓰이는 이름으로 하면 좋아요"
      bind:tags
      bind:query={couplingQuery}
    />

    <PublishMenuSearch
      kind="TRIGGER"
      label="주의사항"
      placeholder="작품을 읽기 전 주의해야할 사항을 입력해주세요"
      tooltip="이 포스트를 독자들이 볼 때 주의해야 할 사항을 입력해주세요"
      bind:tags
      bind:query={triggerQuery}
    />

    <PublishMenuSearch
      kind="EXTRA"
      label="추가 태그"
      placeholder="추가적으로 원하는 태그를 입력해주세요"
      tooltip="위 분류에 속하지 않지만 추가적으로 넣고 싶은 태그를 입력해주세요"
      bind:tags
      bind:query={extraQuery}
    />
  </form>

  <Button
    slot="action"
    style={css.raw({ flex: '1' })}
    size="lg"
    type="submit"
    variant="gradation-fill"
    on:click={() => {
      Promise.all(selectedPostIds.map((id) => updatePostTags({ postId: id, category: selectedCategory, pairs, tags })));
      mixpanel.track('post:tags:update', { postIds: selectedPostIds, category: selectedCategory, pairs, tags });
      toast.success('태그 변경이 완료되었어요');
      open = false;
    }}
  >
    완료
  </Button>
</Modal>
