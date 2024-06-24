<script lang="ts">
  import IconChevronRight from '~icons/tabler/chevron-right';
  import { goto } from '$app/navigation';
  import ChallengeTitle from '$assets/icons/challenge.svg?component';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Helmet, Icon, Post } from '$lib/components';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import ChallengeEnrollment from './ChallengeEnrollment.svelte';

  $: query = graphql(`
    query FeedChallengePage_Query {
      me {
        id

        challengeEnrollment061: eventEnrollment(eventCode: "weekly_challenge_24061") {
          id
          ...ChallengeEnrollment_userEventEnrollment
        }

        challengeEnrollment062: eventEnrollment(eventCode: "weekly_challenge_24062") {
          id
          ...ChallengeEnrollment_userEventEnrollment
        }

        challengeEnrollment063: eventEnrollment(eventCode: "weekly_challenge_24063") {
          id
          ...ChallengeEnrollment_userEventEnrollment
        }

        challengeEnrollment064: eventEnrollment(eventCode: "weekly_challenge_24064") {
          id
          ...ChallengeEnrollment_userEventEnrollment
        }
      }

      challengeFeed {
        id
        ...Feed_Post_post
      }

      ...Feed_Post_query
    }
  `);

  const createPost = graphql(`
    mutation FeedChallengePage_CreatePost_Mutation($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        permalink
      }
    }
  `);
</script>

<Helmet description="진행 중인 챌린지를 확인하고 참여해보세요" title="챌린지 피드" />

<div
  class={flex({
    align: 'center',
    justify: 'center',
    gap: '14px',
    paddingY: '14px',
    paddingX: '16px',
    bgGradient: 'to-r',
    gradientFrom: '[#B597F6]',
    gradientTo: '[#8364E8]',
    textAlign: 'center',
  })}
>
  <span class={css({ fontSize: '14px', fontWeight: 'semibold', color: 'gray.0' })}>참여만 해도 2,000P 지급</span>
  <a class={css({ fontSize: '12px', color: 'gray.0', textDecoration: 'underline' })} href="/glyph/1181236146">
    자세히보기
  </a>
</div>

<div
  class={css({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    marginX: 'auto',
    paddingX: '20px',
    width: 'full',
    maxWidth: '900px',
  })}
>
  <div
    class={center({
      flexDirection: 'column',
      paddingY: '32px',
      backgroundColor: '[#f7f7f7]',
      smDown: { paddingX: '20px', marginX: '-20px' },
      sm: { marginTop: '24px', borderWidth: '1px', borderColor: 'gray.100' },
    })}
  >
    <div class={css({ width: 'full', maxWidth: '389px' })}>
      <div class={css({ textAlign: 'center', height: { base: '70px', sm: '94px' } })}>
        <ChallengeTitle class={css({ height: { base: '70px', sm: '94px' } })} />
      </div>

      <ul class={flex({ align: 'center', justify: 'space-between', marginTop: '24px', marginBottom: '32px' })}>
        <ChallengeEnrollment
          $eventEnrollment={$query.me?.challengeEnrollment061}
          dateRange="06.03-06.09"
          weekOfMonth="6월 1주차"
        />
        <ChallengeEnrollment
          $eventEnrollment={$query.me?.challengeEnrollment062}
          dateRange="06.10-06.16"
          weekOfMonth="6월 2주차"
        />
        <ChallengeEnrollment
          $eventEnrollment={$query.me?.challengeEnrollment063}
          dateRange="06.17-06.23"
          weekOfMonth="6월 3주차"
        />
        <ChallengeEnrollment
          $eventEnrollment={$query.me?.challengeEnrollment064}
          dateRange="06.24-06.30"
          weekOfMonth="6월 4주차"
        />
      </ul>

      <Button
        style={flex.raw({ align: 'center', justify: 'center', gap: '4px', backgroundColor: 'gray.0', width: 'full' })}
        variant="gray-outline"
        on:click={async () => {
          if (!$query.me) {
            await goto('/login');
            return;
          }

          const { permalink } = await createPost({ spaceId: undefined });
          mixpanel.track('post:create', { via: 'challenge-feed' });
          await goto(`/editor/${permalink}`);
        }}
      >
        참여하기
        <Icon icon={IconChevronRight} />
      </Button>
    </div>
  </div>

  <p class={css({ marginTop: '6px', fontSize: '11px', color: 'gray.400' })}>* 참여 여부는 주기적으로 갱신됩니다</p>

  <ul class={flex({ direction: 'column', flexGrow: '1' })}>
    {#each $query.challengeFeed as post (post.id)}
      <li
        class={css({
          '& + &': { borderTopWidth: '1px', borderColor: 'gray.50' },
        })}
      >
        <Post $post={post} {$query} showBookmark showDate showSpace timeDisplay="relative" />
      </li>
    {:else}
      <li
        class={css({
          marginY: 'auto',
          paddingY: '77px',
          fontSize: '15px',
          color: 'gray.500',
          textAlign: 'center',
        })}
      >
        아직 작성된 포스트가 없어요. 챌린지에 참여해보세요
      </li>
    {/each}
  </ul>
</div>
