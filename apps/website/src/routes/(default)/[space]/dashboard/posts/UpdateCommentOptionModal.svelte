<script lang="ts">
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { SegmentButtonGroup, ToggleButton, Tooltip } from '$lib/components';
  import { Switch } from '$lib/components/forms';
  import { Button, Modal } from '$lib/components/v2';
  import { toast } from '$lib/notification';
  import { css } from '$styled-system/css';
  import { flex, grid } from '$styled-system/patterns';
  import type { PostCommentQualification, UpdateCommentOptionModal_user } from '$glitch';

  export let open = false;
  export let selectedPostIds: string[] = [];

  let commentQualification: PostCommentQualification = 'ANY';

  let _user: UpdateCommentOptionModal_user;
  export { _user as $user };

  $: user = fragment(
    _user,
    graphql(`
      fragment UpdateCommentOptionModal_user on User {
        id

        personalIdentity {
          id
        }
      }
    `),
  );

  const updatePostOptions = graphql(`
    mutation UpdateCommentOptionModal_UpdatePostOptions($input: UpdatePostOptionsInput!) {
      updatePostOptions(input: $input) {
        id
        commentQualification
      }
    }
  `);
</script>

<Modal style={css.raw({ paddingBottom: '60px' })} bind:open>
  <svelte:fragment slot="title">댓글옵션 변경</svelte:fragment>

  <div class={flex({ direction: 'column', gap: '34px' })}>
    <Switch
      style={flex.raw({ justify: 'space-between', align: 'center' })}
      checked={commentQualification === 'ANY'}
      on:change={(e) => {
        commentQualification = e.currentTarget.checked ? 'ANY' : 'NONE';
      }}
    >
      <dl>
        <dt class={css({ marginBottom: '2px', fontSize: '14px' })}>댓글 허용</dt>
        <dd class={css({ fontSize: '13px', color: 'gray.600' })}>
          독자들이 포스트에 대한 의견을 나누고 소통할 수 있어요
        </dd>
      </dl>
    </Switch>

    <div>
      <dl class={css({ marginBottom: '16px' })}>
        <dt class={css({ marginBottom: '2px', fontSize: '14px' })}>댓글을 달 수 있는 계정</dt>
        <dd class={css({ fontSize: '13px', color: 'gray.600' })}>
          포스트에 대한 댓글을 달 수 있는 계정을 선택할 수 있어요
        </dd>
      </dl>

      <SegmentButtonGroup style={grid.raw({ columns: 2, gap: '0' })}>
        <ToggleButton
          name="commentQualification"
          checked={commentQualification === 'ANY'}
          type="radio"
          value="ANY"
          on:change={() => (commentQualification = 'ANY')}
        >
          모든계정
        </ToggleButton>
        <Tooltip enabled={$user.personalIdentity === null} message="본인 인증 후 이용할 수 있어요" offset={4}>
          <ToggleButton
            name="commentQualification"
            style={css.raw({ width: 'full' })}
            checked={commentQualification === 'IDENTIFIED'}
            disabled={$user.personalIdentity === null}
            type="radio"
            value="IDENTIFIED"
            on:change={() => (commentQualification = 'IDENTIFIED')}
          >
            본인 인증된 계정
          </ToggleButton>
        </Tooltip>
      </SegmentButtonGroup>
    </div>
  </div>

  <Button
    slot="action"
    style={css.raw({ width: 'full' })}
    size="lg"
    variant="gradation-fill"
    on:click={() => {
      Promise.all(selectedPostIds.map((id) => updatePostOptions({ postId: id, commentQualification })));
      mixpanel.track('post:update:option', { postIds: selectedPostIds, commentQualification });

      commentQualification = 'ANY';
      toast.success('댓글옵션 변경이 완료되었어요');
      open = false;
    }}
  >
    확인
  </Button>
</Modal>
