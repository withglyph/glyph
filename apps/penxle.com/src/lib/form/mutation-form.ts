import { validator } from '@felte/validator-zod';
import { createForm } from 'felte';
import { AppError, FormValidationError } from '$lib/errors';
import { toast } from '$lib/notification';
import { context } from './context';
import type { AssignableErrors, Extender, RecursivePartial } from '@felte/core';
import type { MutationStore } from '@penxle/glitch';
import type { AnyZodObject, TypeOf, ZodEffects } from 'zod';
import type { MaybePromise, Unwrap } from '$lib/types';

type MutationFormConfig<D, Z extends AnyZodObject> = {
  mutation: MutationStore<D, { input: TypeOf<Z> }>;
  schema: Z | ZodEffects<Z> | { validate: Z; warn: Z };
  initialValues?: RecursivePartial<TypeOf<Z>>;
  onSuccess?: (data: Unwrap<D>) => MaybePromise<void> | string;
  onError?: (error: AppError) => MaybePromise<void> | string;
};

export const createMutationForm = <D, Z extends AnyZodObject>(config: MutationFormConfig<D, Z>) => {
  const extend: Extender<TypeOf<Z>>[] = [context()];
  const { schema, mutation, onSuccess, onError, ...rest } = config;

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
      const data = await mutation(values);
      if (typeof onSuccess === 'string') {
        toast.success(onSuccess);
      } else {
        await onSuccess?.(data);
      }
    },
    onError: async (error) => {
      if (error instanceof FormValidationError) {
        return { [error.field]: error.message } as AssignableErrors<TypeOf<Z>>;
      } else if (error instanceof AppError) {
        if (onError) {
          if (typeof onError === 'string') {
            toast.error(onError);
          } else {
            await onError(error);
          }
        } else {
          toast.error(error.message);
        }
      } else {
        console.error(error);
        toast.error('알 수 없는 오류가 발생했어요');
      }

      return;
    },
  });
};
