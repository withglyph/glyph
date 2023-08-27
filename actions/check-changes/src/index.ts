import actions from '@actions/core';
import { execaSync } from 'execa';

const projectName = actions.getInput('project', { required: true });

const { stdout } = execaSync('pnpm', [
  'exec',
  'turbo',
  'run',
  'build',
  `--filter=${projectName}...[HEAD^]`,
  `--filter={./infra/${projectName}}...[HEAD^]`,
  '--filter={./actions/**}...[HEAD^]',
  '--dry=json',
]);

const { packages } = JSON.parse(stdout) as { packages: string[] };
actions.setOutput('changed', packages.length === 0 ? 'false' : 'true');
