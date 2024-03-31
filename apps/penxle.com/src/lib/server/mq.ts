import { Connection } from 'rabbitmq-client';
import { env } from '$env/dynamic/private';

export const rabbit = new Connection(env.PRIVATE_RABBITMQ_URL);

export const pub = rabbit.createPublisher({
  confirm: true,
  maxAttempts: 3,
});
