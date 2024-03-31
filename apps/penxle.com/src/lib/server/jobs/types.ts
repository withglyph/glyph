export type JobFn<P = unknown> = (payload: P) => Promise<void>;

export type JobSpec<N extends string = string, P = unknown> = {
  name: N;
  fn: JobFn<P>;
};

export const defineJob = <N extends string, P>(name: N, fn: JobFn<P>): JobSpec<N, P> => {
  return { name, fn };
};
