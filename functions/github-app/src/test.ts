import { octokit } from './octokit';

// const resp = await octokit.request('POST /repos/{owner}/{repo}/deployments', {
//   owner: 'penxle',
//   repo: 'penxle',
//   ref: '7bbc5470c0850c3fd529fcfbdc77261e8a18e757',
//   // payload: { hello: 'world' },
//   // task: 'sample-task',
//   auto_merge: false,
//   // required_contexts: [],
//   environment: 'hello',
//   // description: 'test deployment',
//   // transient_environment: false,
//   // production_environment: false,
// });

// if (resp.status === 201) {
//   const resp2 = await octokit.request(
//     'POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses',
//     {
//       owner: 'penxle',
//       repo: 'penxle',
//       deployment_id: resp.data.id,
//       state: 'success',
//       log_url: 'https://example.com',
//       // description: 'test deployment status = success',
//       environment_url: 'https://test.penxle.com',
//     },
//   );

//   console.log(resp2.data);
// }

// const resp = await octokit.request(
//   'POST /repos/{owner}/{repo}/statuses/{sha}',
//   {
//     owner: 'penxle',
//     repo: 'penxle',
//     sha: '7bbc5470c0850c3fd529fcfbdc77261e8a18e757',
//     state: 'success',
//     context: '프리뷰 배포 (penxle.com)',
//     description: '프리뷰 배포가 성공했어요.',
//     target_url: 'https://test.penxle.com',
//   },
// );

// const resp = await octokit.request(
//   `POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches`,
//   {
//     owner: 'penxle',
//     repo: 'penxle',
//     workflow_id: 'cd-preview.yml',
//     ref: 'finn/overhaul-5',
//     inputs: {
//       ref: 'finn/overhaul-5',
//       stack: 'pr-65',
//     },
//     // event_type: 'deploy',
//     // client_payload: {
//     //   ref: '99ef2e9aca0119861e676e77890d262bc17eb47b',
//     //   stack: 'pr-65',
//     // },
//   },
// );

// console.log(resp);

const jitConfig = await octokit.request(
  'POST /orgs/{org}/actions/runners/generate-jitconfig',
  {
    org: 'penxle',
    runner_group_id: 4,
    name: 'test',
    labels: ['self-hosted', 'linux', 'arm64'],
  },
);

console.log(jitConfig.data.encoded_jit_config);
