import * as aws from '@pulumi/aws';
import { usEast1 } from './providers';

new aws.cur.ReportDefinition(
  'datadog',
  {
    reportName: 'datadog',

    timeUnit: 'HOURLY',
    reportVersioning: 'CREATE_NEW_REPORT',
    additionalSchemaElements: ['RESOURCES'],

    format: 'textORcsv',
    compression: 'GZIP',

    s3Region: 'ap-northeast-2',
    s3Bucket: 'penxle-artifacts',
    s3Prefix: 'billing-reports',

    refreshClosedReports: true,
  },
  { provider: usEast1 },
);
