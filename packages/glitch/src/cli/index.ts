import path from 'node:path';
import { codegen } from '../codegen';
import { refreshDocuments } from '../document';
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

  await refreshDocuments(context);
  await codegen(context);
};
