import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHandler } from 'HANDLER';

export const handler = createHandler({
  rootPath: path.dirname(fileURLToPath(import.meta.url)),
});
