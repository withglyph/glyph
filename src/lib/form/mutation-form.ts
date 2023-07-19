import { validator } from '@felte/validator-zod';
import { createForm } from 'felte';
import { AppError, FormValidationError } from '$lib/errors';
import { useMutation } from '$lib/houdini';
import { toast } from '$lib/notification';
import { context } from './context';
import type { AssignableErrors, Extender, RecursivePartial } from '@felte/core';
import type { GraphQLObject, MutationStore } from '$houdini';
import type { MaybePromise, Unwrap } from '$lib/types';
import type { AnyZodObject, TypeOf } from 'zod';

type MutationFormConfig<Z extends AnyZodObject, D extends GraphQLObject> = {
  schema: Z | { validate: Z; warn: Z };
  initialValues?: RecursivePartial<TypeOf<Z>>;
  mutation: MutationStore<D, { input: TypeOf<Z> }, never>;
  refetch?: boolean;
  onSuccess?: (data: Unwrap<D>) => MaybePromise<void>;
  onError?: (error: AppError) => MaybePromise<void>;
};

export const createMutationForm = <
  Z extends AnyZodObject,
  D extends GraphQLObject,
>(
  config: MutationFormConfig<Z, D>,
) => {
  const extend: Extender<TypeOf<Z>>[] = [context()];
  const { schema, mutation, refetch, onSuccess, onError, ...rest } = config;

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
      const m = useMutation(mutation, { refetch, throwOnError: true });
      const data = await m(values);
      await onSuccess?.(data);
    },
    onError: async (error) => {
      if (error instanceof FormValidationError) {
        return { [error.field]: error.message } as AssignableErrors<TypeOf<Z>>;
      } else if (error instanceof AppError) {
        if (onError) {
          await onError(error);
        } else {
          toast.error(error.message);
        }
      } else {
        console.error(error);
        toast.error('An unknown error occurred');
      }

      return undefined;
    },
  });
};
