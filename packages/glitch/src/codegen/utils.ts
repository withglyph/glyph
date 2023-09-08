import fs from 'node:fs/promises';
import path from 'node:path';
import * as AST from '../ast';
import type { GlitchContext } from '../types';

export const writeCodegenFile = async (
  context: GlitchContext,
  filePath: string,
  program: AST.n.Program | string,
) => {
  const code = typeof program === 'string' ? program : AST.print(program).code;

  if (code !== '') {
    const targetPath = path.join(context.codegenRoot, filePath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, code);
  }
};
