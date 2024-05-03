import path from 'node:path';
import { collectArtifacts } from './artifact';
import type { Context } from './types';

export const buildContext = async (): Promise<Context> => {
  const projectDir = process.cwd();
  const bifrostDir = path.join(projectDir, '.bifrost');

  const { schema, operationMap, fragmentMap } = await collectArtifacts(projectDir);
  const artifacts = [...operationMap.values(), ...fragmentMap.values()];

  return { projectDir, bifrostDir, schema, operationMap, fragmentMap, artifacts };
};
