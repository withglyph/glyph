<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';

  const verifyEmail = graphql(`
    mutation UserVerifyEmailPage_VerifyEmail_Mutation($input: VerifyEmailInput!) {
      verifyEmail(input: $input) {
        id
      }
    }
  `);

  onMount(async () => {
    const code = $page.url.searchParams.get('code');
    if (code) {
      await verifyEmail({ code });
    }
  });
</script>

이메일 인증이 완료되었습니다.

<Button class="mt-8 w-full" href="/" size="xl" type="link">확인</Button>
