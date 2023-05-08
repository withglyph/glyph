declare module '*.svg?component' {
  import type { ComponentType, SvelteComponentTyped } from 'svelte';
  import type { SVGAttributes } from 'svelte/elements';

  const content: ComponentType<
    SvelteComponentTyped<
      SVGAttributes<SVGSVGElement>,
      SVGSVGElementEventMap,
      never
    >
  >;

  // eslint-disable-next-line import/no-default-export
  export default content;
}
