import { octokit } from '../octokit';
import { webhook } from '../webhook';

webhook.on('workflow_job.queued', async (event) => {
  if (event.payload.workflow_job.workflow_name !== 'CD') {
    return;
  }

  const [stack, project] = event.payload.workflow_job.name.split('/');
  const env = stack === 'production' ? '프로덕션' : '프리뷰';

  await octokit.request('POST /repos/{owner}/{repo}/statuses/{sha}', {
    owner: event.payload.repository.owner.login,
    repo: event.payload.repository.name,
    sha: event.payload.workflow_job.head_sha,
    state: 'pending',
    context: `${env} 배포 (${project})`,
    description: `${env} 배포가 진행중이에요...`,
    target_url: event.payload.workflow_job.html_url,
  });
});

webhook.on('workflow_job.completed', async (event) => {
  if (event.payload.workflow_job.workflow_name !== 'CD') {
    return;
  }

  const [stack, project] = event.payload.workflow_job.name.split('/');
  const env = stack === 'production' ? '프로덕션' : '프리뷰';
  const success = event.payload.workflow_job.conclusion === 'success';

  await octokit.request('POST /repos/{owner}/{repo}/statuses/{sha}', {
    owner: event.payload.repository.owner.login,
    repo: event.payload.repository.name,
    sha: event.payload.workflow_job.head_sha,
    state: success ? 'success' : 'error',
    context: `${env} 배포 (${project})`,
    description: success
      ? `${env} 배포가 성공했어요.`
      : `${env} 배포가 실패했어요.`,
    target_url: event.payload.workflow_job.html_url,
  });
});
