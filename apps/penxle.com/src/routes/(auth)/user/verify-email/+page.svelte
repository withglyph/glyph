<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { graphql } from '$glitch';
  import { Button } from '$lib/components';

  const verifyUserEmail = graphql(`
    mutation UserVerifyEmailPage_VerifyUserEmail_Mutation($input: VerifyUserEmailInput!) {
      verifyUserEmail(input: $input) {
        id
      }
    }
  `);

  onMount(async () => {
    const code = $page.url.searchParams.get('code');
    if (code) {
      await verifyUserEmail({ code });
    }
  });
</script>

이메일 인증이 완료되었어요.

<Button class="mt-8 w-full" href="/" size="xl" type="link">확인</Button>
