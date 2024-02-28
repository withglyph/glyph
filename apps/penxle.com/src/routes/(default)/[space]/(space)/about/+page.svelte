<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import dayjs from 'dayjs';
  import IconAlertTriangle from '~icons/tabler/alert-triangle';
  import { graphql } from '$glitch';
  import { Avatar, Badge, Icon } from '$lib/components';

  $: query = graphql(`
    query SpaceAboutPage_Query($slug: String!) {
      space(slug: $slug) {
        name
        description
        createdAt
        id

        myMasquerade {
          id
          blocked
        }

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

<Helmet
  description={$query.space.description ?? `펜슬의 ${$query.space.name} 스페이스 소개`}
  title={`${$query.space.name} 소개`}
/>

<div class="w-full max-w-200 space-y-2 <sm:bg-surface-primary grow">
  {#if $query.space.myMasquerade?.blocked}
    <div class="flex flex-col center grow min-h-11rem">
      <Icon class="square-7" icon={IconAlertTriangle} />
      <p class="text-18-sb mt-1 mb-0.5">차단당했습니다</p>
      <p class="text-14-r text-gray-500">{$query.space.name}의 게시물을 볼 수 없어요</p>
    </div>
  {:else}
    <section class="p-8 flex flex-col gap-3 bg-cardprimary">
      <h2 class="subtitle-18-eb">스페이스 소개</h2>
      <p class="bodylong-16-m whitespace-pre-wrap">
        {$query.space.description ?? '아직 스페이스 소개가 작성되지 않았어요'}
      </p>
      <p class="bodylong-16-m text-secondary">
        스페이스 개설일 : <time datetime={$query.space.createdAt}>
          {dayjs($query.space.createdAt).formatAsDate()}
        </time>
      </p>
    </section>

    <section class="p-8 flex flex-col gap-3 bg-cardprimary">
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
  {/if}
</div>
