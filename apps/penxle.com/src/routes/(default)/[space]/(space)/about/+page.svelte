<script lang="ts">
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Helmet } from '$lib/components';
  import { css } from '$styled-system/css';

  $: query = graphql(`
    query SpaceAboutPage_Query($slug: String!) {
      space(slug: $slug) {
        name
        description
        createdAt
        id

        meAsMember {
          id
        }
      }
    }
  `);
</script>

<Helmet
  description={$query.space.description ?? `글리프의 ${$query.space.name} 스페이스 소개`}
  title={`${$query.space.name} 소개`}
/>

<div class={css({ paddingTop: '14px' })}>
  {#if $query.space.description}
    <p class={css({ marginBottom: '14px', fontSize: '13px', color: 'gray.500' })}>스페이스 소개</p>

    <p class={css({ marginBottom: '24px', fontSize: '14px', whiteSpace: 'pre-wrap' })}>
      {$query.space.description}
    </p>
  {:else if $query.space.meAsMember}
    <p class={css({ marginBottom: '14px', fontSize: '13px', color: 'gray.500' })}>스페이스 소개</p>

    <p class={css({ marginBottom: '24px', fontSize: '14px', color: 'gray.400' })}>
      아직 스페이스를 소개하는 글이 작성되지 않았어요
      <br />
      스페이스 관리에서 소개글을 작성해주세요
    </p>
  {/if}

  <p class={css({ fontSize: '14px', color: 'gray.400' })}>
    스페이스 개설일 : <time datetime={$query.space.createdAt}>
      {dayjs($query.space.createdAt).formatAsDate()}
    </time>
  </p>
</div>
