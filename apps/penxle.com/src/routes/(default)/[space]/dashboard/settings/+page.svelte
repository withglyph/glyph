<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { onMount } from 'svelte';
  // import { flip } from 'svelte/animate';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { FormField, Switch, TextArea, TextInput } from '$lib/components/forms';
  import Image from '$lib/components/Image.svelte';
  import { ThumbnailPicker } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { pageSubTitle } from '$lib/stores';
  import { UpdateSpaceSchema } from '$lib/validations';
  import DeleteSpaceModal from './DeleteSpaceModal.svelte';

  let openDeleteSpace = false;
  let thumbnailPicker: ThumbnailPicker;

  onMount(() => {
    pageSubTitle.set('스페이스 설정');
  });

  $: query = graphql(`
    query SpaceDashboardSettingsPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name
        description
        visibility

        externalLinks {
          id
          url
        }

        icon {
          id
          ...Image_image
        }

        meAsMember {
          id
          role

          profile {
            id

            avatar {
              id
            }
          }
        }

        ...SpaceDashboardSettingsPage_DeleteSpaceModal_space
      }
    }
  `);

  let icon: typeof $query.space.icon;
  $: icon = $query.space.icon;

  const { form, data, setInitialValues, isSubmitting, handleSubmit } = createMutationForm({
    mutation: graphql(`
      mutation SpaceDashboardSettingsPage_UpdateSpace_Mutation($input: UpdateSpaceInput!) {
        updateSpace(input: $input) {
          id
          slug
          name
          description
          visibility

          externalLinks {
            id
            url
          }

          icon {
            id
            ...Image_image
          }
        }
      }
    `),
    schema: UpdateSpaceSchema,
    extra: () => ({ iconId: icon.id }),
    onSuccess: async () => {
      toast.success('스페이스 설정이 변경되었어요');
      await goto(`/${$data.slug}/dashboard/settings`);
    },
  });

  $: setInitialValues({
    spaceId: $query.space.id,
    iconId: $query.space.icon.id,
    name: $query.space.name,
    slug: $query.space.slug,
    description: $query.space.description ?? '',
    externalLinks: $query.space.externalLinks.map((link) => link.url),
    isPublic: $query.space.visibility === 'PUBLIC',
  });

  let links = [
    { id: 1, url: '첫번째' },
    { id: 2, url: '두번째' },
    { id: 3, url: '세번째' },
  ];

  // let draggedItem: { id: number; url: string } | null = null;

  // const onDragStart = (dataTransfer: DataTransfer | null, link: { id: number; url: string }) => {
  //   if (dataTransfer) {
  //     dataTransfer.setData('text/plain', link.url);
  //     draggedItem = link;
  //   }
  // };

  // const onDrop = (link: { id: number; url: string }) => {
  //   if (!draggedItem) return;

  //   if (draggedItem === link) return;

  //   const indexDragged = links.findIndex((i) => i == draggedItem);
  //   const indexTarget = links.findIndex((i) => i == link);

  //   if (indexDragged > indexTarget) {
  //     links = [
  //       ...links.slice(0, indexTarget),
  //       draggedItem,
  //       ...links.slice(indexTarget, indexDragged),
  //       ...links.slice(indexDragged + 1),
  //     ];
  //   } else {
  //     links = [
  //       ...links.slice(0, indexDragged),
  //       ...links.slice(indexDragged + 1, indexTarget + 1),
  //       draggedItem,
  //       ...links.slice(indexTarget + 1),
  //     ];
  //   }

  //   draggedItem = null;
  // };
</script>

<Helmet title="스페이스 설정" />

<div class="title-24-eb mb-6 <sm:hidden">
  <h2>스페이스 설정</h2>
</div>

