<script lang="ts">
  import * as R from 'radash';
  import randomColor from 'randomcolor';
  import { getColorLuminosity } from '$lib/utils';

  const hues = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];

  const [backgroundColor, faceColor] = randomColor({
    count: 2,
    hue: hues[R.random(0, hues.length - 1)],
  });
  const featureColor = getColorLuminosity(faceColor) === 'light' ? '#000' : '#fff';

  const faceTranslateX = R.random(-30, 30);
  const faceTranslateY = R.random(-30, 30);
  const faceRotate = R.random(0, 359);
  const faceScale = R.random(100, 120) / 100;

  const featureTranslateX = faceTranslateX / 2;
  const featureTranslateY = faceTranslateY / 2;
  const featureRotate = R.random(-10, 10);

  const isMouthOpen = R.random(0, 1) === 1;
  const isCircle = R.random(0, 1) === 1;
  const eyeDistance = R.random(15, 20);
  const mouthDistance = R.random(5, 10);
</script>

<svg fill="none" height="512" viewBox="0 0 100 100" width="512" xmlns="http://www.w3.org/2000/svg">
  <rect fill={backgroundColor} height="100" width="100" />
  <rect
    fill={faceColor}
    height="100"
    rx={isCircle ? 9999 : 10}
    transform={`translate(${faceTranslateX} ${faceTranslateY}) rotate(${faceRotate} 50 50) scale(${faceScale})`}
    width="100"
  />
  <g transform={`translate(${featureTranslateX} ${featureTranslateY}) rotate(${featureRotate} 50 50)`}>
    <g transform={`translate(0 ${44 - mouthDistance})`}>
      <rect fill={featureColor} height="6" rx="9999" stroke="none" width="4" x={48 - eyeDistance} y="0" />
      <rect fill={featureColor} height="6" rx="9999" stroke="none" width="4" x={48 + eyeDistance} y="0" />
    </g>

    {#if isMouthOpen}
      <path d={`M 35 ${50 + mouthDistance} a 4,3 0 0 0 30,0`} fill={featureColor} />
    {:else}
      <path
        d={`M 40 ${52 + mouthDistance} c 5,4 15,4 20,0`}
        stroke={featureColor}
        stroke-linecap="round"
        stroke-width="4"
      />
    {/if}
  </g>
</svg>
