<script lang="ts">
  import { css } from '$styled-system/css';
  import type { SystemStyleObject } from '$styled-system/types';

  export let style: SystemStyleObject | undefined = undefined;
</script>

<svg class={css(style)} viewBox="25 25 50 50">
  <circle cx="50" cy="50" r="20" />
</svg>

<style>
  svg {
    stroke-width: 5px;
    animation: svg;
    animation-duration: 2000ms;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
  }

  circle {
    fill: none;
    stroke: currentColor;
    stroke-dasharray: 1, 200;
    stroke-linecap: round;
    animation: circle;
    animation-duration: 1500ms;
    animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    animation-iteration-count: infinite;
  }

  @keyframes svg {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes circle {
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
