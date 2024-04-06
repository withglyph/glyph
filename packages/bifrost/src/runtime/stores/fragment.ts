import type { Readable } from 'svelte/store';
import type { $StoreSchema } from '../../types';

type Kind = 'fragment';
export type FragmentStore<T extends $StoreSchema<Kind> | $StoreSchema<Kind>[]> = Readable<
  T extends (infer U extends $StoreSchema<Kind>)[]
    ? U['$output'][]
    : T extends $StoreSchema<Kind>
      ? T['$output']
      : never
>;
