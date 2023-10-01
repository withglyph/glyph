import { $Enums } from '@prisma/client';
import * as enums from '$lib/server/enums';
import { builder } from '../builder';

/**
 * * Enums
 */

for (const [name, e] of Object.entries({ ...$Enums, ...enums })) {
  builder.enumType(e, { name });
}
