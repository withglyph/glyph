import fs from 'node:fs/promises';
import path from 'node:path';
import type { GlitchContext } from '../types';

export const collectSchemaSource = async (context: GlitchContext) => {
  const schemaPath = path.join(context.root, 'schema.graphql');
  return await fs.readFile(schemaPath, 'utf8');
};
