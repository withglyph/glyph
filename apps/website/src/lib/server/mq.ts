import { Connection } from 'rabbitmq-client';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import type { Publisher } from 'rabbitmq-client';

const createRabbit = () => {
  if (building) {
    return {} as Connection;
  }

  return new Connection(env.PRIVATE_RABBITMQ_URL);
};

const createPublisher = () => {
  if (building) {
    return {} as Publisher;
  }

  return rabbit.createPublisher({
    confirm: true,
    maxAttempts: 3,
  });
};

export const rabbit = createRabbit();
export const pub = createPublisher();
