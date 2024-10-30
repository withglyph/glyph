import * as aws from '@pulumi/aws';

const admin = new aws.iam.Role('admin@team', {
  name: 'admin@team',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    AWS: '886436942314',
  }),
});

new aws.iam.RolePolicy('admin@team', {
  role: admin.name,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: '*',
        Resource: '*',
      },
    ],
  },
});

const githubActionsOidcProvider = new aws.iam.OpenIdConnectProvider('actions@github', {
  url: 'https://token.actions.githubusercontent.com',
  clientIdLists: ['sts.amazonaws.com'],
  thumbprintLists: ['ffffffffffffffffffffffffffffffffffffffff'],
});

const githubActionsRole = new aws.iam.Role('actions@github', {
  name: 'actions@github',
  assumeRolePolicy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { Federated: githubActionsOidcProvider.arn },
        Action: 'sts:AssumeRoleWithWebIdentity',
        Condition: {
          StringLike: {
            'token.actions.githubusercontent.com:sub': 'repo:penxle/*',
          },
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
        },
      },
    ],
  },
});

new aws.iam.RolePolicy('actions@github', {
  role: githubActionsRole.name,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: '*',
        Resource: '*',
      },
    ],
  },
});

export const roles = {
  admin,
  actions: githubActionsRole,
};
