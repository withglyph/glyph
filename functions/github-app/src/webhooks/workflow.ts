import { octokit } from '../octokit';
import { webhook } from '../webhook';

webhook.on('pull_request.synchronize', async (event) => {
  await octokit.request(
    `POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches`,
    {
      owner: event.payload.repository.owner.login,
      repo: event.payload.repository.name,
      workflow_id: 'cd-preview.yml',
      ref: event.payload.pull_request.head.ref,
      inputs: {
        ref: event.payload.pull_request.head.sha,
        stack: `pr-${event.payload.pull_request.number}`,
      },
    },
  );
});

webhook.on('workflow_job.queued', async (event) => {
  if (event.payload.workflow_job.workflow_name !== 'cd/preview') {
    return;
  }

  const project = event.payload.workflow_job.name;

  await octokit.request('POST /repos/{owner}/{repo}/statuses/{sha}', {
    owner: event.payload.repository.owner.login,
    repo: event.payload.repository.name,
    sha: event.payload.workflow_job.head_sha,
    state: 'pending',
    context: `프리뷰 배포 (${project})`,
    description: '프리뷰 배포가 진행중이에요...',
    target_url: event.payload.workflow_job.html_url,
  });
});

webhook.on('workflow_job.completed', async (event) => {
  if (event.payload.workflow_job.workflow_name !== 'cd/preview') {
    return;
  }

  const project = event.payload.workflow_job.name;
  const success = event.payload.workflow_job.conclusion === 'success';

  await octokit.request('POST /repos/{owner}/{repo}/statuses/{sha}', {
    owner: event.payload.repository.owner.login,
    repo: event.payload.repository.name,
    sha: event.payload.workflow_job.head_sha,
    state: success ? 'success' : 'failure',
    context: `프리뷰 배포 (${project})`,
    description: success
      ? '프리뷰 배포가 성공했어요'
      : '프리뷰 배포가 실패했어요',
    target_url: event.payload.workflow_job.html_url,
  });
});
