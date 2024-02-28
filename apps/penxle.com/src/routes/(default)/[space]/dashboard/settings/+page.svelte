<script lang="ts">
  import { Helmet } from '@penxle/ui';
  // import { nanoid } from 'nanoid';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Button } from '$lib/components';
  import { FormField, Switch, TextArea, TextInput } from '$lib/components/forms';
  // import FormValidationMessage from '$lib/components/forms/FormValidationMessage.svelte';
  import Image from '$lib/components/Image.svelte';
  import { ThumbnailPicker } from '$lib/components/media';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { pageSubTitle } from '$lib/stores';
  import { UpdateSpaceSchema } from '$lib/validations';
  import DeleteSpaceModal from './DeleteSpaceModal.svelte';

  let thumbnailPicker: ThumbnailPicker;
  let openDeleteSpace = false;
  // let links: { id: string; url: string }[] = [{ id: nanoid(), url: '' }];
  // let sortable: Sortable;

  onMount(async () => {
    pageSubTitle.set('스페이스 설정');

    // links = $query.space.externalLinks.length === 0 ? [{ id: nanoid(), url: '' }] : $query.space.externalLinks;

    // const { Sortable, Plugins } = await import('@shopify/draggable');

    // sortable = new Sortable(document.querySelectorAll('.externalLinks'), {
    //   draggable: 'li',
    //   handle: '.linkHandle',
    //   sortAnimation: {
    //     duration: 300,
    //     easingFunction: 'ease-in-out',
    //   },
    //   plugins: [Plugins.SortAnimation],
    // });

    // sortable.on('sortable:stop', ({ newIndex, oldIndex }) => {
    //   const draggedItem = links[oldIndex];
    //   if (oldIndex > newIndex) {
    //     links = [
    //       ...links.slice(0, newIndex),
    //       draggedItem,
    //       ...links.slice(newIndex, oldIndex),
    //       ...links.slice(oldIndex + 1),
    //     ];
    //   } else {
    //     links = [
    //       ...links.slice(0, oldIndex),
    //       ...links.slice(oldIndex + 1, newIndex + 1),
    //       draggedItem,
    //       ...links.slice(newIndex + 1),
    //     ];
    //   }
    //   links = links;
    // });
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
    extra: () => ({
      iconId: icon.id,
    }),
    onSuccess: async () => {
      mixpanel.track('space:update', { spaceId: $query.space.id });
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
    isPublic: $query.space.visibility === 'PUBLIC',
  });
</script>

<Helmet description={`${$query.space.name} 스페이스 설정`} title={`설정 | ${$query.space.name}`} />

<div class="title-24-eb mb-6 <sm:hidden">
  <h2>스페이스 설정</h2>
</div>

<div class="<sm:(px-4 py-6 bg-white border border-secondary rounded-xl my-5 mx-4)">
  <form class="sm:(p-6 bg-white border border-secondary rounded-xl)" use:form>
    <input name="spaceId" type="hidden" value={$query.space.id} />

    <div class="space-y-3">
      <div>
        <div class="flex gap-3 items-center w-full">
          <button
            class="bg-primary square-19 rounded-xl overflow-hidden grow-0 shrink-0 border border-secondary"
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
        <p class="body-13-m text-disabled mt-2">JPG, PNG 업로드 가능</p>
      </div>

      <FormField name="description" label="스페이스 소개">
        <TextArea class="w-full" maxlength={200} placeholder="스페이스 설명을 입력해주세요">
          <span slot="right-icon" class="body-14-sb text-disabled">{$data.description?.length ?? 0}/200</span>
        </TextArea>
      </FormField>

      <FormField name="slug" label="스페이스 고유 URL">
        <TextInput class="w-full" maxlength={20} placeholder="URL을 입력해주세요">
          <span slot="left-text">{$page.url.host}/</span>
          <span slot="right-icon" class="body-14-sb text-disabled">{$data.slug?.length ?? 0}/20</span>
        </TextInput>
      </FormField>
    </div>

    <Switch name="isPublic" class="flex justify-between mt-8 body-16-b">
      <p>스페이스 공개</p>
    </Switch>

    <!-- <Switch class="flex justify-between mt-6 body-16-b">
      <p>관심 독자 수 공개</p>
    </Switch> -->
  </form>

  <div>
    <Button class="w-full mt-8 sm:mt-6" loading={$isSubmitting} size="xl" type="submit" on:click={handleSubmit}>
      설정 저장하기
    </Button>

    {#if $query.space.meAsMember?.role === 'ADMIN'}
      <Button class="w-full bodylong-16-m! mt-4" size="sm" variant="text" on:click={() => (openDeleteSpace = true)}>
        스페이스 삭제
      </Button>
    {/if}
  </div>
</div>

<DeleteSpaceModal $space={$query.space} bind:open={openDeleteSpace} />
<ThumbnailPicker bind:this={thumbnailPicker} on:change={(e) => (icon = e.detail)} />
