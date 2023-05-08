<script lang="ts">
  import clsx from 'clsx';

  let _class: string;
  export { _class as class };
</script>

<svg class={clsx('spinner', _class)} stroke-width="5" viewBox="25 25 50 50">
  <circle cx="50" cy="50" r="20" />
</svg>

<style lang="scss">
  .spinner {
    --uib-speed: 2s;

    vertical-align: middle;
    transform-origin: center;
    animation: rotate var(--uib-speed) linear infinite;
  }

  .spinner circle {
    fill: none;
    stroke: currentColor;
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: stretch calc(var(--uib-speed) * 0.75) ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes stretch {
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
