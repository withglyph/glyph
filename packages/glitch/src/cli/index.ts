import path from 'node:path';
import { codegen } from '../codegen';
import { collectDocuments } from '../document';
import type { GlitchContext } from '../types';

export const glitch = async () => {
  const context: GlitchContext = {
    root: process.cwd(),
    codegenRoot: path.join(process.cwd(), '$glitch'),

    schema: undefined,
    artifacts: [],

    state: {
      fakePaths: [],

      schemaHash: 0,
      artifactHashes: [],
    },
  };

  const { success } = await collectDocuments(context);
  if (!success) {
    return 1;
  }

  if (!(await codegen(context))) {
    return 1;
  }

  return 0;
};
