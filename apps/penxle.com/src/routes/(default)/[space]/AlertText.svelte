<script lang="ts">
  import clsx from 'clsx';

  export let icon: string;
  export let title: string;
  export let triggerTags: { id: string; tag: { name: string } }[] = [];
  export let description: string | undefined = undefined;
</script>

<header class="py-80px px-3 w-full flex flex-col items-center" role="alert">
  <div class="flex flex-col gap-2 items-center">
    <i class={clsx('block square-8 text-teal-500', icon)} />
    <h2 class="text-18-sb text-center break-keep">
      {title}
    </h2>
  </div>

  <ul class="flex gap-1.5 flex-wrap justify-center">
    {#each triggerTags as triggerTag (triggerTag.id)}
      <li class="text-teal-500">#{triggerTag.tag.name.replaceAll('_', ' ')}</li>
    {/each}
  </ul>

  {#if description}
    <p class="text-14-r text-gray-500 mt-2px">{description}</p>
  {/if}

  <slot />
</header>
