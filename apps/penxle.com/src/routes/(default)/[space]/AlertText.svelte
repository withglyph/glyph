<script lang="ts">
  import clsx from 'clsx';

  export let icon: string;
  export let title: string;
  export let triggerTags: { id: string; tag: { name: string } }[] = [];
  export let description: string | undefined = undefined;
</script>

<header class="py-10.5 px-3 rounded-3 w-full flex flex-col items-center" role="alert">
  <div class="flex flex-col gap-2 items-center">
    <i class={clsx('block square-8 text-teal-500 <sm:square-7', icon)} />
    <h2 class="text-16-m text-center break-keep">
      {title}
    </h2>
  </div>

  <ul class="flex gap-1.5 flex-wrap justify-center text-14-m <sm:text-14-r">
    {#each triggerTags as triggerTag (triggerTag.id)}
      <li class="text-teal-500">#{triggerTag.tag.name.replaceAll('_', ' ')}</li>
    {/each}
  </ul>

  {#if description}
    <p class="text-14-r text-gray-700 mt-2px">{description}</p>
  {/if}

  <slot />
</header>
