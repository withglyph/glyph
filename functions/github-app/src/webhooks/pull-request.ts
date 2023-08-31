import yaml from 'yaml';
import { octokit } from '../octokit';
import { webhook } from '../webhook';

webhook.on('pull_request.opened', async (event) => {
  const { data: lockfile } = await octokit.request(
    `GET /repos/{owner}/{repo}/contents/{path}`,
    {
      owner: event.payload.repository.owner.login,
      repo: event.payload.repository.name,
      ref: event.payload.pull_request.head.ref,
      path: 'pnpm-lock.yaml',
    },
  );

  if (!('content' in lockfile)) {
    return;
  }

  const buffer = Buffer.from(lockfile.content, 'base64');
  const document = yaml.parse(buffer.toString());
  const packages = Object.keys(document.importers);

  const sites = packages.filter((pkg) => pkg.startsWith('sites/'));
  const projects = sites.map((site) => site.replace(/^sites\//, ''));

  const table = projects.map((project) => {
    const subdomain = `pr-${
      event.payload.pull_request.number
    }-${project.replaceAll('.', '-')}`;
    return `| ${project} | https://${subdomain}.pnxl.site |`;
  });

  await octokit.request(
    'POST /repos/{owner}/{repo}/issues/{issue_number}/comments',
    {
      owner: event.payload.repository.owner.login,
      repo: event.payload.repository.name,
      issue_number: event.payload.pull_request.number,
      body: `
배포가 끝나면 아래 주소에서 프리뷰를 확인할 수 있어요.

| 프로젝트 | 프리뷰 URL |
| --- | --- |
${table.join('\n')}
`.trim(),
    },
  );
});

webhook.on('pull_request.synchronize', async (event) => {
  const { data: lockfile } = await octokit.request(
    `GET /repos/{owner}/{repo}/contents/{path}`,
    {
      owner: event.payload.repository.owner.login,
      repo: event.payload.repository.name,
      ref: event.payload.pull_request.head.ref,
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
    if (!pkg.startsWith('sites/')) {
      continue;
    }

    const project = pkg.replace(/^sites\//, '');

    await octokit.request(
      `POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches`,
      {
        owner: event.payload.repository.owner.login,
        repo: event.payload.repository.name,
        workflow_id: 'cd.yml',
        ref: event.payload.pull_request.head.ref,
        inputs: {
          project,
          'stack': `pr-${event.payload.pull_request.number}`,
          'path': pkg,
          'doppler-project': project.replaceAll('.', '-'),
          'doppler-config': 'preview',
        },
      },
    );
  }
});
