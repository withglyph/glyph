<script lang="ts">
  import { graphql } from '$houdini';
  import { Helmet } from '$lib/components';
  import { unwrap } from '$lib/houdini';

  const query = unwrap(
    graphql(/* GraphQL */ `
      query IndexPage_Query @load {
        greeting
      }
    `)
  );
</script>

<Helmet
  description="창작을 즐겁게, 펜슬"
  image={{ src: 'https://b.pnxl.net/static/og.png', size: 'large' }}
  title="펜슬 메인"
/>

<code>{$query.greeting}</code>

<!-- <div class="mt-4 flex gap-1">
  <div class="square-8 rounded bg-blue-50" />
  <div class="square-8 rounded bg-blue-100" />
  <div class="square-8 rounded bg-blue-200" />
  <div class="square-8 rounded bg-blue-300" />
  <div class="square-8 rounded bg-blue-400" />
  <div class="square-8 rounded bg-blue-500" />
  <div class="square-8 rounded bg-blue-600" />
  <div class="square-8 rounded bg-blue-700" />
  <div class="square-8 rounded bg-blue-800" />
  <div class="square-8 rounded bg-blue-900" />
  <div class="square-8 rounded bg-blue-950" />
</div>

<div class="mt-1 flex gap-1">
  <div class="square-8 rounded bg-brand-50" />
  <div class="square-8 rounded bg-brand-100" />
  <div class="square-8 rounded bg-brand-200" />
  <div class="square-8 rounded bg-brand-300" />
  <div class="square-8 rounded bg-brand-400" />
  <div class="square-8 rounded bg-brand-500" />
  <div class="square-8 rounded bg-brand-600" />
  <div class="square-8 rounded bg-brand-700" />
  <div class="square-8 rounded bg-brand-800" />
  <div class="square-8 rounded bg-brand-900" />
  <div class="square-8 rounded bg-brand-950" />
</div>

<div class="mt-1 flex gap-1">
  <div class="square-8 rounded bg-indigo-50" />
  <div class="square-8 rounded bg-indigo-100" />
  <div class="square-8 rounded bg-indigo-200" />
  <div class="square-8 rounded bg-indigo-300" />
  <div class="square-8 rounded bg-indigo-400" />
  <div class="square-8 rounded bg-indigo-500" />
  <div class="square-8 rounded bg-indigo-600" />
  <div class="square-8 rounded bg-indigo-700" />
  <div class="square-8 rounded bg-indigo-800" />
  <div class="square-8 rounded bg-indigo-900" />
  <div class="square-8 rounded bg-indigo-950" />
</div> -->
