import type { Actions } from './$types';

export const actions = {
  default: async (event) => {
    const formData = await event.request.formData();
    return { node: formData.get('node') as string };
  },
} satisfies Actions;
