import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { buckets } from '$aws/s3';

const bunnyNet = new aws.iam.User('bunny.net', {
  name: 'bunny.net',
});

const bunnyNetAccessKey = new aws.iam.AccessKey('bunny.net', {
  user: bunnyNet.name,
});

new aws.iam.UserPolicy('bunny.net', {
  user: bunnyNet.name,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['s3:GetObject'],
        Resource: pulumi.concat(buckets.data.arn, '/*'),
      },
    ],
  },
});

const ecsExecution = new aws.iam.Role('__execution@ecs', {
  name: '__execution@ecs',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'ecs-tasks.amazonaws.com',
  }),
  managedPolicyArns: [
    'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy',
  ],
});

new aws.iam.RolePolicy('__execution@ecs', {
  role: ecsExecution.name,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['logs:CreateLogGroup'],
        Resource: '*',
      },
    ],
  },
});

const datadogIntegration = new aws.iam.Role('datadog-integration', {
  name: 'datadog-integration',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    AWS: '417141415827',
  }),
});

new aws.iam.RolePolicy('datadog-integration', {
  role: datadogIntegration.name,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Action: [
          'apigateway:GET',
          'autoscaling:Describe*',
          'backup:List*',
          'budgets:ViewBudget',
          'cloudfront:GetDistributionConfig',
          'cloudfront:ListDistributions',
          'cloudtrail:DescribeTrails',
          'cloudtrail:GetTrailStatus',
          'cloudtrail:LookupEvents',
          'cloudwatch:Describe*',
          'cloudwatch:Get*',
          'cloudwatch:List*',
          'codedeploy:List*',
          'codedeploy:BatchGet*',
          'directconnect:Describe*',
          'dynamodb:List*',
          'dynamodb:Describe*',
          'ec2:Describe*',
          'ecs:Describe*',
          'ecs:List*',
          'elasticache:Describe*',
          'elasticache:List*',
          'elasticfilesystem:DescribeFileSystems',
          'elasticfilesystem:DescribeTags',
          'elasticfilesystem:DescribeAccessPoints',
          'elasticloadbalancing:Describe*',
          'elasticmapreduce:List*',
          'elasticmapreduce:Describe*',
          'es:ListTags',
          'es:ListDomainNames',
          'es:DescribeElasticsearchDomains',
          'events:CreateEventBus',
          'fsx:DescribeFileSystems',
          'fsx:ListTagsForResource',
          'health:DescribeEvents',
          'health:DescribeEventDetails',
          'health:DescribeAffectedEntities',
          'kinesis:List*',
          'kinesis:Describe*',
          'lambda:GetPolicy',
          'lambda:List*',
          'logs:DeleteSubscriptionFilter',
          'logs:DescribeLogGroups',
          'logs:DescribeLogStreams',
          'logs:DescribeSubscriptionFilters',
          'logs:FilterLogEvents',
          'logs:PutSubscriptionFilter',
          'logs:TestMetricFilter',
          'organizations:Describe*',
          'organizations:List*',
          'rds:Describe*',
          'rds:List*',
          'redshift:DescribeClusters',
          'redshift:DescribeLoggingStatus',
          'route53:List*',
          's3:GetBucketLogging',
          's3:GetBucketLocation',
          's3:GetBucketNotification',
          's3:GetBucketTagging',
          's3:ListAllMyBuckets',
          's3:PutBucketNotification',
          'ses:Get*',
          'sns:List*',
          'sns:Publish',
          'sqs:ListQueues',
          'states:ListStateMachines',
          'states:DescribeStateMachine',
          'support:DescribeTrustedAdvisor*',
          'support:RefreshTrustedAdvisorCheck',
          'tag:GetResources',
          'tag:GetTagKeys',
          'tag:GetTagValues',
          'xray:BatchGetTraces',
          'xray:GetTraceSummaries',
        ],
        Effect: 'Allow',
        Resource: '*',
      },
    ],
  },
});

export const outputs = {
  AWS_IAM_USER_BUNNY_NET_NAME: bunnyNet.name,
  AWS_IAM_USER_BUNNY_NET_ACCESS_KEY_ID: bunnyNetAccessKey.id,
  AWS_IAM_USER_BUNNY_NET_SECRET_ACCESS_KEY: bunnyNetAccessKey.secret,

  AWS_IAM_ROLE_ECS_EXECUTION_ARN: ecsExecution.arn,
};
