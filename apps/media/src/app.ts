import { aws_certificatemanager, aws_lambda, aws_s3 } from 'aws-cdk-lib';
import { Api, Bucket } from 'sst/constructs';
import type { StackContext } from 'sst/constructs';

export const App = ({ stack }: StackContext) => {
  const dataBucket = new Bucket(stack, 'Data', {
    cdk: {
      bucket: aws_s3.Bucket.fromBucketArn(
        stack,
        'arn:aws:s3:::penxle-data',
        'arn:aws:s3:::penxle-data',
      ),
    },
  });

  const uploadsBucket = new Bucket(stack, 'Uploads', {
    cdk: {
      bucket: aws_s3.Bucket.fromBucketArn(
        stack,
        'arn:aws:s3:::penxle-uploads',
        'arn:aws:s3:::penxle-uploads',
      ),
    },
  });

  const sharpLayer = new aws_lambda.LayerVersion(stack, 'Sharp', {
    code: aws_lambda.Code.fromAsset('.sst/layers/sharp'),
  });

  const api = new Api(stack, 'Api', {
    routes: {
      'GET /{key+}': 'src/handlers/transform.handler',
      'POST /finalize': 'src/handlers/finalize.handler',
    },
    defaults: {
      function: {
        runtime: 'nodejs18.x',
        memorySize: '10 GB',
        timeout: '29 seconds',

        nodejs: {
          esbuild: {
            external: ['sharp'],
          },
        },

        bind: [dataBucket, uploadsBucket],
        layers: [sharpLayer],
      },
    },
    customDomain:
      stack.stage === 'prod'
        ? {
            isExternalDomain: true,
            domainName: 'media.pnxl.co',
            cdk: {
              certificate:
                aws_certificatemanager.Certificate.fromCertificateArn(
                  stack,
                  'arn:aws:acm:ap-northeast-2:721144421085:certificate/a667e24a-e7ab-4516-9530-99f6cb17ffc6',
                  'arn:aws:acm:ap-northeast-2:721144421085:certificate/a667e24a-e7ab-4516-9530-99f6cb17ffc6',
                ),
            },
          }
        : undefined,
  });

  stack.addOutputs({
    ApiEndpoint: api.customDomainUrl ?? api.url,
  });
};
