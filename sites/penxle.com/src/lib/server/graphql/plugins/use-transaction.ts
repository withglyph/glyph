import { handleStreamOrSingleExecutionResult } from '@envelop/core';
import type { Context } from '$lib/server/context';
import type { TransactionClient } from '$lib/server/prisma';
import type { Plugin } from 'graphql-yoga';

export const useTransaction = (): Plugin<Context> => {
  return {
    onExecute: () => {
      return {
        onExecuteDone: (payload) => {
          handleStreamOrSingleExecutionResult(
            payload,
            async ({ args: { contextValue }, result }) => {
              const db = contextValue.db as TransactionClient;
              await (result.errors ? db.$rollback() : db.$commit());
            },
          );
        },
      };
    },
  };
};
