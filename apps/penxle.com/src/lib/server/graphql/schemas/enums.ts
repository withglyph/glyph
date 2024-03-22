import { dbEnum } from '$lib/server/database';
import * as dbEnums from '$lib/server/database/schemas/enums';
import * as enums from '$lib/server/enums';
import { builder } from '../builder';

/**
 * * Enums
 */

for (const [name, e] of Object.entries(enums)) {
  builder.enumType(e, { name });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
for (const [name, e] of Object.entries<any>(dbEnums)) {
  builder.enumType(dbEnum(e), { name });
}
