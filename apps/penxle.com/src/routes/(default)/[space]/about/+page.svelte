<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import dayjs from 'dayjs';
  import { graphql } from '$glitch';
  import { Avatar, Badge } from '$lib/components';

  $: query = graphql(`
    query SpaceAboutPage_Query($slug: String!) {
      space(slug: $slug) {
        name
        description
        createdAt
        id
        members {
          id
          role
          profile {
            id
            name
            ...Avatar_profile
          }
        }
      }
    }
  `);
</script>

<Helmet title={`소개 | ${$query.space.name}`} />

<section class="p-8 flex flex-col gap-3 mb-xs">
  <h2 class="subtitle-18-eb">스페이스 소개</h2>
  <p class="bodylong-16-m">{$query.space.description ?? '아직 소개가 없어요.'}</p>
  <p class="bodylong-16-m text-secondary">
    스페이스 개설일 : <time datetime={$query.space.createdAt}>
      {dayjs($query.space.createdAt).format('YYYY.MM.DD')}
    </time>
  </p>
</section>

<section class="p-8 flex flex-col gap-3">
  <h2
    class="subtitle-18-eb after:(text-secondary ml-2 content-[attr(data-count)])"
    data-count={$query.space.members.length}
  >
    스페이스 멤버
  </h2>
  <ul class="flex flex-col gap-3">
    {#each $query.space.members as member (member.id)}
      <li class="inline-flex items-center py-2">
        <Avatar class="square-6 mr-3" $profile={member.profile} />
        <span class="body-14-sb truncate">{member.profile.name}</span>
        {#if member.role === 'ADMIN'}
          <Badge class="ml-1" color="green">관리자</Badge>
        {/if}
      </li>
    {/each}
  </ul>
</section>
