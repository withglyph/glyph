import { $Enums } from '@prisma/client';
import * as enums from '$lib/server/enums';
import { defineSchema } from '../builder';

export const enumsSchema = defineSchema((builder) => {
  /**
   * * Enums
   */

  for (const [name, e] of Object.entries({ ...$Enums, ...enums })) {
    builder.enumType(e, { name });
  }
});
