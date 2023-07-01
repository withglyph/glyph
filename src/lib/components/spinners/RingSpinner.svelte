<script lang="ts">
  import clsx from 'clsx';

  let _class: string;
  export { _class as class };
</script>

<svg
  class={clsx('animate-spin animate-duration-2000 stroke-5', _class)}
  viewBox="25 25 50 50"
>
  <circle
    class="animate-[ring-spinner] animate-duration-1500 animate-ease-in-out animate-count-infinite fill-none stroke-dash-[1,200] stroke-current stroke-cap-round"
    cx="50"
    cy="50"
    r="20"
  />
</svg>
