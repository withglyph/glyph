import { findWorkspacePackagesNoCheck } from '@pnpm/workspace.find-packages';

export const getProjectDir = async (project: string) => {
  const projects = await findWorkspacePackagesNoCheck('.');

  for (const { dir, manifest } of projects) {
    if (manifest.name === `@penxle/${project}`) {
      return dir;
    }
  }

  throw new Error(`Could not locate project ${project}`);
};
