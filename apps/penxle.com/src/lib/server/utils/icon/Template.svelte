<script lang="ts">
  import randomColor from 'randomcolor';

  const backgroundColor = randomColor({
    luminosity: 'light',
  });
</script>

<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <rect fill={backgroundColor} height="24" width="24" />
  <path
    d="M7.36 3.86c2.3 5.04.42 10.01-.1 11.36-.08.23-.13.36-.11.36a15.7 15.7 0 0 1 9.45 4.6l-1.58-2.74L13 14.07a1.1 1.1 0 1 1 .53-.35l3.53 6.11c-1.4-4.68.63-10.12.63-10.12-6.15-.67-10.33-5.85-10.33-5.85Z"
    fill="#FAFAF9"
  />
</svg>
