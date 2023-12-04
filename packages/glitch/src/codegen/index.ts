import fs from 'node:fs/promises';
import path from 'node:path';
import * as AST from '../ast';
import { generateBaseTypes } from './base';
import { generateClient } from './client';
import { generateMain, generateMainTypes } from './entrypoint';
import { generateEnumTypes } from './enums';
import { generateFragmentTypes } from './fragments';
import { generateFunctions } from './functions';
import { generateTypes } from './types';
import type { GlitchContext } from '../types';

export const codegen = async (context: GlitchContext) => {
  let files;

  try {
    files = {
      'base.ts': await generateBaseTypes(context),
      'enums.d.ts': await generateEnumTypes(context),
      'functions.d.ts': generateFunctions(context),
      'fragments.d.ts': generateFragmentTypes(context),
      'types.d.ts': generateTypes(context),
      'client.js': generateClient(),
      'index.d.ts': generateMainTypes(),
      'index.js': generateMain(),
    };
  } catch (err) {
    if (err instanceof Error) {
      console.error(`💥 ${err.message}`);
    } else {
      console.error(`💥 ${err}`);
    }

    return false;
  }

  for (const [filePath, program] of Object.entries(files)) {
    const code = typeof program === 'string' ? program : AST.print(program).code;

    if (code !== '') {
      const targetPath = path.join(context.codegenRoot, filePath);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, code);
    }
  }

  await fs.mkdir(context.codegenRoot, { recursive: true });
  await fs.writeFile(path.join(context.codegenRoot, 'state.json'), JSON.stringify(context.state, null, 2));

  return true;
};
