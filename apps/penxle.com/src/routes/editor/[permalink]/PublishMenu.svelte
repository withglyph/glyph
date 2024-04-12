<script lang="ts">
  import { onMount } from 'svelte';
  import IconGlobe from '~icons/glyph/globe';
  import IconLink from '~icons/glyph/link';
  import IconUsers from '~icons/glyph/users';
  import IconAlertCircle from '~icons/tabler/alert-circle';
  import IconAlertTriangle from '~icons/tabler/alert-triangle';
  import IconFileSettings from '~icons/tabler/file-settings';
  import IconMessageCircle from '~icons/tabler/message-circle-2';
  import IconPhotoCheck from '~icons/tabler/photo-check';
  import IconPlanet from '~icons/tabler/planet';
  import IconPlus from '~icons/tabler/plus';
  import IconTag from '~icons/tabler/tag';
  import IconUser from '~icons/tabler/user';
  import IconX from '~icons/tabler/x';
  import { goto } from '$app/navigation';
  import { fragment, graphql } from '$glitch';
  import { mixpanel } from '$lib/analytics';
  import { Icon, Image, SegmentButtonGroup, ToggleButton, Tooltip } from '$lib/components';
  import { Checkbox, FormValidationMessage, Switch } from '$lib/components/forms';
  import ThumbnailPicker from '$lib/components/media/ThumbnailPicker.svelte';
  import { CreateCollectionModal } from '$lib/components/pages/collections';
  import { Button } from '$lib/components/v2';
  import { Select, SelectItem } from '$lib/components/v2/select';
  import { createMutationForm } from '$lib/form';
  import { PublishPostInputSchema } from '$lib/validations/post';
  import { css } from '$styled-system/css';
  import { center, flex } from '$styled-system/patterns';
  import CreateSpaceModal from '../../(default)/CreateSpaceModal.svelte';
  import { getEditorContext } from './context';
  import PublishMenuSearch from './PublishMenuSearch.svelte';
  import RadioGroup from './RadioGroup.svelte';
  import type { ChangeEventHandler } from 'svelte/elements';
  import type { EditorPage_PublishMenu_post, EditorPage_PublishMenu_query, Image_image, PostPair } from '$glitch';

  export { _post as $post, _query as $query };
  let _post: EditorPage_PublishMenu_post;
  let _query: EditorPage_PublishMenu_query;
  export let open = false;

  const { forceSave } = getEditorContext();

  $: query = fragment(
    _query,
    graphql(`
      fragment EditorPage_PublishMenu_query on Query {
        me @_required {
          id

          personalIdentity {
            id
          }

          spaces {
            id
            name
            slug
            visibility

            icon {
              id
              ...Image_image
            }

            collections {
              id
              name

              thumbnail {
                id
                ...Image_image
              }
            }
          }

          posts(state: DRAFT) {
            id
          }

          ...CreateSpaceModal_user
        }
      }
    `),
  );

  $: post = fragment(
    _post,
    graphql(`
      fragment EditorPage_PublishMenu_post on Post {
        id
        permalink
        state
        discloseStats
        hasPassword
        receiveFeedback
        receivePatronage
        receiveTagContribution
        protectContent
        visibility
        category
        pairs
        externalSearchable
        ageRating
        commentQualification

        thumbnail {
          id
          ...Image_image
        }

        space {
          id
        }

        tags {
          id
          kind

          tag {
            id
            name
          }
        }

        draftRevision {
          id
        }

        collection {
          id
        }

        ...EditorPage_RevisionListModal_Post
      }
    `),
  );

  const { form, data, setInitialValues, handleSubmit, isSubmitting } = createMutationForm({
    mutation: graphql(`
      mutation EditorPage_PublishMenu_PublishPost_Mutation($input: PublishPostInput!) {
        publishPost(input: $input) {
          id
          permalink
          discloseStats
          receiveFeedback
          receivePatronage
          receiveTagContribution
          protectContent
          visibility

          space @_required {
            id
            slug
          }
        }
      }
    `),
    schema: PublishPostInputSchema,
    extra: async () => {
      const revisionId = await forceSave();
      return {
        revisionId,
        spaceId: selectedSpaceId,
        collectionId: selectedCollectionId,
        thumbnailId: currentThumbnail?.id,
      };
    },
    onSuccess: async (resp) => {
      mixpanel.track('post:publish', { postId: resp.id });
      await goto(`/${resp.space.slug}/${resp.permalink}`);
    },
  });

  $: setInitialValues({
    revisionId: $post.draftRevision.id,
    spaceId: $post.space ? $post.space.id : '',
    collectionId: $post.collection ? $post.collection.id : undefined,
    thumbnailId: $post.thumbnail?.id,
    visibility: $post.visibility,
    password: $post.hasPassword ? '' : undefined,
    ageRating: $post.ageRating,
    externalSearchable: $post.externalSearchable,
    discloseStats: $post.discloseStats,
    receiveFeedback: $post.receiveFeedback,
    receivePatronage: $post.receivePatronage,
    receiveTagContribution: $post.receiveTagContribution,
    protectContent: $post.protectContent,
    commentQualification: $post.commentQualification,
    category: $post.category,
    pairs: $post.pairs ?? [],
    tags: $post.tags.map((t) => ({ name: t.tag.name, kind: t.kind })),
  });

  let enablePassword = false;
  let createSpaceOpen = false;
  let createCollectionOpen = false;

  $: if ($post?.hasPassword) {
    enablePassword = true;
  }

  let selectedSpaceId: string | undefined = undefined;

  $: selectedSpace = $query.me.spaces.find((space) => space.id === selectedSpaceId);

  let spaceSelectorOpen = false;
  let collectionSelectorOpen = false;

  let tabIndex = 0;
  let selectedCollectionId: string | undefined = undefined;

  $: selectedCollection = selectedSpace?.collections.find((collection) => collection.id === selectedCollectionId);

  let titleQuery = '';
  let characterQuery = '';
  let couplingQuery = '';
  let triggerQuery = '';
  let extraQuery = '';

  let thumbnailPicker: ThumbnailPicker;

  let thumbnail: ({ id: string } & Image_image) | null | undefined = undefined;
  $: currentThumbnail = thumbnail === undefined ? $post.thumbnail : thumbnail;

  const checkPair = (e: Parameters<ChangeEventHandler<HTMLInputElement>>[0], pair: PostPair) => {
    const { checked } = e.currentTarget;

    $data.pairs = checked ? ($data.pairs ? [...$data.pairs, pair] : [pair]) : $data.pairs?.filter((v) => v !== pair);
  };

  onMount(() => {
    selectedSpaceId = $post.space?.id;
    selectedCollectionId = $post.collection?.id;
  });

  const tabHeadItemStyle = flex({
    'align': 'center',
    'textAlign': 'left',
    'fontSize': '14px',
    'fontWeight': 'medium',
    '_pressed': { color: 'gray.900' },
    'smDown': {
      borderBottomWidth: '2px',
      borderBottomColor: 'gray.5',
      color: 'gray.400',
      _pressed: { borderBottomColor: 'gray.900' },
      paddingBottom: '2px',
    },
    'sm': {
      paddingX: '16px',
      paddingY: '14px',
      gap: '6px',
      color: 'gray.500',
      _hover: { backgroundColor: 'gray.50' },
      _pressed: { backgroundColor: 'gray.50' },
    },
    '& > svg': {
      'hideBelow': 'sm',
      '& path': {
        strokeWidth: '2px',
      },
    },
  });

  const tabContentStyle = flex({ flexDirection: 'column', gap: '42px' });

  const labelStyleRaw = css.raw({
    fontSize: { base: '15px', sm: '14px' },
    fontWeight: { base: 'medium', sm: 'semibold' },
  });
  const labelStyle = css(labelStyleRaw, { display: 'flex', gap: '4px', paddingTop: '4px', paddingBottom: '8px' });
  const labelWithDescriptionStyle = css({
    '&>dt': { ...labelStyleRaw, paddingY: '4px' },
    '&>dd': { fontSize: '11px', color: { base: 'gray.400', sm: 'gray.600' } },
  });
