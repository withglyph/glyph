import { handleStreamOrSingleExecutionResult } from '@envelop/core';
import type { Plugin } from 'graphql-yoga';
import type { Context } from '$lib/server/context';

export const useContextFinalizer = (): Plugin<Context> => {
  return {
    onExecute: () => {
      return {
        onExecuteDone: (payload) => {
          handleStreamOrSingleExecutionResult(payload, async ({ args: { contextValue }, result }) => {
            await (result.errors ? contextValue.$rollback() : contextValue.$commit());
          });
        },
      };
    },
  };
};
