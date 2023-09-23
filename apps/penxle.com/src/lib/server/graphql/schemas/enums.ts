import { $Enums } from '@prisma/client';
import { builder } from '../builder';
import * as enums from '../enums';

/**
 * * Enums
 */

for (const [name, e] of Object.entries({ ...$Enums, ...enums })) {
  builder.enumType(e, { name });
}
