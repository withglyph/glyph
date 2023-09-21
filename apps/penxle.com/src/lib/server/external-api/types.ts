import type { UserSSOProvider } from '@prisma/client';

export type ExternalUser = {
  provider: UserSSOProvider;
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
};
