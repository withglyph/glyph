<script lang="ts">
  import { graphql } from '$glitch';
  import { Avatar, Helmet } from '$lib/components';
  import { Button } from '$lib/components/v2';
  import { css } from '$styled-system/css';
  import { flex } from '$styled-system/patterns';

  $: query = graphql(`
    query FindAccountCompletePage_Query {
      me @_required {
        id
        email

        profile {
          id
          name
          ...Avatar_profile
        }
      }
    }
  `);
</script>

<Helmet description="휴대폰 본인인증을 통해 글리프 계정을 찾을 수 있어요" title="글리프 계정 찾기" />

<h1 class={css({ marginTop: { base: '32px', sm: '20px' }, marginBottom: '4px', fontSize: '24px', fontWeight: 'bold' })}>
  계정을 찾았어요!
</h1>

<h2 class={css({ fontSize: '14px', color: 'gray.500' })}>해당 계정으로 로그인되었어요</h2>

<div
  class={flex({
    align: 'center',
    justify: 'flex-start',
    gap: '6px',
    marginTop: '36px',
    textAlign: 'left',
    fontWeight: 'semibold',
    backgroundColor: 'gray.5',
    height: '48px',
  })}
>
  <Avatar
    style={css.raw({ borderWidth: '1px', borderColor: 'gray.150', size: '36px' })}
    $profile={$query.me.profile}
    size={32}
  />

  <div>
    <p class={css({ fontWeight: 'semibold' })}>{$query.me.profile.name}</p>
    <p class={css({ fontSize: '14px', color: 'gray.600' })}>{$query.me.email}</p>
  </div>
</div>

<Button
  style={css.raw({ marginTop: 'auto', marginBottom: '32px' })}
  href="/"
  size="lg"
  type="link"
  variant="gradation-fill"
>
  글리프 접속하기
</Button>
