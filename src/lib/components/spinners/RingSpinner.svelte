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
    class="animate-[rs-stretch] animate-duration-1500 animate-ease-in-out animate-count-infinite fill-none stroke-dash-[1,200] stroke-current stroke-cap-round"
    cx="50"
    cy="50"
    r="20"
  />
</svg>

<style lang="scss">
  @keyframes -global-rs-stretch {
    0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 200;
      stroke-dashoffset: -35px;
    }
    100% {
      stroke-dashoffset: -124px;
    }
  }
</style>
