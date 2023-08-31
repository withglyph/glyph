import yaml from 'yaml';
import { octokit } from '../octokit';
import { webhook } from '../webhook';

webhook.on('push', async (event) => {
  if (event.payload.ref !== 'refs/heads/main') {
    return;
  }

  const { data: lockfile } = await octokit.request(
    `GET /repos/{owner}/{repo}/contents/{path}`,
    {
      owner: event.payload.repository.owner.login,
      repo: event.payload.repository.name,
      ref: event.payload.ref,
      path: 'pnpm-lock.yaml',
    },
  );

  if (!('content' in lockfile)) {
    return;
  }

  const buffer = Buffer.from(lockfile.content, 'base64');
  const document = yaml.parse(buffer.toString());
  const packages = Object.keys(document.importers);

  for (const pkg of packages) {
    if (!pkg.startsWith('functions/') && !pkg.startsWith('sites/')) {
      continue;
    }

    const project = pkg.replace(/^(functions|sites)\//, '');

    await octokit.request(
      `POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches`,
      {
        owner: event.payload.repository.owner.login,
        repo: event.payload.repository.name,
        workflow_id: 'cd.yml',
        ref: event.payload.ref,
        inputs: {
          project,
          'stack': `production`,
          'path': pkg,
          'doppler-project': project.replaceAll('.', '-'),
          'doppler-config': 'production',
        },
      },
    );
  }
});
