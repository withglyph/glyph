import { getContext, setContext } from 'svelte';
import type {
  Extender,
  MountedCurrentForm,
  Obj,
  SetupCurrentForm,
} from '@felte/core';

const formKey = Symbol();
const fieldKey = Symbol();

const contextKeys = [
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
type FormContext = Pick<Form<Obj>, (typeof contextKeys)[number]>;

type FieldContext = {
  name: string;
};

export const context = <T extends Obj>(): Extender<T> => {
  return (currentForm) => {
    const context = Object.fromEntries(
      Object.entries(currentForm).filter(([key]) =>
        contextKeys.includes(key as never),
      ),
    );

    setContext(formKey, context);

    return {};
  };
};

export const setFormField = (context: FieldContext) => {
  setContext(fieldKey, context);
};

export const getFormContext = () => {
  return {
    form: getContext<FormContext | undefined>(formKey),
    field: getContext<FieldContext | undefined>(fieldKey),
  };
};
