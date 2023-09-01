<script lang="ts">
  import { Link } from '@penxle/ui';
  import { clsx } from 'clsx';
  import Logo from '$assets/branding/logo.svg?component';

  let _class: string | undefined = undefined;
  export { _class as class };
</script>

<Link href="/">
  <Logo class={clsx('flex-none', _class)} />
</Link>
