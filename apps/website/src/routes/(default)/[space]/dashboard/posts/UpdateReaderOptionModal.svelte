<script lang="ts">
  import IconGlobe from '~icons/glyph/globe';
  import IconHelpLine from '~icons/glyph/help-line';
  import IconLink from '~icons/glyph/link';
  import IconUsers from '~icons/glyph/users';
  import { Icon, SegmentButtonGroup, ToggleButton, Tooltip } from '$lib/components';
  import { Modal } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import RadioGroup from '../../../../editor/[permalink]/RadioGroup.svelte';

  export let open = false;
  export let selectedPostIds: string[] = [];
  $: console.log(selectedPostIds);
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
            checked: false,
          },
          { label: '링크 공개', value: 'UNLISTED', icon: IconLink, checked: false },
          { label: '멤버 공개', value: 'SPACE', icon: IconUsers, checked: false },
        ]}
      />
    </div>

    <div>
      <p class={css({ marginBottom: '8px', fontSize: '14px' })}>연령제한</p>
      <RadioGroup
        name="ageRating"
        items={[
          { label: '모든 연령', value: 'ALL', text: 'ALL', checked: false },
          {
            label: '15세 이상',
            value: 'R15',
            text: '15+',
            checked: false,
            // disabled: !$query.me.personalIdentity,
            // errorMessage: '본인인증 후 연령제한 컨텐츠를 발행할 수 있어요',
          },
          {
            label: '성인물',
            value: 'R19',
            text: '20+',
            checked: false,
            // disabled: !$query.me.isAdulthood,
            // errorMessage: '성인인증 후 연령제한 컨텐츠를 발행할 수 있어요',
          },
        ]}
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
        <ToggleButton>외부 검색 허용</ToggleButton>
        <ToggleButton>외부 검색 비허용</ToggleButton>
      </SegmentButtonGroup>
    </div>
  </div>
</Modal>
