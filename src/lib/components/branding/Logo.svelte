<script lang="ts">
  import { clsx } from 'clsx';
  import { Link } from '..';

  let _class: string | undefined = undefined;
  export { _class as class };
</script>

<Link class={clsx('i-px-logo text-gray-900', _class)} href="/" />
