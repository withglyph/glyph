import { handleStreamOrSingleExecutionResult } from '@envelop/core';
import type { Context } from '../context';
import type { Plugin } from '@envelop/types';

export const useTransaction = (): Plugin<Context> => {
  return {
    onExecute: () => {
      return {
        onExecuteDone: (payload) => {
          handleStreamOrSingleExecutionResult(
            payload,
            async ({ args: { contextValue }, result }) => {
              const { db } = contextValue;
              await (result.errors ? db.$rollback() : db.$commit());
            }
          );
        },
      };
    },
  };
};
