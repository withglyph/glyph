declare module '*.svg?component' {
  import type { ComponentType, SvelteComponent } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';

  const content: ComponentType<
    SvelteComponent<SVGAttributes<SVGSVGElement>, SVGSVGElementEventMap, never>
  >;

  export default content;
}
