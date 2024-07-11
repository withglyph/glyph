import type { MaybePromise } from '$lib/types';

export type NotificationMaker = (targetId: string) => MaybePromise<void>;
