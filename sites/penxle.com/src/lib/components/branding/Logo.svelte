<script lang="ts">
  import { clsx } from 'clsx';
  import Logo from '$assets/branding/logo.svg?component';
  import { Link } from '..';

  let _class: string | undefined = undefined;
  export { _class as class };
</script>

<Link href="/">
  <Logo class={clsx('flex-none', _class)} />
</Link>
