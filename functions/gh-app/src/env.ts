import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const SSM = new SSMClient();

export const getEnv = async (name: string) => {
  const resp = await SSM.send(
    new GetParameterCommand({
      Name: `/github-app/${name}`,
      WithDecryption: true,
    }),
  );

  if (!resp.Parameter?.Value) {
    throw new Error(`Parameter ${name} not found`);
  }

  return resp.Parameter.Value;
};
