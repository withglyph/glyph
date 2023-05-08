import { getContext, setContext } from 'svelte';
import type {
  Extender,
  MountedCurrentForm,
  Obj,
  SetupCurrentForm,
} from '@felte/core';

const key = Symbol();
const keys = [
  'data',
  'errors',
  'warnings',
  'touched',
  'isSubmitting',
  'isValid',
  'isValidating',
  'isDirty',
  'interacted',
] satisfies (keyof Form<Obj>)[];

type Form<T extends Obj> = SetupCurrentForm<T> | MountedCurrentForm<T>;
type Context<T extends Obj> = Pick<Form<T>, (typeof keys)[number]>;

export const context = <T extends Obj>(): Extender<T> => {
  return (currentForm) => {
    const context = Object.fromEntries(
      Object.entries(currentForm).filter(([key]) => keys.includes(key as never))
    );

    setContext(key, context);

    return {};
  };
};

export const getForm = <T extends Obj>() => {
  return getContext<Context<T> | undefined>(key);
};
