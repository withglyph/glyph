import { generateClient } from './client';
import { generateFunctions } from './functions';
import { generateGQLCodegen } from './gql-codegen';
import { generateInternalTypes } from './internal-types';
import { generateMain, generateMainTypes } from './main';
import { generatePublicTypes } from './public-types';
import { generateSchemaIntrospection } from './schema-introspection';
import { generateUtility } from './utility';
import { writeCodegenFile } from './utils';
import type { GlitchContext } from '../types';

export const codegen = async (context: GlitchContext) => {
  let files;

  try {
    files = {
      'gql.ts': await generateGQLCodegen(context),
      'introspection.json': generateSchemaIntrospection(context),
      'functions.d.ts': generateFunctions(context),
      'public.d.ts': generatePublicTypes(context),
      'internal.d.ts': generateInternalTypes(context),
      'utility.d.ts': generateUtility(),
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

  for (const [filePath, code] of Object.entries(files)) {
    await writeCodegenFile(context, filePath, code);
  }

  return true;
};
