import actions from '@actions/core';
import { $ } from 'execa';

export const build = async (project: string) => {
  actions.startGroup(`Building project ${project}...`);

  await $({ stdout: 'inherit' })`pnpm exec turbo run build --filter=${project}`;

  actions.endGroup();
};
