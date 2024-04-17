import { stack } from '@withglyph/lib/environment';
import { createPubSub } from 'graphql-yoga';
import { nanoid } from 'nanoid';
import { building, dev } from '$app/environment';
import { pub, rabbit } from '../mq';
import { finalizeResource, setResourceFinalizer } from '../utils';
import type { TypedEventTarget } from '@graphql-yoga/typed-event-target';
import type { SynchronizePostResultType } from './schemas/post';

const key = nanoid();
const exchange = 'pubsub';
const queue = dev ? `pubsub:local:${key}` : `pubsub:${stack}:${key}`;
const routingKey = dev ? `pubsub:local:${key}` : `pubsub:${stack}`;

export const createEventTarget = async <T extends CustomEvent>(): Promise<TypedEventTarget<T>> => {
  await finalizeResource('pubsub');

  const handlersMap = new Map<string, Set<(event: T) => void>>();

  await rabbit.exchangeDeclare({ exchange, type: 'topic' });

  const sub = rabbit.createConsumer(
    {
      queue,
      queueOptions: { exclusive: true },
      queueBindings: [{ exchange, queue, routingKey }],
    },
    async (msg) => {
      const event = new CustomEvent(msg.body.name, { detail: msg.body.detail }) as T;
      const handlers = handlersMap.get(event.type);

      if (handlers) {
        for (const handler of handlers) {
          handler(event);
        }
      }
    },
  );

  setResourceFinalizer('pubsub', async () => {
    await sub.close();
  });

  return {
    addEventListener: (type, callback) => {
      if (callback) {
        const handlers = handlersMap.get(type) || new Set();
        handlers.add('handleEvent' in callback ? callback.handleEvent : callback);
        handlersMap.set(type, handlers);
      }
    },
    removeEventListener: (type, callback) => {
      if (callback) {
        const handlers = handlersMap.get(type);
        if (handlers) {
          handlers.delete('handleEvent' in callback ? callback.handleEvent : callback);
        }
      }
    },
    dispatchEvent: (event) => {
      pub.send({ exchange, routingKey }, { name: event.type, detail: event.detail });
      return true;
    },
  };
};

export const pubsub = createPubSub<{
  'post:synchronization': [postId: string, SynchronizePostResultType];
}>({
  eventTarget: building ? undefined : await createEventTarget(),
});
