import { generateClient } from './client';
import { generateFunctions } from './functions';
import { generateGQLCodegen } from './gql-codegen';
import { generateMain, generateMainTypes } from './main';
import { generateTypes } from './types';
import { writeCodegenFile } from './utils';
import type { GlitchContext } from '../types';

export const codegen = async (context: GlitchContext) => {
  let files;

  try {
    files = {
      'gql.ts': await generateGQLCodegen(context),
      'functions.d.ts': generateFunctions(context),
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
    return;
  }

  for (const [filePath, code] of Object.entries(files)) {
    await writeCodegenFile(context, filePath, code);
  }
};
