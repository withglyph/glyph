<script lang="ts">
  import IconGlobe from '~icons/glyph/globe';
  import IconHelpLine from '~icons/glyph/help-line';
  import IconLink from '~icons/glyph/link';
  import IconUsers from '~icons/glyph/users';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, SegmentButtonGroup, ToggleButton, Tooltip } from '$lib/components';
  import { Button, Modal } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import RadioGroup from '../../../../editor/[permalink]/RadioGroup.svelte';
  import type { PostAgeRating, PostVisibility, UpdateReaderOptionModal_user } from '$glitch';

  export let open = false;
  export let selectedPostIds: string[] = [];

  let visibility: PostVisibility | null = null;
  let ageRating: PostAgeRating | null = null;
  let externalSearchable: boolean | null = null;

  let _user: UpdateReaderOptionModal_user;
  export { _user as $user };

  $: user = fragment(
    _user,
    graphql(`
      fragment UpdateReaderOptionModal_user on User {
        id
        isAdulthood

        personalIdentity {
          id
        }
      }
    `),
  );

  const updatePostOptions = graphql(`
    mutation UpdateReaderOptionModal_UpdatePostOptions($input: UpdatePostOptionsInput!) {
      updatePostOptions(input: $input) {
        id
        visibility
        ageRating
        externalSearchable
      }
    }
  `);

  const updateVisibility = (e: Event) => {
    const { value } = e.currentTarget as HTMLInputElement;
    visibility = value as PostVisibility;
  };

  const updateAgeRating = (e: Event) => {
    const { value } = e.currentTarget as HTMLInputElement;
    ageRating = value as PostAgeRating;
  };
</script>

<Modal bind:open>
  <svelte:fragment slot="title">대상독자 변경</svelte:fragment>

  <div class={flex({ direction: 'column', gap: '42px' })}>
    <div>
      <p class={css({ marginBottom: '8px', fontSize: '14px' })}>공개범위</p>
      <RadioGroup
        name="visibility"
        items={[
          {
            label: '전체 공개',
            value: 'PUBLIC',
            icon: IconGlobe,
            checked: visibility === 'PUBLIC',
            disabled: false,
          },
          {
            label: '링크 공개',
            value: 'UNLISTED',
            icon: IconLink,
            checked: visibility === 'UNLISTED',
            disabled: false,
          },
          { label: '멤버 공개', value: 'SPACE', icon: IconUsers, checked: visibility === 'SPACE', disabled: false },
        ]}
        on:change={(e) => updateVisibility(e)}
      />
    </div>

    <div>
      <p class={css({ marginBottom: '8px', fontSize: '14px' })}>연령제한</p>
      <RadioGroup
        name="ageRating"
        items={[
          { label: '모든 연령', value: 'ALL', text: 'ALL', checked: ageRating === 'ALL', disabled: false },
          {
            label: '15세 이상',
            value: 'R15',
            text: '15+',
            checked: ageRating === 'R15',
            disabled: !$user.personalIdentity,
            errorMessage: '본인인증 후 연령제한 컨텐츠를 발행할 수 있어요',
          },
          {
            label: '성인물',
            value: 'R19',
            text: '20+',
            checked: ageRating === 'R19',
            disabled: !$user.isAdulthood,
            errorMessage: '성인인증 후 연령제한 컨텐츠를 발행할 수 있어요',
          },
        ]}
        on:change={(e) => updateAgeRating(e)}
      />
    </div>

    <div>
      <p class={flex({ align: 'center', gap: '4px', marginBottom: '8px', fontSize: '14px' })}>
        검색 공개
        <Tooltip style={center.raw()} message="외부 검색엔진에서 이 포스트를 검색할 수 있을지 설정해요">
          <Icon style={css.raw({ '& *': { strokeWidth: '[1]' } })} icon={IconHelpLine} size={12} />
        </Tooltip>
      </p>

      <SegmentButtonGroup style={css.raw({ maxWidth: '228px' })}>
        <ToggleButton
          name="externalSearchable"
          checked={externalSearchable === true}
          type="radio"
          value={true}
          on:change={() => (externalSearchable = true)}
        >
          외부 검색 허용
        </ToggleButton>
        <ToggleButton
          name="externalSearchable"
          checked={externalSearchable === false}
          type="radio"
          value={false}
          on:change={() => (externalSearchable = false)}
        >
          외부 검색 비허용
        </ToggleButton>
      </SegmentButtonGroup>
    </div>
  </div>

  <Button
    slot="action"
    style={css.raw({ width: 'full' })}
    disabled={!visibility || !ageRating || externalSearchable === null}
    size="lg"
    variant="gradation-fill"
    on:click={async () => {
      Promise.all(
        selectedPostIds.map((id) => updatePostOptions({ postId: id, visibility, ageRating, externalSearchable })),
      );
      mixpanel.track('post:update:option', { postIds: selectedPostIds, visibility, ageRating, externalSearchable });

      visibility = null;
      ageRating = null;
      externalSearchable = null;

      open = false;
    }}
  >
    확인
  </Button>
</Modal>
