<script lang="ts">
  import { Helmet } from '@penxle/ui';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';
  import { FormField, Switch, TextInput } from '$lib/components/forms';
  import { createMutationForm } from '$lib/form';
  import { toast } from '$lib/notification';
  import { UpdateSpaceSchema } from '$lib/validations';
  import DeleteSpaceModal from './DeleteSpaceModal.svelte';

  $: query = graphql(`
    query SpaceDashboardPage_Query($slug: String!) {
      space(slug: $slug) {
        id
        slug
        name

        icon {
          id
        }

        meAsMember {
          id
          role
        }

        ...SpaceDashboardPage_DeleteSpaceModal_space
      }
    }
  `);

  let openDeleteSpace = false;

  const { form, data, setInitialValues, isSubmitting, handleSubmit } = createMutationForm({
    mutation: graphql(`
      mutation SpaceSettingsPage_UpdateSpace_Mutation($input: UpdateSpaceInput!) {
        updateSpace(input: $input) {
          id
        }
      }
    `),
    schema: UpdateSpaceSchema,
    onSuccess: async () => {
      toast.success('스페이스 설정이 변경되었어요');
      await goto(`/${$data.slug}/settings`);
    },
  });

  $: setInitialValues({
    spaceId: $query.space.id,
    iconId: $query.space.icon.id,
    name: $query.space.name,
    slug: $query.space.slug,
  });
</script>

<Helmet title="스페이스 설정" />

<form use:form>
  <input name="spaceId" type="hidden" value={$query.space.id} />
  <input name="iconId" type="hidden" value={$query.space.icon.id} />

  <FormField name="name" label="스페이스명">
    <TextInput placeholder="스페이스명을 입력해주세요">
      <span slot="right-icon" class="body-14-sb text-disabled">{$data.name?.length ?? 0}/20</span>
    </TextInput>
  </FormField>

  <!-- <FormField label="스페이스 소개">
    <TextInput placeholder="스페이스 설명을 입력해주세요">
      <span slot="right-icon" class="body-14-sb text-disabled">{$data.name?.length ?? 0}/2,000</span>
    </TextInput>
  </FormField> -->

  <FormField name="slug" label="스페이스 고유 URL">
    <TextInput placeholder="URL을 입력해주세요">
      <span slot="left-text">{$page.url.host}/</span>
      <span slot="right-icon" class="body-14-sb text-disabled">{$data.name?.length ?? 0}/20</span>
    </TextInput>
  </FormField>

  <!-- <FormField name="url1" label="URL 1">
    <TextInput placeholder="URL을 입력해주세요" />
  </FormField>

  <FormField name="url2" label="URL 2">
    <TextInput placeholder="URL을 입력해주세요" />
  </FormField> -->

  <div class="flex justify-between">
    <p>스페이스 공개</p>
    <Switch />
  </div>

  <div class="flex justify-between">
    <p>관심 독자 수 공개</p>
    <Switch />
  </div>

  <Button class="w-full" loading={$isSubmitting} type="submit" on:click={handleSubmit}>설정 저장하기</Button>
</form>

{#if $query.space.meAsMember?.role === 'ADMIN'}
  <button
    class="rounded px-4 py-2 font-medium text-red-50 hover:bg-red-5"
    type="button"
    on:click={() => (openDeleteSpace = true)}
  >
    스페이스 삭제하기
  </button>

  <DeleteSpaceModal $space={$query.space} bind:open={openDeleteSpace} />
{/if}
