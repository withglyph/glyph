<script lang="ts">
  import dayjs from 'dayjs';
  import * as R from 'radash';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button, Helmet } from '$lib/components';
  import { Checkbox } from '$lib/components/forms';
  import { Table, TableBody, TableData, TableHead, TableHeader, TableRow } from '$lib/components/table';
  import { css } from '$styled-system/css';

  $: query = graphql(`
    query SpaceDashboardSubscribersBlockedPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        name

        blockedMasquerades {
          id
          blockedAt

          profile {
            id
            name
          }
        }
      }
    }
  `);

  const unblockMasquerade = graphql(`
    mutation SpaceDashboardSubscribersBlockedPage_UnblockMasquerade_Mutation($input: UnblockMasqueradeInput!) {
      unblockMasquerade(input: $input) {
        id

        blockedMasquerades {
          id
        }
      }
    }
  `);

  let selectedMasquerades: string[] = [];

  $: allSelected =
    $query.space.blockedMasquerades.length > 0 &&
    R.diff(
      $query.space.blockedMasquerades.map((m: (typeof $query.space.blockedMasquerades)[number]) => m.id),
      selectedMasquerades,
    ).length === 0;
</script>

<Helmet description={`${$query.space.name} 스페이스 차단 관리`} title={`차단 관리 | ${$query.space.name}`} />

<h1 class={css({ marginBottom: '2px', fontSize: '24px', fontWeight: 'bold', hideBelow: 'sm' })}>차단</h1>
<p class={css({ marginBottom: { base: '16px', sm: '32px' }, fontSize: '13px', color: 'gray.500' })}>
  차단된 유저는 스페이스의 모든 게시물을 볼 수 없으며, 댓글을 달 수 없어요.
</p>

<Table>
  <TableHeader>
    <TableRow style={css.raw({ textAlign: 'left' })}>
      <TableHead style={css.raw({ width: '50px' })}>
        <Checkbox
          checked={allSelected}
          variant="brand"
          on:change={() => {
            selectedMasquerades = allSelected ? [] : $query.space.blockedMasquerades.map((m) => m.id);
          }}
        />
      </TableHead>
      <TableHead style={css.raw({ paddingLeft: '0', fontSize: '13px', fontWeight: 'medium', color: 'gray.500' })}>
        {#if selectedMasquerades.length > 0}
          {selectedMasquerades.length}명 선택됨
        {/if}
      </TableHead>
      <TableHead style={css.raw({ width: '87px' })}>
        <Button
          size="xs"
          variant="red-outline"
          on:click={async () => {
            if (selectedMasquerades.length > 0) {
              await Promise.all(
                selectedMasquerades.map((masqueradeId) =>
                  unblockMasquerade({ spaceId: $query.space.id, masqueradeId }),
                ),
              );
              mixpanel.track('space:masquerade:unblock', {
                masqueradeIds: selectedMasquerades,
                spaceId: $query.space.id,
              });

              selectedMasquerades = [];
            }
          }}
        >
          차단해제
        </Button>
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {#each $query.space.blockedMasquerades as masquerade (masquerade.id)}
      <TableRow>
        <TableData>
          <Checkbox
            checked={selectedMasquerades.includes(masquerade.id)}
            variant="brand"
            on:change={() =>
              (selectedMasquerades = selectedMasquerades.includes(masquerade.id)
                ? selectedMasquerades.filter((id) => id !== masquerade.id)
                : [...selectedMasquerades, masquerade.id])}
          />
        </TableData>
        <TableData style={css.raw({ paddingLeft: '0' })}>
          <p class={css({ marginBottom: '2px', fontSize: '14px', fontWeight: 'semibold' })}>
            {masquerade.profile.name}
          </p>
          <p class={css({ fontSize: '12px', color: 'gray.500' })}>
            <time datetime={masquerade.blockedAt}>{dayjs(masquerade.blockedAt).formatAsDate()}</time>
            차단됨
          </p>
        </TableData>
        <TableData>
          <Button
            size="xs"
            variant="red-outline"
            on:click={async () => {
              await unblockMasquerade({ spaceId: $query.space.id, masqueradeId: masquerade.id });
              mixpanel.track('space:masquerade:unblock', { masqueradeId: masquerade.id, spaceId: $query.space.id });
            }}
          >
            차단해제
          </Button>
        </TableData>
      </TableRow>
    {/each}
  </TableBody>
</Table>
{#if $query.space.blockedMasquerades.length === 0}
  <p
    class={css({
      paddingTop: '106px',
      paddingBottom: '48px',
      fontSize: '15px',
      color: 'gray.500',
      textAlign: 'center',
    })}
  >
    차단된 유저가 없어요
  </p>
{/if}