</script>

<div
  class={css(
    {
      backgroundColor: 'gray.5',
      zIndex: '50',
      smDown: {
        width: 'full',
        boxShadow: '[0 8px 24px 0 {colors.gray.900/28}]',
      },
      sm: {
        borderWidth: '1px',
        borderColor: 'gray.200',
        borderTopWidth: '0',
        boxShadow: '[0 5px 22px 0 {colors.gray.900/6}]',
      },
    },
    !open && { display: 'none' },
  )}
>
  <div
    class={css({
      borderBottomWidth: '1px',
      borderBottomColor: 'gray.150',
      paddingX: '24px',
      paddingY: '16px',
    })}
  >
    <p class={css({ fontWeight: 'semibold', position: 'relative', textAlign: 'center' })}>
      게시 옵션
      <button class={css({ position: 'absolute', right: '0' })} type="button" on:click={() => (open = false)}>
        <Icon icon={IconX} size={24} />
      </button>
    </p>
  </div>

  <div class={flex({ smDown: { flexDirection: 'column' } })}>
    <div
      class={flex({
        smDown: {
          gap: '32px',
          paddingX: '20px',
          paddingY: '16px',
          width: 'full',
          whiteSpace: 'nowrap',
          overflowX: 'auto',
        },
        sm: {
          flexDirection: 'column',
          borderRightWidth: '1px',
          borderRightColor: 'gray.100',
          width: '208px',
        },
      })}
    >
      <button class={tabHeadItemStyle} aria-pressed={tabIndex === 0} type="button" on:click={() => (tabIndex = 0)}>
        <Icon icon={IconPlanet} size={16} />
        발행
      </button>
      <button class={tabHeadItemStyle} aria-pressed={tabIndex === 1} type="button" on:click={() => (tabIndex = 1)}>
        <Icon icon={IconTag} size={16} />
        태그
      </button>
      <button class={tabHeadItemStyle} aria-pressed={tabIndex === 2} type="button" on:click={() => (tabIndex = 2)}>
        <Icon icon={IconPhotoCheck} size={16} />
        썸네일
      </button>
      <button class={tabHeadItemStyle} aria-pressed={tabIndex === 3} type="button" on:click={() => (tabIndex = 3)}>
        <Icon icon={IconUser} size={16} />
        대상 독자
      </button>
      <button class={tabHeadItemStyle} aria-pressed={tabIndex === 4} type="button" on:click={() => (tabIndex = 4)}>
        <Icon icon={IconMessageCircle} size={16} />
        댓글
      </button>
      <button class={tabHeadItemStyle} aria-pressed={tabIndex === 5} type="button" on:click={() => (tabIndex = 5)}>
        <Icon icon={IconFileSettings} size={16} />
        세부 옵션
      </button>
    </div>

    <form
      class={css({
        overflowY: 'auto',
        smDown: { paddingX: '20px', paddingBottom: '32px', width: 'full', height: '[50vh]' },
        sm: { paddingX: '24px', paddingY: '20px', width: '504px', height: '432px' },
      })}
      use:form
    >
      <input name="thumbnailId" type="hidden" value={currentThumbnail?.id} />

      <section class={tabContentStyle} hidden={tabIndex !== 0}>
        <div>
          <h3 class={labelStyle}>스페이스</h3>

          <Select
            style={css.raw({ height: '[66px!]' })}
            disabled={$post.state === 'PUBLISHED'}
            listStyle={css.raw({ top: '66px' })}
            bind:open={spaceSelectorOpen}
          >
            <Tooltip
              slot="placeholder"
              style={css.raw({ flexGrow: '1', textAlign: 'left', truncate: true })}
              enabled={$post.state === 'PUBLISHED'}
              message="이미 게시한 포스트는 스페이스를 바꿀 수 없어요"
              offset={16}
              placement="top"
            >
              <div class={flex({ align: 'center', gap: '8px' })}>
                <Image style={css.raw({ flex: 'none', size: '38px' })} $image={selectedSpace?.icon} placeholder />
                <div class={css({ truncate: true, color: 'gray.500' })}>
                  <p class={css({ marginBottom: '2px', fontSize: '12px' })}>
                    {#if selectedSpace}
                      {selectedSpace.visibility === 'PUBLIC' ? '공개 스페이스' : '비공개 스페이스'}
                    {:else}
                      스페이스 공개 여부
                    {/if}
                  </p>
                  <p class={css({ fontSize: '14px', fontWeight: 'medium', truncate: true })}>
                    {selectedSpace ? selectedSpace.name : '스페이스를 선택해주세요'}
                  </p>
                </div>
              </div>
            </Tooltip>

            {#each $query.me.spaces as space (space.id)}
              <SelectItem
                pressed={selectedSpaceId === space.id}
                on:click={() => {
                  if (selectedSpaceId !== space.id) {
                    selectedCollectionId = undefined;
                  }

                  selectedSpaceId = space.id;
                  spaceSelectorOpen = false;
                }}
              >
                <div class={flex({ align: 'center', gap: '8px', truncate: true })}>
                  <Image style={css.raw({ flex: 'none', size: '38px' })} $image={space.icon} />
                  <div class={css({ truncate: true })}>
                    <p class={css({ marginBottom: '2px', fontSize: '12px', color: 'gray.500' })}>
                      {space.visibility === 'PUBLIC' ? '공개 스페이스' : '비공개 스페이스'}
                    </p>
                    <p class={css({ fontSize: '14px', truncate: true })}>
                      {space.name}
                    </p>
                  </div>
                </div>
              </SelectItem>
            {/each}
            <svelte:fragment slot="create">
              <SelectItem state="create" on:click={() => (createSpaceOpen = true)}>
                <div class={flex({ align: 'center', gap: '4px' })}>
                  <Icon icon={IconPlus} />
                  새로운 스페이스 추가하기
                </div>
              </SelectItem>
            </svelte:fragment>
          </Select>
        </div>

        <div>
          <h3 class={labelStyle}>컬렉션</h3>

          <Select
            style={css.raw({ height: '[fit-content]' })}
            disabled={!selectedSpace}
            size="md"
            bind:open={collectionSelectorOpen}
          >
            <div slot="placeholder" class={flex({ alignItems: 'center', gap: '[15.6px]' })}>
              <Image
                style={css.raw({ height: '38px', aspectRatio: '3/4' })}
                $image={selectedCollection?.thumbnail}
                placeholder
              />
              {#if selectedCollection}
                {selectedCollection.name}
              {:else}
                <span class={css({ color: 'gray.500' })}>컬렉션을 선택해주세요</span>
              {/if}
            </div>

            {#if collectionSelectorOpen && selectedSpace?.collections}
              {#each selectedSpace?.collections as collection (collection.id)}
                <SelectItem
                  on:click={() => {
                    selectedCollectionId = collection.id;
                    collectionSelectorOpen = false;
                  }}
                >
                  <div class={flex({ alignItems: 'center', gap: '[15.6px]' })}>
                    <Image
                      style={css.raw({ height: '38px', aspectRatio: '3/4' })}
                      $image={collection?.thumbnail}
                      placeholder
                    />
                    {collection.name}
                  </div>
                </SelectItem>
              {/each}
            {/if}

            <svelte:fragment slot="create">
              <SelectItem state="create" on:click={() => (createCollectionOpen = true)}>
                <div class={flex({ align: 'center', gap: '4px' })}>
                  <Icon icon={IconPlus} />
                  새로운 컬렉션 추가하기
                </div>
              </SelectItem>
            </svelte:fragment>
          </Select>
        </div>
      </section>

      <section class={tabContentStyle} hidden={tabIndex !== 1}>
        <div>
          <h3 class={labelStyle}>카테고리</h3>

          <SegmentButtonGroup>
            <ToggleButton name="category" type="radio" value="ORIGINAL">오리지널</ToggleButton>
            <ToggleButton name="category" type="radio" value="FANFICTION">2차창작</ToggleButton>
            <ToggleButton name="category" type="radio" value="NONFICTION">비문학</ToggleButton>
            <ToggleButton name="category" type="radio" value="OTHER">기타</ToggleButton>
          </SegmentButtonGroup>
        </div>

        <div>
          <h3 class={labelStyle}>
            카테고리 페어
            <Tooltip style={center.raw()} message="중복 선택하거나 아무것도 선택하지 않을 수 있어요" placement="top">
              <Icon style={css.raw({ color: 'gray.400' })} icon={IconAlertCircle} />
            </Tooltip>
          </h3>

          <div
            class={flex({
              'gap': '8px',
              'flexWrap': 'wrap',
              '& > *': {
                width: '84px',
              },
            })}
          >
            <ToggleButton checked={$data.pairs?.includes('BL')} on:change={(e) => checkPair(e, 'BL')}>BL</ToggleButton>
            <ToggleButton checked={$data.pairs?.includes('GL')} on:change={(e) => checkPair(e, 'GL')}>GL</ToggleButton>
            <ToggleButton checked={$data.pairs?.includes('HL')} on:change={(e) => checkPair(e, 'HL')}>HL</ToggleButton>
            <ToggleButton checked={$data.pairs?.includes('NONCP')} on:change={(e) => checkPair(e, 'NONCP')}>
              Non-CP
            </ToggleButton>
            <ToggleButton checked={$data.pairs?.includes('OTHER')} on:change={(e) => checkPair(e, 'OTHER')}>
              그 외
            </ToggleButton>
          </div>
        </div>

        <PublishMenuSearch
          kind="TITLE"
          label="작품"
          placeholder="작품 이름을 입력해주세요 (예시: 마법소녀_글리프)"
          tooltip="여러 명칭을 쓸 수 있어요"
          bind:tags={$data.tags}
          bind:query={titleQuery}
        />

        <PublishMenuSearch
          kind="CHARACTER"
          label="캐릭터"
          placeholder="캐릭터 이름을 입력해주세요 (예시: 글리핑)"
          tooltip="등장 캐릭터가 너무 많다면 주연만 써도 좋아요"
          bind:tags={$data.tags}
          bind:query={characterQuery}
        />

        <PublishMenuSearch
          kind="COUPLING"
          label="커플링"
          placeholder="커플링을 입력해주세요 (예시: AAxBB)"
          tooltip="커플링명은 자주 쓰이는 이름으로 하면 좋아요"
          bind:tags={$data.tags}
          bind:query={couplingQuery}
        />

        <PublishMenuSearch
          kind="TRIGGER"
          label="읽기 전 주의사항"
          placeholder="작품을 읽기 전 주의해야할 사항을 입력해주세요 (예시: 스포일러, 폭력성 등)"
          tooltip="이 포스트를 독자들이 볼 때 주의해야 할 사항을 입력해주세요"
          bind:tags={$data.tags}
          bind:query={triggerQuery}
        />

        <PublishMenuSearch
          kind="EXTRA"
          label="추가 태그"
          placeholder="추가적으로 원하는 태그를 입력해주세요"
          tooltip="위 분류에 속하지 않지만 추가적으로 넣고 싶은 태그를 입력해주세요"
          bind:tags={$data.tags}
          bind:query={extraQuery}
        />
      </section>

      <div hidden={tabIndex !== 2}>
        <h3 class={labelStyle}>썸네일</h3>

        {#if currentThumbnail}
          <div
            class={flex({
              justify: 'space-between',
              align: 'center',
              borderWidth: '1px',
              borderColor: 'gray.200',
              paddingX: '16px',
              paddingY: '14px',
            })}
          >
            <Image
              style={css.raw({ height: '38px', aspectRatio: '16/10', objectFit: 'cover', backgroundColor: 'gray.300' })}
              $image={currentThumbnail}
            />
            <div
              class={flex({
                'align': 'center',
                'gap': '8px',
                '& > *': {
                  width: '68px',
                },
              })}
              role="group"
            >
              <Button size="sm" variant="red-fill" on:click={() => (thumbnail = null)}>삭제</Button>
              <Button size="sm" variant="gray-outline" on:click={() => thumbnailPicker.show()}>변경</Button>
            </div>
          </div>
        {:else}
          <!-- eslint-disable-next-line svelte/valid-compile -->
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label
            class={flex({
              cursor: 'pointer',
              justify: 'space-between',
              align: 'center',
              borderWidth: '1px',
              borderColor: 'gray.150',
              paddingX: '16px',
              paddingY: '14px',
              width: 'full',
            })}
          >
            <div class={flex({ align: 'center', gap: '8px' })}>
              <Image style={css.raw({ height: '38px', aspectRatio: '16/10' })} placeholder />
              <span class={css({ fontSize: '14px', fontWeight: 'medium', color: 'gray.500' })}>
                썸네일을 업로드해주세요
              </span>
            </div>

            <Button
              style={css.raw({ width: '68px' })}
              size="sm"
              variant="cyan-fill"
              on:click={() => thumbnailPicker.show()}
            >
              업로드
            </Button>
          </label>
        {/if}
      </div>

      <section class={tabContentStyle} hidden={tabIndex !== 3}>
        <div>
          <h3 class={labelStyle}>공개 범위</h3>

          <RadioGroup
            name="visibility"
            items={[
              {
                label: '전체 공개',
                value: 'PUBLIC',
                icon: IconGlobe,
                checked: $data.visibility === 'PUBLIC',
              },
              { label: '링크 공개', value: 'UNLISTED', icon: IconLink, checked: $data.visibility === 'UNLISTED' },
              { label: '멤버 공개', value: 'SPACE', icon: IconUsers, checked: $data.visibility === 'SPACE' },
            ]}
          />
        </div>

        <div>
          <h3 class={labelStyle}>
            비밀글
            <Tooltip style={center.raw()} message="설정하면 비밀번호를 입력한 독자만 내용을 열람할 수 있어요">
              <Icon style={css.raw({ color: 'gray.400' })} icon={IconAlertCircle} />
            </Tooltip>
          </h3>

          <Checkbox
            style={css.raw({ marginTop: '6px', marginBottom: '12px', fontSize: '14px' })}
            checked={enablePassword}
            on:change={() => {
              enablePassword = !enablePassword;
              if (!enablePassword) {
                $data.password = null;
              }
            }}
          >
            암호설정
          </Checkbox>

          <input
            name="password"
            class={css(
              {
                borderWidth: '1px',
                borderColor: 'gray.200',
                borderRadius: '4px',
                paddingX: '16px',
                paddingY: '14px',
                width: '286px',
                height: '40px',
                fontSize: '14px',
                backgroundColor: 'gray.50',
              },
              !enablePassword && { display: 'none' },
            )}
            pattern="^[!-~]+$"
            placeholder="암호를 입력해주세요"
            type="text"
          />

          <FormValidationMessage for="password" let:message>
            <div class={flex({ align: 'center', gap: '6px', fontSize: '12px', color: 'red.600' })}>
              <Icon icon={IconAlertTriangle} />
              {message}
            </div>
          </FormValidationMessage>
        </div>

        <div>
          <h3 class={labelStyle}>
            연령 제한
            <Tooltip
              style={center.raw()}
              message="연령 제한을 설정하면 본인인증이 완료된 해당 나이 이상의 독자만 내용을 열람할 수 있어요"
            >
              <Icon style={css.raw({ color: 'gray.400' })} icon={IconAlertCircle} />
            </Tooltip>
          </h3>

          <RadioGroup
            name="ageRating"
            items={[
              { label: '모든 연령', value: 'ALL', text: 'ALL', checked: $data.ageRating === 'ALL' },
              { label: '15세 이상', value: 'R15', text: '15+', checked: $data.ageRating === 'R15' },
              { label: '성인물', value: 'R19', text: '20+', checked: $data.ageRating === 'R19' },
            ]}
          />
        </div>

        <div>
          <h3 class={labelStyle}>
            검색 공개
            <Tooltip style={center.raw()} message="외부 검색엔진에서 이 포스트를 검색할 수 있을지 설정해요">
              <Icon style={css.raw({ color: 'gray.400' })} icon={IconAlertCircle} />
            </Tooltip>
          </h3>

          <SegmentButtonGroup>
            <ToggleButton
              checked={$data.externalSearchable}
              on:change={(event) => {
                $data.externalSearchable = event.currentTarget.checked;
              }}
            >
              외부 검색 허용
            </ToggleButton>
            <ToggleButton
              checked={!$data.externalSearchable}
              on:change={(event) => {
                $data.externalSearchable = !event.currentTarget.checked;
              }}
            >
              외부 검색 비허용
            </ToggleButton>
          </SegmentButtonGroup>
        </div>
      </section>

      <section class={tabContentStyle} hidden={tabIndex !== 4}>
        <Switch
          style={flex.raw({ justify: 'space-between', align: 'center' })}
          checked={$data.commentQualification !== 'NONE' ?? true}
          on:change={(e) => {
            $data.commentQualification = e.currentTarget.checked ? 'ANY' : 'NONE';
          }}
        >
          <dl class={labelWithDescriptionStyle}>
            <dt>댓글 허용</dt>
            <dd>독자들이 게시물에 대한 의견을 나누고 소통할 수 있어요</dd>
          </dl>
        </Switch>

        <div>
          <dl class={labelWithDescriptionStyle}>
            <dt>댓글을 달 수 있는 계정</dt>
            <dd class={css({ marginBottom: '6px' })}>게시물에 대한 댓글을 달 수 있는 계정을 선택할 수 있어요</dd>
          </dl>

          <SegmentButtonGroup>
            <ToggleButton
              name="commentQualification"
              checked={$data.commentQualification === 'ANY'}
              disabled={$data.commentQualification === 'NONE'}
              type="radio"
              value="ANY"
            >
              모든계정
            </ToggleButton>
            <ToggleButton
              name="commentQualification"
              checked={$data.commentQualification === 'IDENTIFIED'}
              disabled={$data.commentQualification === 'NONE' || $query.me.personalIdentity === null}
              type="radio"
              value="IDENTIFIED"
            >
              본인 인증된 계정
            </ToggleButton>
          </SegmentButtonGroup>
        </div>
      </section>

      <section class={tabContentStyle} hidden={tabIndex !== 5}>
        <Switch
          name="receiveFeedback"
          style={flex.raw({ justify: 'space-between', align: 'center' })}
          checked={$data.receiveFeedback ?? true}
        >
          <dl class={labelWithDescriptionStyle}>
            <dt>피드백</dt>
            <dd>가장 오래 머무른 구간, 밑줄, 이모지 등 피드백을 받아요</dd>
          </dl>
        </Switch>

        <Switch
          name="discloseStats"
          style={flex.raw({ justify: 'space-between', align: 'center' })}
          checked={$data.discloseStats ?? true}
        >
          <dl class={labelWithDescriptionStyle}>
            <dt>게시물 세부 공개</dt>
            <dd>독자에게 좋아요, 조회수를 공유해요</dd>
          </dl>
        </Switch>

        <Switch
          name="receivePatronage"
          style={flex.raw({ justify: 'space-between', align: 'center' })}
          checked={$data.receivePatronage ?? true}
        >
          <dl class={labelWithDescriptionStyle}>
            <dt>창작자 후원</dt>
            <dd class={css({ fontSize: '11px', color: { base: 'gray.400', sm: 'gray.600' } })}>
              독자들이 게시물에 자유롭게 후원할 수 있어요
            </dd>
          </dl>
        </Switch>

        <Switch
          name="protectContent"
          style={flex.raw({ justify: 'space-between', align: 'center' })}
          checked={$data.protectContent ?? true}
        >
          <dl class={labelWithDescriptionStyle}>
            <dt>게시물 내용 보호</dt>
            <dd>게시물의 내용을 보호하기 위해 우클릭 또는 복사를 제한해요</dd>
          </dl>
        </Switch>
      </section>
    </form>
  </div>

  <div
    class={flex({
      justify: 'flex-end',
      paddingX: '24px',
      paddingY: '20px',
      sm: { borderTopWidth: '1px', borderTopColor: 'gray.150' },
    })}
  >
    <Tooltip
      style={css.raw({ smDown: { flex: '1' } })}
      enabled={!selectedSpaceId}
      message="게시할 스페이스를 선택해주세요"
      offset={12}
      placement="top"
    >
      <Button
        style={css.raw({
          paddingX: '32px',
          width: { base: 'full', sm: '96px' },
        })}
        disabled={!selectedSpaceId}
        loading={$isSubmitting}
        size="lg"
        type="button"
        variant="gradation-fill"
        on:click={handleSubmit}
      >
        발행
      </Button>
    </Tooltip>
  </div>
</div>

{#if $query}
  <CreateSpaceModal
    $user={$query.me}
    via="editor"
    bind:open={createSpaceOpen}
    on:create={(event) => {
      selectedSpaceId = event.detail.id;
      selectedCollectionId = undefined;
      spaceSelectorOpen = false;
    }}
  />
{/if}

{#if selectedSpaceId}
  <CreateCollectionModal bind:open={createCollectionOpen} bind:spaceId={selectedSpaceId} />
{/if}

<ThumbnailPicker
  bind:this={thumbnailPicker}
  keepBoundsWhenClosed
  ratio="post"
  on:change={(e) => (thumbnail = e.detail)}
/>
