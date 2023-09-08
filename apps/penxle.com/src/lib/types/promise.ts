export type Awaitable<T> = Promise<T> | (() => Promise<T>);
export type MaybePromise<T> = Promise<T> | T;
