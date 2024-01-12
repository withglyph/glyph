import * as enums from '$lib/server/enums';
import { PrismaEnums } from '$prisma';
import { defineSchema } from '../builder';

export const enumsSchema = defineSchema((builder) => {
  /**
   * * Enums
   */

  for (const [name, e] of Object.entries({ ...PrismaEnums, ...enums })) {
    builder.enumType(e, { name });
  }
});