<div class="<sm:(px-4 py-6 bg-white border border-secondary rounded-xl) max-w-218">
  <form class="sm:(p-6 max-w-218 bg-white border border-secondary rounded-xl) sm:px-6" use:form>
    <input name="spaceId" type="hidden" value={$query.space.id} />

    <div class="space-y-3">
      <div>
        <div class="flex gap-3 items-center w-full">
          <button
            class="bg-primary square-19 rounded-xl overflow-hidden grow-0 shrink-0"
            type="button"
            on:click={() => thumbnailPicker.show()}
          >
            <Image class="square-full" $image={icon} />
          </button>

          <FormField name="name" class="grow" label="스페이스명">
            <TextInput class="w-full" maxlength={20} placeholder="스페이스명을 입력해주세요">
              <span slot="right-icon" class="body-14-sb text-disabled">{$data.name?.length ?? 0}/20</span>
            </TextInput>
          </FormField>
        </div>
        <p class="body-13-m text-disabled mt-2">파일 용량 1MB이하 / JPG만 업로드 가능</p>
      </div>

      <FormField name="description" label="스페이스 소개">
        <TextArea class="w-full" maxlength={2000} placeholder="스페이스 설명을 입력해주세요">
          <span slot="right-icon" class="body-14-sb text-disabled">{$data.description?.length ?? 0}/2,000</span>
        </TextArea>
      </FormField>

      <FormField name="slug" label="스페이스 고유 URL">
        <TextInput class="w-full" maxlength={20} placeholder="URL을 입력해주세요">
          <span slot="left-text">{$page.url.host}/</span>
          <span slot="right-icon" class="body-14-sb text-disabled">{$data.slug?.length ?? 0}/20</span>
        </TextInput>
      </FormField>

      <p class="body-14-b flex items-center justify-end gap-1">
        링크 추가
        <button
          class="border border-secondary square-6 bg-white text-secondary rounded-lg flex center"
          type="button"
          on:click={() => {
            links.push({ id: links.length + 1, url: '' });
            links = links;
          }}
        >
          <i class="i-lc-plus" />
        </button>
      </p>

      <ul class="space-y-3">
        <!-- {#each links as link, idx (link)}
          <li
            class="flex items-start gap-3"
            draggable="true"
            on:dragstart={({ dataTransfer }) => onDragStart(dataTransfer, link)}
            on:dragover|preventDefault={() => null}
            on:drop|preventDefault={() => onDrop(link)}
            animate:flip={{ duration: 500 }}
          >
            <div>
              <button
                class="square-6 p-0.5 border border-secondary rounded-lg flex center mb-1 transition cursor-move hover:border-primary"
                type="button"
                on:dragstart={({ dataTransfer }) => onDragStart(dataTransfer, link)}
                on:dragover|preventDefault={() => null}
              >
                <i class="i-lc-menu square-3.5 text-icon-secondary" />
              </button>
              <button
                class="square-6 p-0.5 border border-secondary rounded-lg flex center transition hover:border-primary"
                type="button"
                on:click={() => {
                  links = links.filter((l) => l.id !== link.id);
                  links = links;
                }}
              >
                <i class="i-lc-trash square-3.5 text-red-50" />
              </button>
            </div>

            <FormField name={`url${idx + 1}`} class="grow" label={`URL ${idx + 1}`}>
              <TextInput class="w-full" placeholder="URL을 입력해주세요" bind:value={link.url} />
            </FormField>
          </li>
        {/each} -->
      </ul>
    </div>

    <div class="flex justify-between mt-8 body-16-b">
      <p>스페이스 공개</p>
      <Switch name="isPublic" />
    </div>

    <div class="flex justify-between mt-6 body-16-b">
      <p>관심 독자 수 공개</p>
      <Switch />
    </div>
  </form>

  <Button class="w-full mt-8 sm:mt-6" loading={$isSubmitting} size="xl" type="submit" on:click={handleSubmit}>
    설정 저장하기
  </Button>

  {#if $query.space.meAsMember?.role === 'ADMIN'}
    <Button class="w-full bodylong-16-m! mt-4" size="sm" variant="text" on:click={() => (openDeleteSpace = true)}>
      스페이스 삭제
    </Button>
  {/if}
</div>

<DeleteSpaceModal $space={$query.space} bind:open={openDeleteSpace} />
<ThumbnailPicker bind:this={thumbnailPicker} on:change={(e) => (icon = e.detail)} />
