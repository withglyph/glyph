import * as aws from '@pulumi/aws';

const ecsExecution = new aws.iam.Role('__execution@ecs', {
  name: '__execution@ecs',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: 'ecs-tasks.amazonaws.com',
  }),
  managedPolicyArns: [aws.iam.ManagedPolicy.AmazonECSTaskExecutionRolePolicy],
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
          'ce:Get*',
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
          'cur:DescribeReportDefinitions',
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
          'redshift:DescribeClusterParameterGroups',
          'redshift:DescribeLoggingStatus',
          'route53:List*',
          's3:GetAccountPublicAccessBlock',
          's3:GetBucketAcl',
          's3:GetBucketLogging',
          's3:GetBucketLocation',
          's3:GetBucketNotification',
          's3:GetBucketPolicyStatus',
          's3:GetBucketPublicAccessBlock',
          's3:GetBucketTagging',
          's3:GetBucketVersioning',
          's3:GetBucketWebsite',
          's3:GetEncryptionConfiguration',
          's3:GetObject',
          's3:ListAllMyBuckets',
          's3:ListBucket',
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

const dopplerIntegration = new aws.iam.Role('doppler-integration', {
  name: 'doppler-integration',
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    AWS: '299900769157',
  }),
});

new aws.iam.RolePolicy('doppler-integration', {
  role: dopplerIntegration.name,
  policy: {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: [
          'secretsmanager:GetSecretValue',
          'secretsmanager:DescribeSecret',
          'secretsmanager:PutSecretValue',
          'secretsmanager:CreateSecret',
          'secretsmanager:DeleteSecret',
          'secretsmanager:TagResource',
          'secretsmanager:UpdateSecret',
        ],
        Resource: '*',
      },
    ],
  },
});

export const outputs = {
  AWS_IAM_ROLE_ECS_EXECUTION_ARN: ecsExecution.arn,
  AWS_IAM_ROLE_DOPPLER_INTEGRATION_ARN: dopplerIntegration.arn,
};
