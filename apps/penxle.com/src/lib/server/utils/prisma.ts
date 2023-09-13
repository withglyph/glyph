import * as R from 'radash';

type Query<I, S> = {
  include?: I;
  select?: S;
};

export const mergeQuery = <I0, S0, I1 extends I0, S1 extends S0>(
  query: Query<I0, S0>,
  adds: Query<I1, S1>,
) => {
  return R.assign(query, adds) as Query<I1, S1> &
    (I0 extends I1 ? unknown : { include: I1 }) &
    (S0 extends S1 ? unknown : { select: S1 });
};
