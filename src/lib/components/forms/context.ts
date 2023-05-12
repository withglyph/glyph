import { getContext, setContext } from 'svelte';

const key = Symbol();

type Context = {
  name: string;
};

export const setFormField = (context: Context) => setContext(key, context);

export const getFormField = () => getContext<Context | undefined>(key);
