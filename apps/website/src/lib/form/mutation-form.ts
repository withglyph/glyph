import { validator } from '@felte/validator-zod';
import { createForm } from 'felte';
import { FormValidationError } from '$lib/errors';
import { context } from './context';
import type { AssignableErrors, Extender, RecursivePartial } from '@felte/core';
import type { MutationStore } from '@withglyph/glitch';
import type { AnyZodObject, TypeOf, ZodEffects } from 'zod';
import type { MaybePromise, Unwrap } from '$lib/types';

type MutationFormConfig<D, Z extends AnyZodObject> = {
  mutation: MutationStore<D, { input: TypeOf<Z> }>;
  schema: Z | ZodEffects<Z> | { validate: Z; warn: Z };
  initialValues?: RecursivePartial<TypeOf<Z>>;
  extra?: () => MaybePromise<RecursivePartial<TypeOf<Z>>>;
  onSuccess?: (data: Unwrap<D>) => MaybePromise<void>;
  onError?: (error: unknown) => MaybePromise<void>;
};

export const createMutationForm = <D, Z extends AnyZodObject>(config: MutationFormConfig<D, Z>) => {
  const extend: Extender<TypeOf<Z>>[] = [context()];
  const { schema, mutation, extra, onSuccess, onError, ...rest } = config;

  if ('validate' in schema && 'warn' in schema) {
    extend.push(
      validator({ schema: schema.validate, level: 'error' }),
      validator({ schema: schema.warn, level: 'warning' }),
    );
  } else {
    extend.push(validator({ schema }));
  }

  return createForm({
    ...rest,
    extend,
    onSubmit: async (values) => {
      const ex = await extra?.();
      const data = await mutation({ ...values, ...ex });
      await onSuccess?.(data);
    },
    onError: async (error) => {
      if (error instanceof FormValidationError) {
        return { [error.field]: error.message } as AssignableErrors<TypeOf<Z>>;
      } else {
        await onError?.(error);
      }
    },
  });
};
