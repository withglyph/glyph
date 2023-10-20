import { renderAsync } from '@resvg/resvg-js';
import Template from './Template.svelte';

export const createRandomIcon = async () => {
  // @ts-expect-error svelte internal
  const { html } = Template.render();

  const image = await renderAsync(html, {
    fitTo: { mode: 'width', value: 512 },
  });

  return image.asPng();
};
