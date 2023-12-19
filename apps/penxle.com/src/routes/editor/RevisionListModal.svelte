<script lang="ts">
  import dayjs from 'dayjs';
  import queryString from 'query-string';
  import { getContext } from 'svelte';
  import { fragment, graphql } from '$glitch';
  import { Badge, Modal } from '$lib/components';
  import { Menu, MenuItem } from '$lib/components/menu';
  import { toast } from '$lib/notification';
  import type { Writable } from 'svelte/store';
  import type { EditorPage_RevisionListModal_Post } from '$glitch';
  import type { RestoredRevision } from './types/restore-revision';

  export let open: boolean;

  let _post: EditorPage_RevisionListModal_Post;
  export { _post as $post };

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_RevisionListModal_Post on Post {
        id
        permalink

        space {
          id
          slug
        }

        revisions {
          id
          kind
          createdAt
        }
      }
    `),
  );

  $: restoreRevision = graphql(`
    query EditorPage_RevisionListModal_RestoreRevision($permalink: String!, $revisionId: ID) @_manual {
      post(permalink: $permalink) {
        id

        draftRevision(revisionId: $revisionId) {
          id
          kind
          contentKind
          content
          title
          subtitle

          tags {
            id
            name
          }
        }
      }
    }
  `);

  let restoredRevision = getContext<Writable<RestoredRevision>>('restoredRevision');

  let selectedRevisionId: string;

  $: selectedRevisionId = $post.revisions[0].id;
  $: disabled = $post.revisions.length === 1;
</script>

<Modal size="lg" bind:open>
  <svelte:fragment slot="title">저장 이력</svelte:fragment>

  <article class="flex gap-xs h-32rem">
    <iframe
      class="w-28.625rem"
      src={`/${$post.space.slug}/preview/${$post.permalink}/?${queryString.stringify({
        revisionId: selectedRevisionId,
        hideHeader: true,
      })}`}
      title="미리보기"
    />
    <aside class="flex-grow">
      <ul class="overflow-y-auto w-full h-full">
        {#each $post.revisions as revision (revision.id)}
          <li
            class="block rounded p-x-2 p-y-xs w-full data-[pressed=true]:bg-primary hover:bg-primary flex justify-between items-center group"
            data-pressed={selectedRevisionId === revision.id}
          >
            <button
              class="flex-grow"
              aria-pressed={selectedRevisionId === revision.id}
              type="button"
              on:click={() => {
                selectedRevisionId = revision.id;
              }}
            >
              <dl>
                <dt class="body-16-b text-primary flex gap-0.25rem">
                  <time datetime={revision.createdAt.slice(0, 11)}>{dayjs(revision.createdAt).formatAsDate()}</time>
                  {#if revision.kind === 'PUBLISHED' || revision.kind === 'ARCHIVED'}
                    <Badge color="green">발행</Badge>
                  {/if}
                </dt>
                <dd class="body-13-m text-secondary">
                  <time datetime={revision.createdAt.slice(12)}>
                    {dayjs(revision.createdAt).format('HH:mm:ss')}
                  </time>
                </dd>
              </dl>
            </button>
            <Menu
              class="hidden group-data-[pressed=true]:enabled:block p-0.5rem text-secondary hover:text-primary"
              {disabled}
              placement="right-start"
            >
              <i slot="value" class="i-lc-more-horizontal square-6" aria-label="더보기 메뉴" />
              <MenuItem
                on:click={async () => {
                  const fetched = await restoreRevision.refetch({
                    permalink: $post.permalink,
                    revisionId: revision.id,
                  });
                  restoredRevision.set(fetched.post.draftRevision);

                  toast.success('저장 이력에서 포스트를 복원했어요');
                  open = false;
                }}
              >
                복원하기
              </MenuItem>
            </Menu>
          </li>
          <hr class="m-y-xs last:hidden border-color-alphagray-10" />
        {/each}
      </ul>
    </aside>
  </article>
</Modal>
