import type { PrismaEnums } from '$prisma';

export type ExternalUser = {
  provider: PrismaEnums.UserSingleSignOnProvider;
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
};
