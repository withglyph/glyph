import fs from 'node:fs/promises';
import path from 'node:path';
import { codegen } from '../codegen';
import { collectDocuments } from '../document';
import { version } from '../version';
import type { GlitchContext } from '../types';

export const glitch = async () => {
  const context: GlitchContext = {
    root: process.cwd(),
    codegenRoot: path.join(process.cwd(), '.glitch'),

    schema: undefined,
    artifacts: [],

    state: {
      version,
      schemaHash: 0,
      artifactHashes: {},
    },
  };

  await fs.mkdir(context.codegenRoot, { recursive: true });

  try {
    const state = await fs.readFile(path.join(context.codegenRoot, 'state.json'), 'utf8');
    context.state = JSON.parse(state);
  } catch {
    // noop
  }

  const { success, refreshed } = await collectDocuments(context);
  if (!success) {
    return 1;
  }

  if (!refreshed) {
    return 0;
  }

  const result = await codegen(context);
  return result ? 0 : 1;
};
