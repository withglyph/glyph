<script lang="ts">
  import Button from '$lib/components/v2/Button.svelte';

  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
  const variants = ['primary', 'secondary', 'tertiary', 'outline', 'secondary-outline'] as const;
</script>

<div class="flex flex-col">
  {#each variants as variant (variant)}
    <div class="flex gap-4">
      {#each sizes as size (size)}
        <Button loading={false} {size} type="button" {variant}>버튼</Button>
        <Button loading={true} {size} type="button" {variant}>버튼</Button>
      {/each}
    </div>
  {/each}
</div>
